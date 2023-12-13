<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <h1 class="text-4xl font-bold">Tic Tac Toe</h1>
      <p class="text-gray-600 text-sm mb-4">The Multiplayer Mode</p>
      <router-link :to="{ name: 'game', params: { session: session } }">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Start The Game
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const session = ref(
  Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
);
</script>
