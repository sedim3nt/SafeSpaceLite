import { type Abi } from 'viem';

// Contract address — set via env var after deployment
export const SAFESPACE_REGISTRY_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000';

// ABI auto-extracted from compiled SafeSpaceRegistry.sol artifact
// To regenerate: npx hardhat compile, then copy from artifacts/
export const SafeSpaceRegistryABI = [
  // ── Events ──
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'arweaveHash', type: 'string' },
      { indexed: false, internalType: 'address', name: 'commenter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'CommentAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'oldFee', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newFee', type: 'uint256' },
    ],
    name: 'RebuttalFeeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'reportIndex', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'arweaveHash', type: 'string' },
      { indexed: false, internalType: 'address', name: 'landlord', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'RebuttalSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      {
        indexed: false,
        internalType: 'enum SafeSpaceRegistry.IssueType',
        name: 'issueType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'enum SafeSpaceRegistry.Severity',
        name: 'severity',
        type: 'uint8',
      },
      { indexed: false, internalType: 'string', name: 'arweaveHash', type: 'string' },
      { indexed: false, internalType: 'address', name: 'reporter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'ViolationReported',
    type: 'event',
  },
  // ── Read-only functions ──
  {
    inputs: [],
    name: 'COMMENT_COOLDOWN',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_COMMENTS_PER_PROPERTY',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_REPORTS_PER_PROPERTY',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REPORT_COOLDOWN',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' }],
    name: 'getCommentCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' }],
    name: 'getComments',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
          { internalType: 'string', name: 'arweaveHash', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'address', name: 'commenter', type: 'address' },
        ],
        internalType: 'struct SafeSpaceRegistry.Comment[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'reportIndex', type: 'uint256' },
    ],
    name: 'getRebuttal',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'reportIndex', type: 'uint256' },
          { internalType: 'string', name: 'arweaveHash', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'address', name: 'landlord', type: 'address' },
        ],
        internalType: 'struct SafeSpaceRegistry.Rebuttal',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' }],
    name: 'getReportCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' }],
    name: 'getReports',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
          { internalType: 'enum SafeSpaceRegistry.IssueType', name: 'issueType', type: 'uint8' },
          { internalType: 'enum SafeSpaceRegistry.Severity', name: 'severity', type: 'uint8' },
          { internalType: 'string', name: 'arweaveHash', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'address', name: 'reporter', type: 'address' },
        ],
        internalType: 'struct SafeSpaceRegistry.ViolationReport[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'hasRebuttal',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'propertyAddress', type: 'string' }],
    name: 'hashAddress',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rebuttalFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalComments',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalRebuttals',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalReports',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ── Write functions ──
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      { internalType: 'string', name: 'arweaveHash', type: 'string' },
    ],
    name: 'addComment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'newFee', type: 'uint256' }],
    name: 'setRebuttalFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'reportIndex', type: 'uint256' },
      { internalType: 'string', name: 'arweaveHash', type: 'string' },
    ],
    name: 'submitRebuttal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'propertyHash', type: 'bytes32' },
      { internalType: 'enum SafeSpaceRegistry.IssueType', name: 'issueType', type: 'uint8' },
      { internalType: 'enum SafeSpaceRegistry.Severity', name: 'severity', type: 'uint8' },
      { internalType: 'string', name: 'arweaveHash', type: 'string' },
    ],
    name: 'submitReport',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'withdraw', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const satisfies Abi;

// Maps frontend issue type strings to contract enum indices
export const IssueTypeMap: Record<string, number> = {
  mold: 0,
  radon: 1,
  'carbon-monoxide': 2,
  heating: 3,
  electrical: 4,
  plumbing: 5,
  structural: 6,
  pests: 7,
  other: 8,
};

// Maps frontend severity strings to contract enum indices
export const SeverityMap: Record<string, number> = {
  emergency: 0,
  urgent: 1,
  standard: 2,
};

// Reverse maps for display
export const IssueTypeLabels: Record<number, string> = {
  0: 'Mold/Moisture',
  1: 'Radon',
  2: 'Carbon Monoxide/Gas',
  3: 'Heating/Cooling',
  4: 'Electrical',
  5: 'Plumbing/Water',
  6: 'Structural Damage',
  7: 'Pest Infestation',
  8: 'Other',
};

export const SeverityLabels: Record<number, string> = {
  0: 'Emergency (24hr)',
  1: 'Urgent (72hr)',
  2: 'Standard',
};
