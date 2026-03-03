// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SafeSpace Registry - Immutable tenant violation reports
/// @notice Stores violation reports and comments on-chain, linked to permanent Arweave data.
///         Property addresses are stored as keccak256 hashes for privacy.
contract SafeSpaceRegistry {
    // ── Reentrancy Guard ─────────────────────────────────

    bool private _locked;

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    // ── Types ────────────────────────────────────────────

    enum IssueType {
        Mold,
        Radon,
        CarbonMonoxide,
        Heating,
        Electrical,
        Plumbing,
        Structural,
        Pests,
        Other
    }

    enum Severity {
        Emergency24h,
        Urgent72h,
        Standard
    }

    struct ViolationReport {
        bytes32 propertyHash;
        IssueType issueType;
        Severity severity;
        string arweaveHash;      // Permanent link to full report + photos on Arweave
        uint256 timestamp;
        address reporter;        // Will be address(0) when using ZK proofs (Phase 4)
    }

    struct Comment {
        bytes32 propertyHash;
        string arweaveHash;      // Permanent link to comment text on Arweave
        uint256 timestamp;
        address commenter;       // Will be address(0) when using ZK proofs (Phase 4)
    }

    struct Rebuttal {
        bytes32 propertyHash;
        uint256 reportIndex;     // Index into _propertyReports[propertyHash]
        string arweaveHash;      // Permanent link to rebuttal text on Arweave
        uint256 timestamp;
        address landlord;
    }

    // ── Storage ──────────────────────────────────────────

    /// @notice All reports, indexed by property hash
    mapping(bytes32 => ViolationReport[]) private _propertyReports;

    /// @notice All comments, indexed by property hash
    mapping(bytes32 => Comment[]) private _propertyComments;

    /// @notice Total count of reports (for frontend display)
    uint256 public totalReports;

    /// @notice Total count of comments
    uint256 public totalComments;

    // ── Anti-Bot Rate Limiting (Reports) ─────────────────

    /// @notice Cooldown: 1 report per wallet per 24 hours
    uint256 public constant REPORT_COOLDOWN = 24 hours;

    /// @notice Max reports per wallet per property (ever)
    uint256 public constant MAX_REPORTS_PER_PROPERTY = 5;

    /// @notice Last report timestamp per wallet
    mapping(address => uint256) public lastReportTime;

    /// @notice Report count per wallet per property
    mapping(address => mapping(bytes32 => uint256)) public walletPropertyReportCount;

    // ── Anti-Bot Rate Limiting (Comments) ────────────────

    /// @notice Cooldown: 1 comment per wallet per hour
    uint256 public constant COMMENT_COOLDOWN = 1 hours;

    /// @notice Max comments per wallet per property (ever)
    uint256 public constant MAX_COMMENTS_PER_PROPERTY = 20;

    /// @notice Last comment timestamp per wallet
    mapping(address => uint256) public lastCommentTime;

    /// @notice Comment count per wallet per property
    mapping(address => mapping(bytes32 => uint256)) public walletPropertyCommentCount;

    // ── Rebuttal System ──────────────────────────────────

    /// @notice Rebuttals indexed by (propertyHash, reportIndex)
    mapping(bytes32 => mapping(uint256 => Rebuttal)) private _rebuttals;

    /// @notice Track whether a rebuttal exists for a report
    mapping(bytes32 => mapping(uint256 => bool)) public hasRebuttal;

    /// @notice Total rebuttals submitted
    uint256 public totalRebuttals;

    /// @notice Fee required to submit a rebuttal (in wei)
    uint256 public rebuttalFee = 0.003 ether; // ~$10 at ~$3300/ETH

    // ── Ownership (2-step transfer) ──────────────────────

    /// @notice Contract owner (receives fees, can update fee)
    address public owner;

    /// @notice Pending owner for 2-step transfer
    address public pendingOwner;

    // ── Events (indexed for The Graph) ───────────────────

    event ViolationReported(
        bytes32 indexed propertyHash,
        IssueType issueType,
        Severity severity,
        string arweaveHash,
        address reporter,
        uint256 timestamp
    );

    event CommentAdded(
        bytes32 indexed propertyHash,
        string arweaveHash,
        address commenter,
        uint256 timestamp
    );

    event RebuttalSubmitted(
        bytes32 indexed propertyHash,
        uint256 reportIndex,
        string arweaveHash,
        address landlord,
        uint256 timestamp
    );

    event RebuttalFeeUpdated(uint256 oldFee, uint256 newFee);

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ── Constructor ──────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ── Modifiers ────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ── Report Functions ─────────────────────────────────

    /// @notice Submit a violation report for a property
    /// @param propertyHash keccak256 of the normalized property address
    /// @param issueType Type of health/safety issue
    /// @param severity Urgency level
    /// @param arweaveHash Arweave transaction hash pointing to full report data + photos
    function submitReport(
        bytes32 propertyHash,
        IssueType issueType,
        Severity severity,
        string calldata arweaveHash
    ) external {
        require(bytes(arweaveHash).length > 0, "Arweave hash required");

        // Anti-bot: 24hr cooldown per wallet
        require(
            block.timestamp >= lastReportTime[msg.sender] + REPORT_COOLDOWN,
            "Cooldown active: wait 24 hours between reports"
        );

        // Anti-bot: max 5 reports per wallet per property
        require(
            walletPropertyReportCount[msg.sender][propertyHash] < MAX_REPORTS_PER_PROPERTY,
            "Max reports reached for this property"
        );

        // Update rate limiting state
        lastReportTime[msg.sender] = block.timestamp;
        walletPropertyReportCount[msg.sender][propertyHash]++;

        ViolationReport memory report = ViolationReport({
            propertyHash: propertyHash,
            issueType: issueType,
            severity: severity,
            arweaveHash: arweaveHash,
            timestamp: block.timestamp,
            reporter: msg.sender
        });

        _propertyReports[propertyHash].push(report);
        totalReports++;

        emit ViolationReported(
            propertyHash,
            issueType,
            severity,
            arweaveHash,
            msg.sender,
            block.timestamp
        );
    }

    // ── Comment Functions ────────────────────────────────

    /// @notice Add a community comment for a property
    /// @param propertyHash keccak256 of the normalized property address
    /// @param arweaveHash Arweave transaction hash pointing to comment text
    function addComment(
        bytes32 propertyHash,
        string calldata arweaveHash
    ) external {
        require(bytes(arweaveHash).length > 0, "Arweave hash required");

        // Anti-bot: 1hr cooldown per wallet
        require(
            block.timestamp >= lastCommentTime[msg.sender] + COMMENT_COOLDOWN,
            "Comment cooldown active: wait 1 hour between comments"
        );

        // Anti-bot: max 20 comments per wallet per property
        require(
            walletPropertyCommentCount[msg.sender][propertyHash] < MAX_COMMENTS_PER_PROPERTY,
            "Max comments reached for this property"
        );

        // Update rate limiting state
        lastCommentTime[msg.sender] = block.timestamp;
        walletPropertyCommentCount[msg.sender][propertyHash]++;

        Comment memory comment = Comment({
            propertyHash: propertyHash,
            arweaveHash: arweaveHash,
            timestamp: block.timestamp,
            commenter: msg.sender
        });

        _propertyComments[propertyHash].push(comment);
        totalComments++;

        emit CommentAdded(
            propertyHash,
            arweaveHash,
            msg.sender,
            block.timestamp
        );
    }

    // ── Rebuttal Functions ───────────────────────────────

    /// @notice Submit a paid rebuttal to a specific violation report
    /// @param propertyHash keccak256 of the normalized property address
    /// @param reportIndex Index of the report being rebutted
    /// @param arweaveHash Arweave transaction hash pointing to rebuttal text
    function submitRebuttal(
        bytes32 propertyHash,
        uint256 reportIndex,
        string calldata arweaveHash
    ) external payable nonReentrant {
        require(bytes(arweaveHash).length > 0, "Arweave hash required");
        require(msg.value >= rebuttalFee, "Insufficient rebuttal fee");
        require(
            reportIndex < _propertyReports[propertyHash].length,
            "Report does not exist"
        );
        require(
            !hasRebuttal[propertyHash][reportIndex],
            "Rebuttal already submitted for this report"
        );

        _rebuttals[propertyHash][reportIndex] = Rebuttal({
            propertyHash: propertyHash,
            reportIndex: reportIndex,
            arweaveHash: arweaveHash,
            timestamp: block.timestamp,
            landlord: msg.sender
        });

        hasRebuttal[propertyHash][reportIndex] = true;
        totalRebuttals++;

        emit RebuttalSubmitted(
            propertyHash,
            reportIndex,
            arweaveHash,
            msg.sender,
            block.timestamp
        );

        // Refund excess payment
        uint256 excess = msg.value - rebuttalFee;
        if (excess > 0) {
            (bool refunded, ) = msg.sender.call{value: excess}("");
            require(refunded, "Refund failed");
        }
    }

    // ── Owner Functions ──────────────────────────────────

    /// @notice Withdraw collected rebuttal fees
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool sent, ) = owner.call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    /// @notice Update the rebuttal fee
    /// @param newFee New fee in wei
    function setRebuttalFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = rebuttalFee;
        rebuttalFee = newFee;
        emit RebuttalFeeUpdated(oldFee, newFee);
    }

    /// @notice Start ownership transfer (2-step for safety)
    /// @param newOwner Address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Accept ownership transfer (must be called by pending owner)
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        emit OwnershipTransferred(owner, pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    // ── View Functions ───────────────────────────────────

    /// @notice Get all violation reports for a property
    function getReports(bytes32 propertyHash)
        external
        view
        returns (ViolationReport[] memory)
    {
        return _propertyReports[propertyHash];
    }

    /// @notice Get the number of reports for a property
    function getReportCount(bytes32 propertyHash)
        external
        view
        returns (uint256)
    {
        return _propertyReports[propertyHash].length;
    }

    /// @notice Get all comments for a property
    function getComments(bytes32 propertyHash)
        external
        view
        returns (Comment[] memory)
    {
        return _propertyComments[propertyHash];
    }

    /// @notice Get the number of comments for a property
    function getCommentCount(bytes32 propertyHash)
        external
        view
        returns (uint256)
    {
        return _propertyComments[propertyHash].length;
    }

    /// @notice Get the rebuttal for a specific report (if any)
    function getRebuttal(bytes32 propertyHash, uint256 reportIndex)
        external
        view
        returns (Rebuttal memory)
    {
        require(hasRebuttal[propertyHash][reportIndex], "No rebuttal for this report");
        return _rebuttals[propertyHash][reportIndex];
    }

    // ── Utility ──────────────────────────────────────────

    /// @notice Hash a property address (convenience for frontend)
    /// @param propertyAddress The normalized property address string
    function hashAddress(string calldata propertyAddress)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(propertyAddress));
    }

    /// @notice Reject direct ETH sends (must use submitRebuttal)
    receive() external payable {
        revert("Use submitRebuttal() to send ETH");
    }
}
