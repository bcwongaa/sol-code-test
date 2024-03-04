import { ethers } from 'hardhat';
import { deployLockWithRewardContractsWithDefaultTokens } from '../shared/global';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function readContracts(contractName: string, chainId: number) {
  // deploy the contract
  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy();

  fs.copyFileSync(
    path.join(
      __dirname,
      '../artifacts/contracts/' +
        contractName +
        '.sol/' +
        contractName +
        '.json',
    ), //source
    path.join(__dirname, '../frontend/src/contracts/' + contractName + '.json'), // destination
  );

  // check if addresses.json already exists
  let exists = fs.existsSync(
    path.join(__dirname, '../frontend/src/contracts/addresses.json'),
  );

  // if not, created the file
  if (!exists) {
    fs.writeFileSync(
      path.join(__dirname, '../frontend/src/contracts/addresses.json'),
      '{}',
    );
  }
  // update the addresses.json file with the new contract address
  let addressesFile = fs.readFileSync(
    path.join(__dirname, '../frontend/src/contracts/addresses.json'),
  );
  let addressesJson = JSON.parse(addressesFile as unknown as string);

  if (!addressesJson[contractName]) {
    addressesJson[contractName] = {};
  }

  // @ts-ignore
  addressesJson[contractName][chainId] = contract.address;

  fs.writeFileSync(
    path.join(__dirname, '../frontend/src/contracts/addresses.json'),
    JSON.stringify(addressesJson),
  );
}

async function main() {
  const [
    contract,
    underlying,
    rewardToken,
    contractOwner,
    contractAdmin,
    user,
  ] = await deployLockWithRewardContractsWithDefaultTokens();

  console.log(await contract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
