import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
setDoc,
doc,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===== Firebase設定 =====
const firebaseConfig = {
apiKey:"AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
authDomain:"class-meeting-2-2.firebaseapp.com",
projectId:"class-meeting-2-2",
storageBucket:"class-meeting-2-2.firebasestorage.app",
messagingSenderId:"43109933184",
appId:"1:43109933184:web:d16e2240b21204fb000665"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===== 日程 =====
const dates=[
"3/28","3/29","3/30","3/31",
"4/1","4/2","4/3","4/4","4/5","4/6","4/7",
"4/11","4/12","4/18","4/19","4/25","4/26"
];

const times=["午前","午後"];


// ===== カレンダー生成 =====
const calendar=document.getElementById("calendar");

dates.forEach(date=>{

const div=document.createElement("div");
div.className="day";

let html=`<b>${date}</b><br>`;

times.forEach(t=>{
html+=`
<label>
<input type="checkbox" value="${date}_${t}">
${t}
</label>
`;
});

div.innerHTML=html;
calendar.appendChild(div);

});


// ===== 送信 =====
document.getElementById("submitBtn").onclick=async()=>{

const name=document.getElementById("name").value.trim();

if(!name){
alert("名前を入力してください");
return;
}

const checked=
document.querySelectorAll("input[type=checkbox]:checked");

const answers=[];

checked.forEach(c=>answers.push(c.value));

await setDoc(doc(collection(db,"answers"),name),{
name,
answers
});

alert("保存しました！");
};


// ===== リアルタイム結果 =====
const resultDiv=document.getElementById("results");
const bestDiv=document.getElementById("best");

onSnapshot(collection(db,"answers"),snapshot=>{

const counts={};

dates.forEach(d=>{
times.forEach(t=>{
counts[`${d}_${t}`]=0;
});
});

snapshot.forEach(doc=>{
doc.data().answers.forEach(a=>{
if(counts[a]!=null) counts[a]++;
});
});

resultDiv.innerHTML="";

Object.entries(counts).forEach(([k,v])=>{
resultDiv.innerHTML+=`${k.replace("_"," ")} : ${v}人<br>`;
});


// ===== 最適日計算 =====
let max=0;
let best=[];

Object.entries(counts).forEach(([k,v])=>{
if(v>max){
max=v;
best=[k];
}else if(v===max){
best.push(k);
}
});

bestDiv.innerHTML=
"🔥 一番集まれる候補<br>"+
best.map(b=>b.replace("_"," ")).join("<br>")+
`<br>(${max}人参加可能)`;

});
