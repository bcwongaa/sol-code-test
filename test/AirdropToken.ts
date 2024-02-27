import {
  time,
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumberish } from 'ethers';

describe('AirdropToken', function () {
  async function deployTokenContract() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    const name: string = 'Token1';
    const symbol: string = 'TT1';
    const cap: BigNumberish = 1e24; // 1million;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const AirdropToken = await ethers.getContractFactory('AirdropToken');
    const airdropToken = await AirdropToken.deploy(name, symbol, cap);

    return { airdropToken, name, symbol, cap. owner, otherAccount };
  }
});

