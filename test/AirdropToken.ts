import {
  time,
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { ethers } from 'hardhat';
import { BigNumberish } from 'ethers';
import { expect } from 'chai';

describe('AirdropToken', function () {
  it('Should deploy', async function () {
    const name: string = 'Token1';
    const symbol: string = 'TT1';
    const cap: BigNumberish = ethers.parseEther('1000000'); // 1 million;

    // Contracts are deployed using the first signer/account by default
    // const [owner, otherAccount] = await ethers.getSigners();

    const AirdropToken = await ethers.getContractFactory('AirdropToken');
    const airdropToken = await AirdropToken.deploy(name, symbol, cap);

    expect(await airdropToken.cap()).to.equal(cap);
  });
});
