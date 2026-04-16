import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

/* 🔥 CONFIG FIREBASE */
const firebaseConfig = {
apiKey: "AIzaSyAC6uQD2KfxIqINAwIDsTV4uEacR8iFCXg",
authDomain: "ag---reconnaissance-drapeau.firebaseapp.com",
projectId: "ag---reconnaissance-drapeau",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const map = document.getElementById("map");
const flagsCollection = collection(db, "flags");

let flagsData = [];

onSnapshot(flagsCollection, (snapshot) => {
  flagsData = [];

  snapshot.forEach(docSnap => {
    flagsData.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderFlags();
});

/* ⏱️ format */
function formatTime(seconds) {
  if (seconds < 60) return seconds + "s";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours + "h " + remainingMinutes + "m";
}

/* 🎨 render (SANS EVENTS) */
function renderFlags() {
  document.querySelectorAll(".flag").forEach(el => el.remove());

  const rect = map.getBoundingClientRect();
  const now = Date.now();

  flagsData.forEach(data => {

    const flag = document.createElement("div");
    flag.className = "flag " + data.owner;

    flag.style.left = (data.x * rect.width) + "px";
    flag.style.top = (data.y * rect.height) + "px";

    /* NOM */
    const label = document.createElement("div");
    label.className = "label";
    label.innerText = data.name || "";

    /* CAPTURE */
    const capture = document.createElement("div");
    capture.className = "capture";

    if (data.captureEnd) {
      const remaining = Math.floor((data.captureEnd - now) / 1000);

      if (remaining <= 0) {
        capture.innerText = "CAPTURABLE";

        if (data.owner === "neutral" || data.owner === "suna") {
          flag.classList.add("blink");
        }

      } else {
        capture.innerText = "Capturable dans : " + formatTime(remaining);
      }
    } else {
      capture.innerText = "Capturable : OFF";
    }

    /* TIMER */
    const timer = document.createElement("div");
    timer.className = "timer";

    const seconds = Math.floor((now - data.lastUpdate) / 1000);
    timer.innerText = "Dernier check : " + formatTime(seconds);

    flag.appendChild(label);
    flag.appendChild(capture);
    flag.appendChild(timer);

    map.appendChild(flag);
  });
}

/* refresh live */
setInterval(() => {
  renderFlags();
}, 1000);