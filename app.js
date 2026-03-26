// Firebase読み込み
import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
 getFirestore,
 collection,
 addDoc,
 onSnapshot
} from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// 🔥 自分のFirebase設定（そのまま使える）
const firebaseConfig = {
 apiKey: "AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
 authDomain: "class-meeting-2-2.firebaseapp.com",
 projectId: "class-meeting-2-2",
 storageBucket: "class-meeting-2-2.firebasestorage.app",
 messagingSenderId: "43109933184",
 appId: "1:43109933184:web:d16e2240b21204fb000665"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 日程
const dates=[
"3/29","3/30","3/31","4/1","4/2","4/3",
"4/4","4/5","4/6","4/7","4/26","4/27"
];

// UI生成
const container=document.getElementById("dates");

dates.forEach((d,i)=>{

let div=document.createElement("div");
div.className="card";

div.innerHTML=`
<b>${d}</b><br>
<label><input type="radio" name="d${i}" value="available">〇</label>
<label><input type="radio" name="d${i}" value="morning">午前</label>
<label><input type="radio" name="d${i}" value="afternoon">午後</label>
<label><input type="radio" name="d${i}" value="unavailable">×</label>
`;

container.appendChild(div);
});


// 送信
window.submitForm=async function(){

const name=document.getElementById("name").value;
if(!name)return alert("名前入力");

let answers={};

dates.forEach((_,i)=>{
let r=document.querySelector(`input[name=d${i}]:checked`);
if(r)answers[i]=r.value;
});

// Firebase保存
await addDoc(collection(db,"responses"),{
 name,
 answers,
 created:new Date()
});

};


// リアルタイム更新
onSnapshot(collection(db,"responses"),snapshot=>{

let html="<table><tr><th>名前</th>";

dates.forEach(d=>html+=`<th>${d}</th>`);
html+="</tr>";

snapshot.forEach(doc=>{

const p=doc.data();

html+=`<tr><td>${p.name}</td>`;

dates.forEach((_,i)=>{
let a=p.answers[i]||"";
html+=`<td class="${a}">${label(a)}</td>`;
});

html+="</tr>";
});

html+="</table>";

document.getElementById("result").innerHTML=html;

});


function label(v){
if(v==="available")return"〇";
if(v==="morning")return"午前";
if(v==="afternoon")return"午後";
if(v==="unavailable")return"×";
return"";
}
