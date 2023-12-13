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

        <div
          class="text-2xl font-bold py-10"
          v-show="isJoined && isPlayerJoined"
        >
          Insert The Grid
          <button
            :disabled="!isJoined || !isPlayerJoined"
            @click="console.log('clicked')"
          >
            Checking
          </button>
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
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          {{ isPushed ? "Starting" : "Play" }}
        </button>
        <button
          v-if="isJoined"
          @click="leaveSession"
          :disabled="isPushed"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
        >
          {{ isPushed ? "Leaving" : "Leave" }}
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

import Spinner from "@/components/Spinner.vue";
import LinkCard from "@/components/LinkCard.vue";
import { useSignal } from "@/composables/signal.js";
import { useRoute } from "vue-router";

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
</script>
