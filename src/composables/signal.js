import { ref, onMounte } from "vue";
import AgoraRTM from "agora-rtm-sdk";
import { useRouter } from "vue-router";

export function useSignal() {
  const router = useRouter();
  const client = AgoraRTM.createInstance(process.env.VUE_APP_AGORA_APP_ID);
  const session = ref("");

  const channel = ref(null);

  const isLoading = ref(false);

  const isPlayerJoined = ref(false);

  const isJoined = ref(false);

  const isWaiting = ref(true);

  const isPushed = ref(false);

  const playerId = Math.floor(Math.random() * 10000);

  const signals = ref([]);

  const playersCount = ref(0);

  const showToast = ref(false);
  const toastMessage = ref(null);

  function closeToast() {
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  }

  function initToast(message) {
    toastMessage.value = message;
    showToast.value = true;
    closeToast();
  }

  async function login(sessionId) {
    session.value = sessionId;
    channel.value = client.createChannel(sessionId);
    isLoading.value = true;
    try {
      await client.login({
        uid: playerId.toString(),
      });
      isLoading.value = false;
      initToast("You've Logged in Successfully");
    } catch (err) {
      console.log("Error login", err);
    }
  }

  async function logout() {
    try {
      await client.logout();
    } catch (err) {
      console.log("Error logout", err);
    }
  }

  async function joinSession() {
    try {
      isPushed.value = true;
      await channel.value.join();
      await getPlayersCount();
      if (playersCount.value > 2) {
        leaveSession();
        return;
      }
      isJoined.value = true;
      isPushed.value = false;
      initToast("You've Joined The Session Successfully");
      receiveSignal();
    } catch (err) {
      console.log("Error join", err);
    }
  }

  async function leaveSession() {
    try {
      isPushed.value = true;
      await channel.value.leave();
      await logout();
      router.push("/");
    } catch (err) {
      console.log("Error leave", err);
    }
  }

  async function getPlayersCount() {
    const members = await channel.value.getMembers(channel);
    playersCount.value = members.length;
  }

  async function sendSignal(signalObj) {
    try {
      await channel.value.sendMessage({
        text: JSON.stringify(signalObj),
      });
      signals.value.push({
        text: signalObj,
        playerId: playerId,
      });
    } catch (err) {
      console.log("Error send", err);
    }
  }

  function playerJoined() {
    channel.value.on("MemberJoined", function (memberId) {
      getPlayersCount();
      isPlayerJoined.value = true;
      isWaiting.value = false;
      initToast("Other player joined, Game will start.");
    });
  }

  function playerLeft() {
    channel.value.on("MemberLeft", function (memberId) {
      getPlayersCount();
      isPlayerJoined.value = false;
      isWaiting.value = true;
      initToast("Opponent left.");
    });
  }

  function receiveSignal() {
    channel.value.on("ChannelMessage", (message, memberId) => {
      signals.value.push({
        text: JSON.parse(message.text),
        userId: memberId,
      });
    });
  }

  return {
    login,
    logout,
    joinSession,
    leaveSession,
    sendSignal,
    playerId,
    signals,
    playerJoined,
    playerLeft,
    session,
    isPlayerJoined,
    playersCount,
    getPlayersCount,
    isLoading,
    showToast,
    toastMessage,
    isJoined,
    isWaiting,
    isPushed,
  };
}
