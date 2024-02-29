import { deployLockWithRewardContractsWithDefaultTokens } from '../shared/global';

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
