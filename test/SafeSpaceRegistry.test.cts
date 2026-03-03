const { expect } = require('chai');
const { ethers, network } = require('hardhat');

describe('SafeSpaceRegistry', function () {
  let registry: any;
  let propertyHash: string;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;

  // Helper: advance blockchain time by seconds
  async function advanceTime(seconds: number) {
    await network.provider.send('evm_increaseTime', [seconds]);
    await network.provider.send('evm_mine');
  }

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const SafeSpaceRegistry = await ethers.getContractFactory('SafeSpaceRegistry');
    registry = await SafeSpaceRegistry.deploy();
    await registry.waitForDeployment();

    // Hash a sample property address
    propertyHash = ethers.keccak256(
      ethers.solidityPacked(['string'], ['1234 pearl st boulder co 80302'])
    );
  });

  // ── Report Tests ───────────────────────────────────────

  describe('submitReport', function () {
    it('should store a violation report', async function () {
      await registry.submitReport(
        propertyHash,
        0, // IssueType.Mold
        1, // Severity.Urgent72h
        'arweave-hash-abc123'
      );

      const reports = await registry.getReports(propertyHash);
      expect(reports.length).to.equal(1);
      expect(reports[0].arweaveHash).to.equal('arweave-hash-abc123');
      expect(reports[0].issueType).to.equal(0n); // Mold
      expect(reports[0].severity).to.equal(1n); // Urgent72h
    });

    it('should emit ViolationReported event', async function () {
      await expect(registry.submitReport(propertyHash, 0, 1, 'arweave-hash-abc123')).to.emit(
        registry,
        'ViolationReported'
      );
    });

    it('should increment totalReports', async function () {
      expect(await registry.totalReports()).to.equal(0n);

      // First report from addr1
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash1');
      expect(await registry.totalReports()).to.equal(1n);

      // Second report from addr2 (different wallet, no cooldown issue)
      await registry.connect(addr2).submitReport(propertyHash, 3, 0, 'hash2');
      expect(await registry.totalReports()).to.equal(2n);
    });

    it('should reject empty arweave hash', async function () {
      await expect(registry.submitReport(propertyHash, 0, 1, '')).to.be.revertedWith(
        'Arweave hash required'
      );
    });

    it('should store multiple reports for same property from different wallets', async function () {
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash1');
      await registry.connect(addr2).submitReport(propertyHash, 3, 0, 'hash2');

      const reports = await registry.getReports(propertyHash);
      expect(reports.length).to.equal(2);
    });
  });

  // ── Comment Tests ──────────────────────────────────────

  describe('addComment', function () {
    it('should store a comment', async function () {
      await registry.addComment(propertyHash, 'comment-arweave-hash');

      const comments = await registry.getComments(propertyHash);
      expect(comments.length).to.equal(1);
      expect(comments[0].arweaveHash).to.equal('comment-arweave-hash');
    });

    it('should emit CommentAdded event', async function () {
      await expect(registry.addComment(propertyHash, 'comment-hash')).to.emit(
        registry,
        'CommentAdded'
      );
    });

    it('should increment totalComments', async function () {
      expect(await registry.totalComments()).to.equal(0n);

      await registry.addComment(propertyHash, 'hash1');
      expect(await registry.totalComments()).to.equal(1n);
    });

    it('should reject empty arweave hash', async function () {
      await expect(registry.addComment(propertyHash, '')).to.be.revertedWith(
        'Arweave hash required'
      );
    });
  });

  // ── Comment Rate Limiting ──────────────────────────────

  describe('comment rate limiting', function () {
    it('should reject a second comment within 1 hour from same wallet', async function () {
      await registry.connect(addr1).addComment(propertyHash, 'c1');

      await expect(registry.connect(addr1).addComment(propertyHash, 'c2')).to.be.revertedWith(
        'Comment cooldown active: wait 1 hour between comments'
      );
    });

    it('should allow a second comment after 1 hour from same wallet', async function () {
      await registry.connect(addr1).addComment(propertyHash, 'c1');

      await advanceTime(3601); // 1 hour + 1 second

      await registry.connect(addr1).addComment(propertyHash, 'c2');
      expect(await registry.totalComments()).to.equal(2n);
    });

    it('should allow different wallets to comment within 1 hour', async function () {
      await registry.connect(addr1).addComment(propertyHash, 'c1');
      await registry.connect(addr2).addComment(propertyHash, 'c2');

      expect(await registry.totalComments()).to.equal(2n);
    });

    it('should reject after 20 comments from same wallet on same property', async function () {
      for (let i = 0; i < 20; i++) {
        await registry.connect(addr1).addComment(propertyHash, `c${i}`);
        if (i < 19) await advanceTime(3601);
      }

      await advanceTime(3601);
      await expect(registry.connect(addr1).addComment(propertyHash, 'c20')).to.be.revertedWith(
        'Max comments reached for this property'
      );
    });

    it('should allow same wallet to comment on different properties', async function () {
      const propertyHash2 = ethers.keccak256(
        ethers.solidityPacked(['string'], ['5678 broadway boulder co 80302'])
      );

      await registry.connect(addr1).addComment(propertyHash, 'c1');
      await advanceTime(3601);
      await registry.connect(addr1).addComment(propertyHash2, 'c2');

      expect(await registry.getCommentCount(propertyHash)).to.equal(1n);
      expect(await registry.getCommentCount(propertyHash2)).to.equal(1n);
    });
  });

  // ── View Function Tests ────────────────────────────────

  describe('view functions', function () {
    it('should return empty arrays for unknown properties', async function () {
      const unknownHash = ethers.keccak256(ethers.solidityPacked(['string'], ['unknown address']));

      const reports = await registry.getReports(unknownHash);
      expect(reports.length).to.equal(0);

      const comments = await registry.getComments(unknownHash);
      expect(comments.length).to.equal(0);
    });

    it('should return correct counts', async function () {
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'r1');
      await registry.connect(addr2).submitReport(propertyHash, 3, 0, 'r2');
      await registry.addComment(propertyHash, 'c1');

      expect(await registry.getReportCount(propertyHash)).to.equal(2n);
      expect(await registry.getCommentCount(propertyHash)).to.equal(1n);
    });
  });

  // ── Report Rate Limiting ───────────────────────────────

  describe('report rate limiting', function () {
    it('should reject a second report within 24 hours from same wallet', async function () {
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash1');

      await expect(
        registry.connect(addr1).submitReport(propertyHash, 3, 0, 'hash2')
      ).to.be.revertedWith('Cooldown active: wait 24 hours between reports');
    });

    it('should allow a second report after 24 hours from same wallet', async function () {
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash1');

      // Advance time by 24 hours + 1 second
      await advanceTime(24 * 60 * 60 + 1);

      await registry.connect(addr1).submitReport(propertyHash, 3, 0, 'hash2');
      expect(await registry.totalReports()).to.equal(2n);
    });

    it('should allow different wallets to report within 24 hours', async function () {
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash1');
      await registry.connect(addr2).submitReport(propertyHash, 3, 0, 'hash2');

      expect(await registry.totalReports()).to.equal(2n);
    });

    it('should reject after 5 reports from same wallet on same property', async function () {
      // Submit 5 reports (advancing time between each)
      for (let i = 0; i < 5; i++) {
        await registry.connect(addr1).submitReport(propertyHash, 0, 1, `hash${i}`);
        if (i < 4) await advanceTime(24 * 60 * 60 + 1);
      }

      // 6th should fail even after cooldown
      await advanceTime(24 * 60 * 60 + 1);
      await expect(
        registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash5')
      ).to.be.revertedWith('Max reports reached for this property');
    });

    it('should allow same wallet to report different properties', async function () {
      const propertyHash2 = ethers.keccak256(
        ethers.solidityPacked(['string'], ['5678 broadway boulder co 80302'])
      );

      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'hash1');
      await advanceTime(24 * 60 * 60 + 1);
      await registry.connect(addr1).submitReport(propertyHash2, 3, 0, 'hash2');

      expect(await registry.getReportCount(propertyHash)).to.equal(1n);
      expect(await registry.getReportCount(propertyHash2)).to.equal(1n);
    });
  });

  // ── Rebuttal Tests ─────────────────────────────────────

  describe('submitRebuttal', function () {
    beforeEach(async function () {
      // Submit a report so there's something to rebut
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'report-hash');
    });

    it('should store a rebuttal with correct fee', async function () {
      const fee = await registry.rebuttalFee();
      await registry
        .connect(addr2)
        .submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: fee });

      const rebuttal = await registry.getRebuttal(propertyHash, 0);
      expect(rebuttal.arweaveHash).to.equal('rebuttal-hash');
      expect(rebuttal.landlord).to.equal(addr2.address);
    });

    it('should emit RebuttalSubmitted event', async function () {
      const fee = await registry.rebuttalFee();
      await expect(
        registry.connect(addr2).submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: fee })
      ).to.emit(registry, 'RebuttalSubmitted');
    });

    it('should increment totalRebuttals', async function () {
      expect(await registry.totalRebuttals()).to.equal(0n);
      const fee = await registry.rebuttalFee();
      await registry
        .connect(addr2)
        .submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: fee });
      expect(await registry.totalRebuttals()).to.equal(1n);
    });

    it('should reject insufficient fee', async function () {
      await expect(
        registry.connect(addr2).submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: 0 })
      ).to.be.revertedWith('Insufficient rebuttal fee');
    });

    it('should reject empty arweave hash', async function () {
      const fee = await registry.rebuttalFee();
      await expect(
        registry.connect(addr2).submitRebuttal(propertyHash, 0, '', { value: fee })
      ).to.be.revertedWith('Arweave hash required');
    });

    it('should reject rebuttal for nonexistent report', async function () {
      const fee = await registry.rebuttalFee();
      await expect(
        registry.connect(addr2).submitRebuttal(propertyHash, 99, 'rebuttal-hash', { value: fee })
      ).to.be.revertedWith('Report does not exist');
    });

    it('should reject duplicate rebuttal for same report', async function () {
      const fee = await registry.rebuttalFee();
      await registry.connect(addr2).submitRebuttal(propertyHash, 0, 'rebuttal-1', { value: fee });
      await expect(
        registry.connect(addr2).submitRebuttal(propertyHash, 0, 'rebuttal-2', { value: fee })
      ).to.be.revertedWith('Rebuttal already submitted for this report');
    });

    it('should refund excess payment', async function () {
      const fee = await registry.rebuttalFee();
      const excess = ethers.parseEther('0.001');
      const overpayment = fee + excess;

      const balanceBefore = await ethers.provider.getBalance(addr2.address);
      const tx = await registry
        .connect(addr2)
        .submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(addr2.address);

      // Balance should decrease by exactly (fee + gas), not (fee + excess + gas)
      const spent = balanceBefore - balanceAfter;
      expect(spent).to.equal(fee + gasUsed);
    });
  });

  // ── Owner Function Tests ───────────────────────────────

  describe('owner functions', function () {
    it('should allow owner to withdraw fees', async function () {
      // Submit a report then a rebuttal to generate fees
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'report-hash');
      const fee = await registry.rebuttalFee();
      await registry
        .connect(addr2)
        .submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: fee });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await registry.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter + gasUsed - balanceBefore).to.equal(fee);
    });

    it('should reject withdraw from non-owner', async function () {
      await expect(registry.connect(addr1).withdraw()).to.be.revertedWith('Only owner');
    });

    it('should reject withdraw with no balance', async function () {
      await expect(registry.connect(owner).withdraw()).to.be.revertedWith('No balance to withdraw');
    });

    it('should allow owner to update rebuttal fee', async function () {
      const newFee = ethers.parseEther('0.005');
      await expect(registry.connect(owner).setRebuttalFee(newFee)).to.emit(
        registry,
        'RebuttalFeeUpdated'
      );
      expect(await registry.rebuttalFee()).to.equal(newFee);
    });

    it('should reject fee update from non-owner', async function () {
      await expect(
        registry.connect(addr1).setRebuttalFee(ethers.parseEther('0.005'))
      ).to.be.revertedWith('Only owner');
    });
  });

  // ── Ownership Transfer Tests ───────────────────────────

  describe('ownership transfer', function () {
    it('should allow owner to start transfer', async function () {
      await expect(registry.connect(owner).transferOwnership(addr1.address))
        .to.emit(registry, 'OwnershipTransferStarted')
        .withArgs(owner.address, addr1.address);

      expect(await registry.pendingOwner()).to.equal(addr1.address);
      // Owner should still be original until accepted
      expect(await registry.owner()).to.equal(owner.address);
    });

    it('should allow pending owner to accept', async function () {
      await registry.connect(owner).transferOwnership(addr1.address);

      await expect(registry.connect(addr1).acceptOwnership())
        .to.emit(registry, 'OwnershipTransferred')
        .withArgs(owner.address, addr1.address);

      expect(await registry.owner()).to.equal(addr1.address);
      expect(await registry.pendingOwner()).to.equal(ethers.ZeroAddress);
    });

    it('should reject transfer from non-owner', async function () {
      await expect(registry.connect(addr1).transferOwnership(addr2.address)).to.be.revertedWith(
        'Only owner'
      );
    });

    it('should reject accept from non-pending owner', async function () {
      await registry.connect(owner).transferOwnership(addr1.address);

      await expect(registry.connect(addr2).acceptOwnership()).to.be.revertedWith(
        'Not pending owner'
      );
    });

    it('should reject transfer to zero address', async function () {
      await expect(
        registry.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid new owner');
    });

    it('new owner should be able to withdraw', async function () {
      // Generate fees
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'report-hash');
      const fee = await registry.rebuttalFee();
      await registry
        .connect(addr2)
        .submitRebuttal(propertyHash, 0, 'rebuttal-hash', { value: fee });

      // Transfer ownership
      await registry.connect(owner).transferOwnership(addr3.address);
      await registry.connect(addr3).acceptOwnership();

      // New owner withdraws
      await expect(registry.connect(addr3).withdraw()).to.not.be.reverted;

      // Old owner cannot withdraw
      await expect(registry.connect(owner).withdraw()).to.be.revertedWith('Only owner');
    });
  });

  // ── Rebuttal View Tests ────────────────────────────────

  describe('getRebuttal', function () {
    it('should revert for report with no rebuttal', async function () {
      await registry.connect(addr1).submitReport(propertyHash, 0, 1, 'report-hash');
      await expect(registry.getRebuttal(propertyHash, 0)).to.be.revertedWith(
        'No rebuttal for this report'
      );
    });
  });

  // ── Receive Guard Tests ────────────────────────────────

  describe('receive guard', function () {
    it('should reject direct ETH sends', async function () {
      const contractAddress = await registry.getAddress();
      await expect(
        owner.sendTransaction({ to: contractAddress, value: ethers.parseEther('0.01') })
      ).to.be.revertedWith('Use submitRebuttal() to send ETH');
    });
  });

  // ── Hash Address Tests ─────────────────────────────────

  describe('hashAddress', function () {
    it('should produce consistent hashes', async function () {
      const hash1 = await registry.hashAddress('1234 pearl st boulder co 80302');
      const hash2 = await registry.hashAddress('1234 pearl st boulder co 80302');
      expect(hash1).to.equal(hash2);
    });

    it('should produce different hashes for different addresses', async function () {
      const hash1 = await registry.hashAddress('1234 pearl st');
      const hash2 = await registry.hashAddress('5678 broadway');
      expect(hash1).to.not.equal(hash2);
    });

    it('should match ethers.js keccak256', async function () {
      const onChainHash = await registry.hashAddress('1234 pearl st boulder co 80302');
      const localHash = ethers.keccak256(
        ethers.solidityPacked(['string'], ['1234 pearl st boulder co 80302'])
      );
      expect(onChainHash).to.equal(localHash);
    });
  });
});
