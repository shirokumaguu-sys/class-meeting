// ======================
// Firebase
// ======================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
 getFirestore,
 doc,
 setDoc,
 onSnapshot,
 collection
} from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig={
 apiKey:"AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
 authDomain:"class-meeting-2-2.firebaseapp.com",
 projectId:"class-meeting-2-2"
};

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);

// ======================
// 日程
// ======================

const dates=[
"3/29(金)","3/30(土)","3/31(日)",
"4/1(水)","4/2(木)","4/3(金)",
"4/4(土)","4/5(日)","4/6(月)",
"4/7(火)","4/26(土)","4/27(日)"
];

const choices={
ok:"〇",
morning:"午前",
afternoon:"午後",
ng:"×"
};

// ======================
// フォーム生成
// ======================

const table=document.getElementById("formTable");

let html="<tr><th>日程</th><th>回答</th></tr>";

dates.forEach(d=>{
 html+=`<tr><td>${d}</td><td>`;

 for(const k in choices){
 html+=`
 <label>
 <input type="radio" name="${d}" value="${k}">
 ${choices[k]}
 </label>`;
 }

 html+="</td></tr>";
});

table.innerHTML=html;

// ======================
// 送信
// ======================

window.submitAnswer=async function(){

 const name=document.getElementById("name").value.trim();
 if(!name)return alert("名前必須");

 let answers={};

 dates.forEach(d=>{
 const checked=document.querySelector(
 `input[name="${d}"]:checked`
 );
 if(checked)answers[d]=checked.value;
 });

 await setDoc(
  doc(db,"responses",name),
  {answers}
 );

 document.getElementById("message")
 .innerText="✅送信しました（自動更新）";
};

// ======================
// リアルタイム結果表示
// ======================

const resultDiv=document.getElementById("result");

onSnapshot(
 collection(db,"responses"),
 snap=>{

 let data={};

 snap.forEach(doc=>{
  data[doc.id]=doc.data().answers;
 });

 renderTable(data);
});

// ======================
// 表生成
// ======================

function renderTable(data){

 let html="<table><tr><th>名前</th>";

 dates.forEach(d=>html+=`<th>${d}</th>`);
 html+="</tr>";

 let best=[];
 let max=0;

 dates.forEach(date=>{

 let count=0;

 for(const name in data){
 if(data[name][date]==="ok")count++;
 }

 if(count>max){
  max=count;
  best=[date];
 }else if(count===max){
  best.push(date);
 }

});

for(const name in data){

 html+=`<tr><td>${name}</td>`;

 dates.forEach(d=>{
 const v=data[name][d];
 html+=`<td class="${v||""}">
 ${choices[v]||""}
 </td>`;
 });

 html+="</tr>";
}

html+="</table>";

resultDiv.innerHTML=html;

document.getElementById("best").innerText=
"⭐おすすめ日程："+best.join(" / ")
+"（"+max+"人参加可能）";
}
