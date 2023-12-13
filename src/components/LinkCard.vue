<template>
  <div class="card p-1 mt-4">
    <div class="flex items-center">
      <p class="text-gray-500 text-xs">{{ currentUrl }}</p>
      <button
        @click="copyLink"
        class="text-xs card text-gray-500 hover:text-gray-700 p-1 ml-2"
      >
        {{ isCopied ? "Copied" : "Copy Link" }}
      </button>
    </div>
  </div>
  <p class="text-gray-700 text-xs mt-1">Share this link with your friends!</p>
</template>

<script setup>
import { ref } from "vue";

const currentUrl = window.location.href;
const isCopied = ref(false);
const copyLink = () => {
  const input = document.createElement("input");
  input.value = currentUrl;
  document.body.appendChild(input);

  input.select();
  input.setSelectionRange(0, 99999);

  document.execCommand("copy");

  document.body.removeChild(input);

  isCopied.value = true;
};
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
