import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
 getFirestore,
 doc,
 setDoc,
 onSnapshot,
 collection
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig={
 apiKey:"AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
 authDomain:"class-meeting-2-2.firebaseapp.com",
 projectId:"class-meeting-2-2"
};

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);

// =====================
// 日程
// =====================

const dates=[
"3月29日(金)","3月30日(土)","3月31日(日)",
"4月1日(水)","4月2日(木)","4月3日(金)",
"4月4日(土)","4月5日(日)","4月6日(月)",
"4月7日(火)","4月26日(土)","4月27日(日)"
];

const choices={
ok:"〇参加できます",
morning:"午前のみ",
afternoon:"午後のみ",
ng:"×参加できません"
};

// =====================
// フォーム生成（プルダウン）
// =====================

const table=document.getElementById("formTable");

let html="<tr><th>日程</th><th>回答</th></tr>";

dates.forEach(d=>{

 html+=`
 <tr>
 <td>${d}</td>
 <td>
 <select id="${d}">
 <option value="">未選択</option>
 <option value="ok">〇参加できます</option>
 <option value="morning">午前のみ</option>
 <option value="afternoon">午後のみ</option>
 <option value="ng">×参加できません</option>
 </select>
 </td>
 </tr>
 `;
});

table.innerHTML=html;

// =====================
// 送信
// =====================

window.submitAnswer=async function(){

 const name=document.getElementById("name").value.trim();

 if(!name){
  alert("名前を入力してください");
  return;
 }

 let answers={};

 dates.forEach(d=>{
 const v=document.getElementById(d).value;
 if(v)answers[d]=v;
 });

 await setDoc(
  doc(db,"responses",name),
  {answers}
 );

 document.getElementById("message")
 .innerText="✅回答を保存しました";
};

// =====================
// リアルタイム結果表示
// =====================

onSnapshot(
 collection(db,"responses"),
 snap=>{

 let data={};

 snap.forEach(doc=>{
  data[doc.id]=doc.data().answers;
 });

 renderResult(data);
});

// =====================
// 結果表示
// =====================

function renderResult(data){

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

 html+=`
 <td class="${v||""}">
 ${choices[v]||"-"}
 </td>`;
 });

 html+="</tr>";
}

html+="</table>";

document.getElementById("result").innerHTML=html;

document.getElementById("best").innerText=
"⭐おすすめ日程："+best.join(" / ")
+"（"+max+"人参加可能）";
}
