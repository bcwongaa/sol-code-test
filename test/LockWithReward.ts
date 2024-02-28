import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  ONE_DAY,
  ONE_HUNDRED_THOUSAND,
  ONE_MILLION,
  ONE_TRILLION,
  UNIX_TIME_IN_SECOND,
} from '../shared/global';

describe('LockWithReward', function () {
  async function deployLockWithRewards() {
    const [erc20Owner, contractOwner, contractAdmin, tester] =
      await ethers.getSigners();

    const cap = ONE_TRILLION;
    const underlyingTokenFactory = await ethers.getContractFactory(
      'AirdropToken',
      erc20Owner,
    );
    const rewardTokenFactory = await ethers.getContractFactory(
      'AirdropToken',
      erc20Owner,
    );
    const underlying = await underlyingTokenFactory
      .connect(erc20Owner)
      .deploy('Underlying Token', 'USDX', cap);
    const rewardToken = await rewardTokenFactory
      .connect(erc20Owner)
      .deploy('Reward Token', 'BONUS', cap);

    await underlying.mint(erc20Owner.address, ONE_MILLION);
    await underlying.approve(erc20Owner.address, ONE_MILLION);
    await underlying.transferFrom(
      erc20Owner.address,
      contractOwner.address,
      ONE_HUNDRED_THOUSAND,
    );
    await underlying.transferFrom(
      erc20Owner.address,
      contractAdmin.address,
      ONE_HUNDRED_THOUSAND,
    );
    await underlying.transferFrom(
      erc20Owner.address,
      tester.address,
      ONE_HUNDRED_THOUSAND,
    );

    await rewardToken.mint(erc20Owner.address, ONE_MILLION);
    await rewardToken.approve(erc20Owner.address, ONE_MILLION);
    await rewardToken.transferFrom(
      erc20Owner.address,
      contractOwner.address,
      ONE_MILLION,
    );

    const contractFactory = await ethers.getContractFactory(
      'LockWithReward',
      contractOwner,
    );

    const contract = await contractFactory
      .connect(contractOwner)
      .deploy(
        await underlying.getAddress(),
        await rewardToken.getAddress(),
        BigInt(UNIX_TIME_IN_SECOND + 10000),
        BigInt(UNIX_TIME_IN_SECOND + 100000),
      );

    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    await contract
      .connect(contractOwner)
      .grantRole(ADMIN_ROLE, contractAdmin.address);

    return [
      contract,
      underlying,
      rewardToken,
      contractOwner,
      contractAdmin,
      tester,
    ];
  }

  let contract: any;
  let underlying: any;
  let rewardToken: any;
  let contractOwner: any;
  let contractAdmin: any;
  let tester: any;

  describe('Deployment', async function () {
    beforeEach(async () => {
      [
        contract,
        underlying,
        rewardToken,
        contractOwner,
        contractAdmin,
        tester,
      ] = await loadFixture(deployLockWithRewards);
    });

    it('Underlying address matching', async function () {
      expect(await contract.underlying()).to.equal(
        await underlying.getAddress(),
      );
    });

    it('Reward Token address matching', async function () {
      expect(await contract.rewardToken()).to.equal(
        await rewardToken.getAddress(),
      );
    });

    it('Contract Owner address matching', async function () {
      expect(await contract.owner()).to.equal(await contractOwner.getAddress());
    });
  });

  describe('Admin Actions', async function () {
    beforeEach(async () => {
      [
        contract,
        underlying,
        rewardToken,
        contractOwner,
        contractAdmin,
        tester,
      ] = await loadFixture(deployLockWithRewards);
    });

    it('Admin can change time', async function () {
      const startTime = BigInt(UNIX_TIME_IN_SECOND + 100000);
      const endTime = BigInt(UNIX_TIME_IN_SECOND + 10000000);
      await contract.connect(contractAdmin).setTime(startTime, endTime);
      expect(await contract.startTime()).to.equal(startTime);
      expect(await contract.endTime()).to.equal(endTime);
    });

    it('Admin can change amount threshold', async function () {
      const mantissa = await contract.mantissa();
      const [level1AmountThreshold, level2AmountThreshold] = [
        BigInt(150) * mantissa,
        BigInt(3000) * mantissa,
      ];
      await contract
        .connect(contractAdmin)
        .setLevelAmountThreshold(level1AmountThreshold, level2AmountThreshold);

      expect(await contract.level1AmountThreshold()).to.equal(
        level1AmountThreshold,
      );
      expect(await contract.level2AmountThreshold()).to.equal(
        level2AmountThreshold,
      );
    });

    it('Admin can change lock time threshold', async function () {
      const [level1LockTime, level2LockTime] = [
        BigInt(ONE_DAY * 7),
        BigInt(ONE_DAY * 14),
      ];
      await contract
        .connect(contractAdmin)
        .setLevelLockTime(level1LockTime, level2LockTime);

      expect(await contract.level1LockTime()).to.equal(level1LockTime);
      expect(await contract.level2LockTime()).to.equal(level2LockTime);
    });

    it('Admin cannot change configuration after start time has passed', async function () {
      const newStartTime = BigInt(UNIX_TIME_IN_SECOND);
      const newEndTime = BigInt(UNIX_TIME_IN_SECOND + 1000);
      expect(
        await contract.connect(contractAdmin).setTime(newStartTime, newEndTime),
      ).to.reverted;
    });
  });
});
