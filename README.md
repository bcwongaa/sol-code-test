# Satori Research Code Test - Solidity

# Skills Test

> A smart contract to lock token A and claim token B

## Requirements:

User should be able to lock an ERC20 token (token A), and after a given time, they can claim another ERC20 token (token B)

### Details:

1. Only the admin can set the `start time` and `end time`
2. A function to transfer and lock token A (only working between start time and end time)
3. There are 3 lock & claim ratio, and the admin should be able to set the amount of each level

   1. Level 1 (`500`): Lock amount < 500 → claim ratio 1 : 1
   2. Level 2 (`2000`): Lock amount ≥ 500 && < 2000 → claim ratio 1 : 1.5
   3. Level 3: Lock amount > 2000 → claim ratio 1 : 1.75

   The amount `500` & `2000` are changeable by the admin

4. There are 3 levels of lock days (until the end time) that users can claim extra token B

   1. Level 1 (`10` days): Lock less than 10 day → no extra tokens
   2. Level 2 (`20` days): Lock days ≥ 10 && < 20 → extra 20%
   3. Level 3: Lock days ≥ 20 day → extra 30%

   The day `10` & `20` are changeable by the admin

   You should consider that a user may lock different amount of token A multiple times

5. A getter function to calculate and show how many claimable token B of an address
6. A function to claim token B (not working before end time)
7. All configurable parameters **cannot** be changed after start time
8. Please write some test cases using `hardhat-waffle` (100% coverage is not required)

### Sample ERC20 token codes

- `SampleToken.sol`
  ```solidity
  // SPDX-License-Identifier: MIT

  pragma solidity ^0.8.20;

  import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";

  /// @title Generic ERC20 token
  contract AirdropToken is ERC20Capped, Ownable {

      /// @param name Token name
      /// @param symbol Token symbol
      /// @param cap Define a limit for the total supply
      constructor(string memory name, string memory symbol, uint256 cap) ERC20(name, symbol)
      ERC20Capped(cap) Ownable(msg.sender) {}

      /// @notice Mint new tokens.
      /// @dev Only owner can perform this transaction.
      /// @param account Account to which tokens will be minted
      /// @param amount Amount of tokens to be minted
      function mint(address account, uint256 amount) public onlyOwner {
          super._mint(account, amount);
      }

      /// @notice Burn tokens.
      /// @dev Only owner can perform this transaction.
      /// @param amount Amount of tokens to be burned
      function burn(uint256 amount) public onlyOwner {
          super._burn(msg.sender, amount);
      }
  }
  ```

## Bonus points (not a must)

Build a simple frontend to interact with the smart contract, beautiful UI/UX is not required

### Requirements:

1. Before start, display start time countdown
2. After start and before end, display end time countdown
3. A button with input field to lock token A
4. A button to claim token B
5. Display the number of locked token A and claimable token B
6. Disable all buttons before start time and after end time

### Tech stack:

- Vue3 with Vite
- `@web3modal/wagmi` for connecting wallets

### Reference:

- WalletConnect Doc: https://docs.walletconnect.com/web3modal/vue/about?platform=wagmi
- Vite Doc: https://vitejs.dev/guide/
