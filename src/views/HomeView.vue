<template>
  <div>
    <h1 class="text-3xl text-blue-600 font-bold">Tic Tac Toe</h1>
    <div v-for="(msg, index) in messages" :key="index">
      {{ msg.user }}: {{ msg.text }}
    </div>
    <input v-model="message" class="border-2 border-teal-600"/>
    <div class="flex gap-2 py-2">
    <button @click="sendMessage" class="bg-teal-600 rounded-lg p-1">Send</button>
    <button @click="joinChannel" class="bg-teal-600 rounded-lg p-1">Join</button>
    </div>
  </div>
</template>

<script setup>
import AgoraRTM from 'agora-rtm-sdk';
import { ref, onMounted } from 'vue'

const client = AgoraRTM.createInstance('bccebd08aa7243a2a55010169def649d');

const channelName = 'endurance';

const channel = client.createChannel(channelName);
const userId = Math.floor(Math.random() * 10000);
const message = ref('');
const messages = ref([]);

const login = async () => {
  try {
    await client.login({ uid: userId.toString() });
    console.log('Agora RTM login success');
  } catch (error) {
    console.error('Agora RTM login error', error);
  }
};

const joinChannel = async () => {
  try {
    channel.join();
    receiveMessage();
    console.log('Channel created:', channel);
  } catch (error) {
    console.error('Error creating channel:', error);
  }
}

const sendMessage = async () => {
  try {
    await channel.sendMessage({ text: message.value });
    messages.value.push({ user: 'Me', text: message.value });
    message.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const receiveMessage = () => {
  channel.on('ChannelMessage', ({ text, senderId }) => {
    messages.value.push({ user: senderId, text });
  });
};

onMounted(() => {
  login();
})


</script>
