import {
  time,
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  NINE_HUNDRED_THOUSAND,
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
        UNIX_TIME_IN_SECOND + 10000,
        UNIX_TIME_IN_SECOND + 100000,
        {
          from: contractOwner.address,
        },
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

  beforeEach(async function () {
    [contract, underlying, rewardToken, contractOwner, contractAdmin, tester] =
      await loadFixture(deployLockWithRewards);
  });

  describe('Deployment', async function () {
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
    it('Admin can change time', async function () {
      console.log(await contract.startTime());
      console.log(await contract.endTime());

      const startTime = UNIX_TIME_IN_SECOND + 1000;
      const endTime = UNIX_TIME_IN_SECOND + 100000;
      await contract.connect(contractAdmin).setTime(startTime, endTime);
    });
  });
});

