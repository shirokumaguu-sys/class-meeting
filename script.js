import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
 getFirestore,
 collection,
 setDoc,
 doc,
 deleteDoc,
 onSnapshot
} from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig={
 apiKey:"AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
 authDomain:"class-meeting-2-2.firebaseapp.com",
 projectId:"class-meeting-2-2"
};

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);
const col=collection(db,"responses");


// ✅ 表示名と内部IDを分離
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

const selectHTML=`
<option value="">未選択</option>
<option value="ok">〇参加できます</option>
<option value="morning">午前のみ</option>
<option value="afternoon">午後のみ</option>
<option value="ng">×参加できません</option>
`;

const container=document.getElementById("dates");

dates.forEach(d=>{
 const div=document.createElement("div");
 div.className="row";
 div.innerHTML=`
 <span>${d.label}</span>
 <select id="${d.id}">
 ${selectHTML}
 </select>
 `;
 container.appendChild(div);
});


// ⭐ 送信（完全修正）
window.submitAnswer=async()=>{
 const name=document.getElementById("name").value.trim();

 if(!name){
  alert("名前を入力してね");
  return;
 }

 let answers={};
 let filled=false;

 dates.forEach(d=>{
  const v=document.getElementById(d.id).value;
  if(v){
   answers[d.label]=v;
   filled=true;
  }
 });

 if(!filled){
  alert("1日以上選択してね");
  return;
 }

 await setDoc(doc(col,name),{
  name,
  answers
 });

 alert("✅ 回答送信しました！");
};


// ⭐ 削除
window.deleteAnswer=async()=>{
 const name=document.getElementById("name").value.trim();

 if(!name){
  alert("名前入力してね");
  return;
 }

 await deleteDoc(doc(col,name));
 alert("削除しました");
};


// ⭐ リアルタイム結果表示
onSnapshot(col,snap=>{

 let html="<table><tr><th>名前</th>";
 dates.forEach(d=>html+=`<th>${d.label}</th>`);
 html+="</tr>";

 let bestCount={};
 dates.forEach(d=>bestCount[d.label]=0);

 snap.forEach(docu=>{

  const data=docu.data();
  html+=`<tr><td>${data.name}</td>`;

  dates.forEach(d=>{
   const v=data.answers[d.label]||"";

   let text="";
   let cls="";

   if(v==="ok"){text="〇";cls="ok";bestCount[d.label]++;}
   if(v==="morning"){text="午前";cls="morning";}
   if(v==="afternoon"){text="午後";cls="afternoon";}
   if(v==="ng"){text="×";cls="ng";}

   html+=`<td class="${cls}">${text}</td>`;
  });

  html+="</tr>";
 });

 html+="</table>";

 document.getElementById("result").innerHTML=html;

 // ⭐おすすめ日計算
 const max=Math.max(...Object.values(bestCount));

 const best=Object.entries(bestCount)
  .filter(([d,c])=>c===max && c>0)
  .map(([d])=>d);

 document.getElementById("best").innerText=
 best.length
 ?`おすすめ日程：${best.join(" / ")}（${max}人参加可能）`
 :"";
});
