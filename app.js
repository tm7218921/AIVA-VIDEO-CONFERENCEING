const meetingClock = document.getElementById("meetingClock");
const localVideo = document.getElementById("localVideo");
const statusLabel = document.getElementById("statusLabel");
const assistantHint = document.getElementById("assistantHint");

const state = {
  micEnabled: true,
  camEnabled: true,
  elapsed: 0,
  stream: null,
};

const formatTime = (seconds) => {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

const renderStatus = () => {
  const mic = state.micEnabled ? "Mic on" : "Mic off";
  const cam = state.camEnabled ? "Camera on" : "Camera off";
  statusLabel.textContent = `${mic} · ${cam}`;
};

const setButtonState = (id, on) => {
  document.getElementById(id).classList.toggle("is-off", !on);
};

const initCamera = async () => {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = state.stream;
  } catch {
    assistantHint.textContent = "Camera permission is blocked. You can still use notes and AI insights.";
  }
};

const toggleTrack = (kind, enabled) => {
  state.stream?.getTracks().forEach((track) => {
    if (track.kind === kind) {
      track.enabled = enabled;
    }
  });
};

document.getElementById("toggleMic").addEventListener("click", () => {
  state.micEnabled = !state.micEnabled;
  toggleTrack("audio", state.micEnabled);
  setButtonState("toggleMic", state.micEnabled);
  renderStatus();
});

document.getElementById("toggleCam").addEventListener("click", () => {
  state.camEnabled = !state.camEnabled;
  toggleTrack("video", state.camEnabled);
  setButtonState("toggleCam", state.camEnabled);
  renderStatus();
});

document.getElementById("shareScreen").addEventListener("click", async () => {
  try {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    localVideo.srcObject = displayStream;
    assistantHint.textContent = "Screen share started. AIVA is tracking key talking points.";
    displayStream.getVideoTracks()[0].addEventListener("ended", () => {
      localVideo.srcObject = state.stream;
      assistantHint.textContent = "Screen share ended. Back to camera feed.";
    });
  } catch {
    assistantHint.textContent = "Screen share canceled.";
  }
});

document.getElementById("raiseHand").addEventListener("click", () => {
  assistantHint.textContent = "Hand raised. AIVA will suggest the best moment to jump in.";
});

document.getElementById("simulateInsight").addEventListener("click", () => {
  assistantHint.textContent = "AI insight: Candidate shows confidence when discussing distributed systems. Ask a scalability follow-up.";
});

document.getElementById("endCall").addEventListener("click", () => {
  state.stream?.getTracks().forEach((track) => track.stop());
  assistantHint.textContent = "Session ended. AIVA is generating your interview summary.";
  localVideo.srcObject = null;
});

setInterval(() => {
  state.elapsed += 1;
  meetingClock.textContent = formatTime(state.elapsed);
}, 1000);

renderStatus();
initCamera();
