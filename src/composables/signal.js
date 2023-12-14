import { ref } from "vue";
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

  const currentPlayer = ref("O");

  const signals = ref([]);

  const localSignals = ref([]);

  const remoteSignals = ref([]);

  const mergedSignals = ref([]);

  const playersCount = ref(0);

  const playerIndex = ref(0);

  const occourances = ref({});

  const isWinner = ref(null);

  const isDraw = ref(null);

  const isLoser = ref(null);

  const isMyTurn = ref(true);
  const isOpponentTurn = ref(false);

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

  function findPlayerIndex(arr, target) {
    playerIndex.value = arr.indexOf(target);
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
    const members = await channel.value.getMembers(channel.value);
    playersCount.value = members.length;
    if (playersCount.value <= 2) {
      findPlayerIndex(members, playerId.toString());
    }
  }

  async function sendSignal(signalObj) {
    try {
      await channel.value.sendMessage({
        text: JSON.stringify(signalObj),
      });
      localSignals.value.push({
        text: signalObj,
        playerId: playerId,
      });

      console.log(
        "Signal sent",
        localSignals.value[localSignals.value.length - 1].text
      );
      const la = localSignals.value[localSignals.value.length - 1];
      const ar = remoteSignals.value[remoteSignals.value.length - 1];
      mergedSignals.value = mergeSignals(la.text, ar.text);

      occourances.value = countCharAndNullOccurrences(
        currentPlayer.value.toString(),
        mergeSignals(la.text, ar.text)
      );
      isMyTurn.value = false;
      isOpponentTurn.value = true;
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
      remoteSignals.value.push({
        text: JSON.parse(message.text),
        playerId: memberId,
      });
      const la = localSignals.value[localSignals.value.length - 1];
      const ar = remoteSignals.value[remoteSignals.value.length - 1];
      mergedSignals.value = mergeSignals(la.text, ar.text);
      occourances.value = countCharAndNullOccurrences(
        currentPlayer.value.toString(),
        mergeSignals(la.text, ar.text)
      );
      isMyTurn.value = true;
      isOpponentTurn.value = false;
    });
  }

  function mergeSignals(array1, array2) {
    const mergedArray = [];

    for (let i = 0; i < Math.max(array1.length, array2.length); i++) {
      mergedArray[i] = array1[i] !== null ? array1[i] : array2[i];
    }

    return mergedArray;
  }

  function countCharAndNullOccurrences(userChar, array) {
    const countUserChar = array.filter((char) => char === userChar).length;
    const countNull = array.filter((char) => char === null).length;
    const otherChar = userChar === "X" ? "O" : "X";
    const countOtherChar = array.filter((char) => char === otherChar).length;
    return {
      userChar: countUserChar,
      nullValues: countNull,
      otherChar: countOtherChar,
    };
  }

  function checkWinner(boardArray) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        boardArray[a] &&
        boardArray[a] === boardArray[b] &&
        boardArray[a] === boardArray[c]
      ) {
        return true;
      }
    }

    return false;
  }

  return {
    login,
    logout,
    joinSession,
    leaveSession,
    sendSignal,
    playerId,
    signals,
    localSignals,
    remoteSignals,
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
    currentPlayer,
    playerIndex,
    mergedSignals,
    occourances,
    isMyTurn,
    isOpponentTurn,
    isWinner,
    isLoser,
    isDraw,
    checkWinner,
  };
}
