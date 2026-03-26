// ===== Firebase =====
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
 getFirestore,
 doc,
 setDoc,
 deleteDoc,
 collection,
 onSnapshot
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥自分のFirebase設定に変更
const firebaseConfig = {
 apiKey: "APIKEY",
 authDomain: "PROJECT.firebaseapp.com",
 projectId: "PROJECTID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== 日程 =====
const schedule = [
 "4/1",
 "4/3",
 "4/5",
 "4/7"
];

const selectOptions = [
 "〇参加できます",
 "午前のみ",
 "午後のみ",
 "×参加できません"
];

// ===== 日程UI生成 =====
const datesDiv = document.getElementById("dates");

schedule.forEach(day=>{
 const div=document.createElement("div");

 const select=document.createElement("select");
 select.id="date_"+day;

 selectOptions.forEach(opt=>{
   const o=document.createElement("option");
   o.value=opt;
   o.textContent=opt;
   select.appendChild(o);
 });

 div.innerHTML=`${day}：`;
 div.appendChild(select);
 datesDiv.appendChild(div);
});

// ===== 送信 =====
async function submitAnswer(){

 const name=document.getElementById("name").value.trim();
 if(!name){
   alert("名前を入力してください");
   return;
 }

 const data={};

 schedule.forEach(day=>{
   data[day]=document.getElementById("date_"+day).value;
 });

 await setDoc(doc(db,"responses",name),data);

 document.getElementById("message").textContent=
 "✅ 回答を保存しました（自動更新対応）";
}

window.submitAnswer=submitAnswer;

// ===== 削除 =====
async function deleteAnswer(){

 const name=document.getElementById("name").value.trim();
 if(!name){
   alert("名前を入力してください");
   return;
 }

 if(!confirm("自分の回答を削除しますか？")) return;

 await deleteDoc(doc(db,"responses",name));

 document.getElementById("message").textContent=
 "🗑 回答を削除しました";
}

window.deleteAnswer=deleteAnswer;


// ===== 結果リアルタイム表示 =====
onSnapshot(collection(db,"responses"),snapshot=>{

 const resultDiv=document.getElementById("result");
 resultDiv.innerHTML="";

 const table=document.createElement("table");

 // ヘッダー
 const header=document.createElement("tr");
 header.innerHTML="<th>名前</th>"+
 schedule.map(d=>`<th>${d}</th>`).join("");
 table.appendChild(header);

 const goodCount={};
 schedule.forEach(d=>goodCount[d]=0);

 snapshot.forEach(docSnap=>{

   const tr=document.createElement("tr");
   const name=docSnap.id;
   const data=docSnap.data();

   tr.innerHTML=`<td>${name}</td>`;

   schedule.forEach(day=>{
     const val=data[day]||"-";

     let cls="";
     if(val.includes("〇")){
       cls="good";
       goodCount[day]++;
     }
     else if(val.includes("×")){
       cls="ng";
     }
     else{
       cls="partial";
     }

     tr.innerHTML+=`<td class="${cls}">${val}</td>`;
   });

   table.appendChild(tr);
 });

 resultDiv.appendChild(table);

 // ===== 最適日計算 =====
 const max=Math.max(...Object.values(goodCount));

 const best=Object.keys(goodCount)
   .filter(d=>goodCount[d]===max);

 document.getElementById("bestDay").textContent=
   "⭐ 最適日程：" +
   best.join(" / ") +
   `（参加可能 ${max}人）`;

});
