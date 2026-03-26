// ================= Firebase =================
import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
 getFirestore,
 collection,
 doc,
 setDoc,
 deleteDoc,
 getDoc,
 onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig={
 apiKey:"AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
 authDomain:"class-meeting-2-2.firebaseapp.com",
 projectId:"class-meeting-2-2"
};

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);
const responsesRef=collection(db,"responses");


// ================= 日程 =================
const dates=[
{id:"d1",label:"3月29日（金）"},
{id:"d2",label:"3月30日（土）"},
{id:"d3",label:"3月31日（日）"},
{id:"d4",label:"4月1日（水）"},
{id:"d5",label:"4月2日（木）"},
{id:"d6",label:"4月3日（金）"},
{id:"d7",label:"4月4日（土）"},
{id:"d8",label:"4月5日（日）"},
{id:"d9",label:"4月6日（月）"},
{id:"d10",label:"4月7日（火）"},
{id:"d11",label:"4月26日（土）"},
{id:"d12",label:"4月27日（日）"}
];


// ================= UI生成（プルダウン式固定）=================
const selectHTML=`
<option value="">未選択</option>
<option value="ok">〇参加できます</option>
<option value="morning">午前のみ</option>
<option value="afternoon">午後のみ</option>
<option value="ng">×参加できません</option>
`;

const container=document.getElementById("dates");

dates.forEach(d=>{
 const row=document.createElement("div");
 row.className="row";

 row.innerHTML=`
   <span>${d.label}</span>
   <select id="${d.id}">
     ${selectHTML}
   </select>
 `;

 container.appendChild(row);
});


// ================= 回答送信 =================
window.submitAnswer=async()=>{

 const name=document.getElementById("name").value.trim();

 if(!name){
  alert("名前を入力してください");
  return;
 }

 let answers={};
 let selected=false;

 dates.forEach(d=>{
  const value=document.getElementById(d.id).value;
  if(value){
   answers[d.label]=value;
   selected=true;
  }
 });

 // ⭐ 全未選択 → 削除
 if(!selected){
  await deleteDoc(doc(responsesRef,name));
  alert("未選択なので削除しました");
  return;
 }

 await setDoc(doc(responsesRef,name),{
  name,
  answers,
  updatedAt:new Date()
 });

 alert("✅ 回答を送信しました！");
};


// ================= 削除 =================
window.deleteAnswer=async()=>{

 const name=document.getElementById("name").value.trim();

 if(!name){
  alert("名前を入力してください");
  return;
 }

 await deleteDoc(doc(responsesRef,name));

 alert("削除しました");
};


// ================= 名前入力で編集 =================
document.getElementById("name")
.addEventListener("change",async()=>{

 const name=document.getElementById("name").value.trim();
 if(!name) return;

 const snap=await getDoc(doc(responsesRef,name));

 // リセット
 dates.forEach(d=>{
  document.getElementById(d.id).value="";
 });

 if(!snap.exists()) return;

 const data=snap.data();

 dates.forEach(d=>{
  if(data.answers[d.label]){
   document.getElementById(d.id).value=data.answers[d.label];
  }
 });
});


// ================= 結果表示（リアルタイム）=================
onSnapshot(responsesRef,(snapshot)=>{

 let html="<table><tr><th>名前</th>";

 dates.forEach(d=>{
  html+=`<th>${d.label}</th>`;
});

 html+="</tr>";

 // ⭐ スコア計算
 let score={};
 dates.forEach(d=>score[d.label]=0);

 snapshot.forEach(docu=>{

  const data=docu.data();

  html+=`<tr><td>${data.name}</td>`;

  dates.forEach(d=>{

   const v=data.answers[d.label]||"";

   let text="";
   let color="";

   if(v==="ok"){
     text="〇";
     color="#22c55e";
     score[d.label]+=2;
   }

   if(v==="morning"){
     text="午前";
     color="#3b82f6";
     score[d.label]+=1;
   }

   if(v==="afternoon"){
     text="午後";
     color="#facc15";
     score[d.label]+=1;
   }

   if(v==="ng"){
     text="×";
     color="#ef4444";
   }

   html+=`<td style="background:${color}22">${text}</td>`;
  });

  html+="</tr>";
});

 html+="</table>";

 document.getElementById("result").innerHTML=html;


 // ================= ⭐最適日程 =================
 const maxScore=Math.max(...Object.values(score));

 const bestDays=Object.entries(score)
   .filter(([d,s])=>s===maxScore && s>0)
   .map(([d])=>d);

 document.getElementById("best").innerText=
 bestDays.length
 ?`⭐ クラス会おすすめ日程：${bestDays.join(" / ")}`
 :"";
});
