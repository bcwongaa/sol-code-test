<script setup lang="ts">
import Timer from './components/Timer.vue';
import Board from './components/Board.vue';
import Information from './components/Information.vue';\
import * as fs from 'fs'
// import { USDTAbi } from '../abi/USDTAbi'

const contractJSON = fs.readFileSync('../../artifacts/contracts/LockWithReward.sol/LockWithReward.json');
const contractData = JSON.parse(contractJSON.toString());



// const data = readContract({
//   abi: USDTAbi,
//   address: USDTAddress,
//   functionName: 'symbol'
// })
</script>

<template>
  <Timer startTime="startTime" endTime="endTime" />
  <Board />
  <Information />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

