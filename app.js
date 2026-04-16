import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

/* 🔥 REMPLACE ICI PAR TA CONFIG FIREBASE */
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

/* 🟢 Ajouter un point */
map.addEventListener("click", async (e) => {
  const name = prompt("Nom du point ?");
  if (!name) return;

  const rect = map.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  await addDoc(flagsCollection, {
    x,
    y,
    name,
    owner: "neutral",
    lastUpdate: Date.now(),
    captureEnd: null
  });
});

/* 🔄 Firestore */
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

/* ⏱️ format temps */
function formatTime(seconds) {
  if (seconds < 60) return seconds + "s";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours + "h " + remainingMinutes + "m";
}

/* 🎨 render */
function renderFlags() {
  document.querySelectorAll(".flag").forEach(el => el.remove());

  const rect = map.getBoundingClientRect();
  const now = Date.now();

  flagsData.forEach(data => {

    const flag = document.createElement("div");
    flag.className = "flag " + data.owner;

    flag.style.left = (data.x * rect.width) + "px";
    flag.style.top = (data.y * rect.height) + "px";

    /* 🟡 changement de camp */
    flag.addEventListener("click", async (event) => {
      event.stopPropagation();

      let newOwner;

      if (data.owner === "neutral") newOwner = "konoha";
      else if (data.owner === "konoha") newOwner = "suna";
      else newOwner = "neutral";

      await updateDoc(doc(db, "flags", data.id), {
        owner: newOwner,
        lastUpdate: Date.now()
      });
    });

    /* 🔴 suppression */
    flag.addEventListener("contextmenu", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!confirm("Supprimer ce point ?")) return;

      await deleteDoc(doc(db, "flags", data.id));
    });

    /* 🏷️ nom */
    const label = document.createElement("div");
    label.style.position = "absolute";
    label.style.top = "-40px";
    label.style.fontSize = "12px";
    label.innerText = data.name || "";

    /* ⏱️ timer normal */
    const timer = document.createElement("div");
    timer.className = "timer";

    const seconds = Math.floor((now - data.lastUpdate) / 1000);
    timer.innerText = formatTime(seconds);

    timer.addEventListener("click", async (event) => {
      event.stopPropagation();

      await updateDoc(doc(db, "flags", data.id), {
        lastUpdate: Date.now()
      });
    });

    /* 🔥 CAPTURE TIMER */
    const capture = document.createElement("div");
    capture.style.fontSize = "10px";
    capture.style.marginTop = "2px";

    if (data.captureEnd) {
      const remaining = Math.floor((data.captureEnd - now) / 1000);

      if (remaining <= 0) {
        capture.innerText = "CAPTURABLE";

        /* 💥 clignotement */
        flag.classList.add("blink");
      } else {
        capture.innerText = "Capturable dans: " + formatTime(remaining);
      }
    } else {
      capture.innerText = "Capturable : OFF";
    }

    /* 🖱️ clic pour définir timer */
    capture.addEventListener("click", async (event) => {
      event.stopPropagation();

      const minutes = prompt("Dans combien de minutes ?");
      if (!minutes) return;

      const ms = parseInt(minutes) * 60 * 1000;

      await updateDoc(doc(db, "flags", data.id), {
        captureEnd: Date.now() + ms
      });
    });

    flag.appendChild(label);
    flag.appendChild(timer);
    flag.appendChild(capture);
    map.appendChild(flag);
  });
}

/* 🔄 refresh live */
setInterval(() => {
  renderFlags();
}, 1000);