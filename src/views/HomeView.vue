<template>
  <div>
    <h1>Tic Tac Toe</h1>
    <div v-for="(msg, index) in messages" :key="index">
      {{ msg.user }}: {{ msg.text }}
    </div>
    <input v-model="message" />
    <button @click="sendMessage">Send</button>
    <button @click="joinChannel">Join</button>
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
