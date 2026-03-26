import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===== Firebase設定 =====
const firebaseConfig = {
  apiKey: "AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
  authDomain: "class-meeting-2-2.firebaseapp.com",
  projectId: "class-meeting-2-2",
  storageBucket: "class-meeting-2-2.firebasestorage.app",
  messagingSenderId: "43109933184",
  appId: "1:43109933184:web:d16e2240b21204fb000665",
  measurementId: "G-12CKG1SK3Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===== 日付リスト =====
const dates = [
  "3/28","3/29","3/30","3/31",
  "4/1","4/2","4/3","4/4","4/5","4/6","4/7",
  "4/11","4/12","4/18","4/19","4/25","4/26"
];

const times = ["午前","午後","夜"];


// ===== カレンダー作成 =====
const calendar = document.getElementById("calendar");

dates.forEach(date => {

  const row = document.createElement("div");
  row.className = "day";

  const title = document.createElement("h3");
  title.textContent = date;
  row.appendChild(title);

  times.forEach(time => {

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = `${date}_${time}`;

    label.appendChild(checkbox);
    label.append(` ${time}`);

    row.appendChild(label);
  });

  calendar.appendChild(row);
});


// ===== 送信 =====
document.getElementById("submitBtn").onclick = async () => {

  const name = document.getElementById("name").value;

  if(!name){
    alert("名前を入力して！");
    return;
  }

  const checks =
    document.querySelectorAll("input[type=checkbox]:checked");

  const answers = [];

  checks.forEach(c => answers.push(c.value));

  await addDoc(collection(db,"answers"),{
    name,
    answers
  });

  alert("送信完了！");
};


// ===== 結果リアルタイム表示 =====
const resultDiv = document.getElementById("results");
const bestDiv = document.getElementById("best");

onSnapshot(collection(db,"answers"), snapshot => {

  const counts = {};

  dates.forEach(d=>{
    times.forEach(t=>{
      counts[`${d}_${t}`] = 0;
    });
  });

  snapshot.forEach(doc => {
    const data = doc.data();
    data.answers.forEach(a=>{
      counts[a]++;
    });
  });

  // ===== 一覧表示 =====
  resultDiv.innerHTML = "";

  Object.entries(counts).forEach(([key,val])=>{
    const p = document.createElement("p");
    p.textContent =
      key.replace("_"," ") + " : " + val + "人";
    resultDiv.appendChild(p);
  });

  // ===== 最多人数検索 =====
  let max = 0;
  let best = [];

  Object.entries(counts).forEach(([k,v])=>{
    if(v > max){
      max = v;
      best = [k];
    } else if(v === max){
      best.push(k);
    }
  });

  // ===== 表示 =====
  bestDiv.innerHTML =
    `🔥 一番集まれる候補：<br>` +
    best.map(b=>b.replace("_"," ")).join("<br>") +
    `<br>（${max}人参加可能）`;
});
