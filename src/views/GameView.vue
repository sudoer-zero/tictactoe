<template>
  <div class="flex justify-center py-20">
    <div class="text-center">
      <h1 class="text-4xl font-bold">Tic Tac Toe</h1>
      <p class="text-gray-600 text-sm mb-4">The Multiplayer Mode</p>

      <div v-if="isLoading" class="py-10">
        <Spinner />
        <p class="text-gray-600 text-sm mb-4 italic">Logging in...</p>
      </div>

      <div v-else>
        <div class="text-2xl font-bold py-10" v-show="!isJoined">
          Animated Logo
        </div>

        <div v-if="isWaiting && isJoined" class="py-10">
          <Spinner />
          <p class="text-gray-600 text-sm mb-4 italic">
            Waiting for other player
          </p>
          <LinkCard />
        </div>

        <button
          v-if="!isJoined"
          @click="joinSession"
          :disabled="isPushed"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm"
        >
          {{ isPushed ? "CONNECTING" : "CONNECT" }}
        </button>
        <div v-if="isDraw == null">
          <div v-if="isLoser != null">
            <div
              class="rounded-lg shadow-lg bg-green-100 text-center py-16 px-16"
            >
              <p class="text-gray-600 text-sm mb-4 italic">Congrats</p>
              <h1 class="text-4xl font-bold text-gray-800">YOU WON THE GAME</h1>
            </div>
          </div>

          <div v-show="isLoser == null && isWinner == true">
            <div
              class="rounded-lg shadow-lg bg-red-100 text-center py-16 px-16"
            >
              <p class="text-gray-600 text-sm mb-4 italic">Hard Luck</p>
              <h1 class="text-4xl font-bold text-gray-800">
                YOU LOST THE GAME
              </h1>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="rounded-lg shadow-lg bg-gray-100 text-center py-16 px-16">
            <p class="text-gray-600 text-sm mb-4 italic">IT'S A DRAW</p>
            <h1 class="text-4xl font-bold text-gray-800">
              NO ONE WON THE GAME
            </h1>
          </div>
        </div>

        <div v-if="signals">
          <div
            v-show="mergedSignals.length > 0 && !isWinner && !isDraw"
            class="bg-gray-800 text-white py-2 px-4 rounded-lg shadow-md text-sm mb-3"
          >
            {{ isOpponentTurn ? "Opponent's Turn" : "Your Turn" }}
          </div>
          <div class="board" v-show="!isWinner">
            <div
              v-for="(cell, index) in mergedSignals"
              :style="{
                'pointer-events':
                  cell !== null || isOpponentTurn ? 'none' : 'auto',
              }"
              :key="index"
              @click="makeMove(index)"
            >
              {{ cell }}
            </div>
          </div>
        </div>

        <div v-show="isStarting" class="py-10">
          <Spinner />
          <p class="text-gray-600 text-sm mb-4 italic">Starting...</p>
        </div>

        <div v-if="isPlayerJoined">
          <button
            v-show="mergedSignals.length == 0"
            @click="startPlaying"
            :disabled="isStarting"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 my-4 rounded-full text-sm"
          >
            START GAME
          </button>
        </div>
        <button
          v-if="isJoined"
          @click="leaveSession"
          :disabled="isPushed"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-8 my-4 rounded-full text-sm"
        >
          {{ isPushed ? "EXITING" : "EXIT GAME" }}
        </button>
      </div>
    </div>

    <div
      v-if="showToast"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-md text-sm"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from "vue";
const textJ = ref("");
import Spinner from "@/components/Spinner.vue";
import LinkCard from "@/components/LinkCard.vue";
import { useSignal } from "@/composables/signal.js";
import { useRoute } from "vue-router";

const board = ref(Array(9).fill(null));
const isStarting = ref(false);
const startPlaying = () => {
  sendSignal(board.value);
  isStarting.value = true;
};
const makeMove = (index) => {
  if (!board.value[index]) {
    board.value[index] = currentPlayer.value;
    sendSignal(board.value);
  }
};

const {
  login,
  joinSession,
  leaveSession,
  isPlayerJoined,
  playersCount,
  sendSignal,
  signals,
  session,
  playerId,
  playerJoined,
  playerLeft,
  getPlayersCount,
  isLoading,
  showToast,
  toastMessage,
  isJoined,
  isWaiting,
  isPushed,
  currentPlayer,
  playerIndex,
  localSignals,
  remoteSignals,
  mergedSignals,
  occourances,
  isMyTurn,
  isOpponentTurn,
  isWinner,
  isLoser,
  isDraw,
  checkWinner,
} = useSignal();

const route = useRoute();

const sessionId = route.params.session;

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", leaveSession);
});

window.addEventListener("beforeunload", leaveSession);

onMounted(() => {
  login(sessionId);
  playerJoined();
  playerLeft();
});

watch(playersCount, (newValue) => {
  if (newValue === 2) {
    isPlayerJoined.value = true;
    isWaiting.value = false;
  }
});

watch(playerIndex, (newValue) => {
  if (newValue === 1) {
    currentPlayer.value = "X";
  }
});

watch(mergedSignals, (newValue) => {
  if (newValue) {
    isWinner.value = checkWinner(newValue);
  }
  if (newValue.every((cell) => cell !== null)) {
    isDraw.value = true;
  }
  isStarting.value = false;
});

watch(isWinner, (newValue) => {
  if (newValue === true) {
    if (
      occourances.value.userChar === occourances.value.otherChar &&
      currentPlayer.value === "X"
    ) {
      isLoser.value = false;
    }
    if (occourances.value.userChar > occourances.value.otherChar) {
      isLoser.value = false;
    }
  }
});
</script>
<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-gap: 5px;
}

.board div {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>
