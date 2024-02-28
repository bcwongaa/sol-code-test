import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ONE_MILLION } from '../shared/global';

describe('AirdropToken', function () {
  it('Cap should be one million', async function () {
    const name: string = 'Token1';
    const symbol: string = 'TT1';
    const cap = ONE_MILLION; // 1 million;

    const AirdropToken = await ethers.getContractFactory('AirdropToken');
    const airdropToken = await AirdropToken.deploy(name, symbol, cap);

    expect(await airdropToken.cap()).to.equal(cap);
  });
});

