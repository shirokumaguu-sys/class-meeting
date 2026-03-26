import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
 getFirestore,
 collection,
 getDocs,
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

const dates=[
"3/29(金)","3/30(土)","3/31(日)",
"4/1(水)","4/2(木)","4/3(金)",
"4/4(土)","4/5(日)","4/6(月)",
"4/7(火)","4/26(土)","4/27(日)"
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
 <span>${d}</span>
 <select id="${d}">${selectHTML}</select>
 `;
 container.appendChild(div);
});

window.submitAnswer=async()=>{
 const name=document.getElementById("name").value.trim();
 if(!name){alert("名前入力");return;}

 let answers={};
 let filled=false;

 dates.forEach(d=>{
  const v=document.getElementById(d).value;
  if(v){answers[d]=v;filled=true;}
 });

 if(!filled){
  alert("1日以上選択してね");
  return;
 }

 await setDoc(doc(col,name),{
  name,
  answers
 });

 alert("送信しました！");
};

window.deleteAnswer=async()=>{
 const name=document.getElementById("name").value.trim();
 if(!name){alert("名前入力");return;}

 await deleteDoc(doc(col,name));
 alert("削除しました");
};

onSnapshot(col,snap=>{

 let html="<table><tr><th>名前</th>";
 dates.forEach(d=>html+=`<th>${d}</th>`);
 html+="</tr>";

 let bestCount={};

 dates.forEach(d=>bestCount[d]=0);

 snap.forEach(docu=>{
  const data=docu.data();
  html+=`<tr><td>${data.name}</td>`;

  dates.forEach(d=>{
   const v=data.answers[d]||"";
   let text="";
   let cls="";

   if(v==="ok"){text="〇";cls="ok";bestCount[d]++;}
   if(v==="morning"){text="午前";cls="morning";}
   if(v==="afternoon"){text="午後";cls="afternoon";}
   if(v==="ng"){text="×";cls="ng";}

   html+=`<td class="${cls}">${text}</td>`;
  });

  html+="</tr>";
 });

 html+="</table>";

 document.getElementById("result").innerHTML=html;

 const max=Math.max(...Object.values(bestCount));
 const best=Object.entries(bestCount)
  .filter(([d,c])=>c===max && c>0)
  .map(([d])=>d);

 document.getElementById("best").innerText=
 best.length
 ?`おすすめ日程：${best.join(" / ")}（${max}人参加可）`
 :"";
});
