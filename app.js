import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

map.addEventListener("click", async (e) => {
  const rect = map.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  await addDoc(flagsCollection, {
    x,
    y,
    owner: "neutral",
    timerEnd: 0,
    lastUpdate: Date.now()
  });
});

onSnapshot(flagsCollection, (snapshot) => {

  document.querySelectorAll(".flag").forEach(el => el.remove());

  snapshot.forEach(docSnap => {

    const data = docSnap.data();

    const flag = document.createElement("div");
    flag.className = "flag " + data.owner;

    flag.style.left = data.x + "px";
    flag.style.top = data.y + "px";

    flag.addEventListener("click", async (event) => {
      event.stopPropagation();

      let newOwner;

      if (data.owner === "neutral") newOwner = "konoha";
      else if (data.owner === "konoha") newOwner = "suna";
      else newOwner = "neutral";

      await updateDoc(doc(db, "flags", docSnap.id), {
        owner: newOwner,
        lastUpdate: Date.now()
      });
    });

    map.appendChild(flag);
  });

});