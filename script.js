// ===== Firebase =====
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
 getFirestore,
 doc,
 setDoc,
 deleteDoc,
 collection,
 onSnapshot,
 getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "APIKEY",
 authDomain: "PROJECT.firebaseapp.com",
 projectId: "PROJECTID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===== 日程（HTML側と一致させる）=====
const schedule = [
 "3/29",
 "3/30",
 "3/31",
 "4/1",
 "4/2",
 "4/3",
 "4/4",
 "4/5",
 "4/6",
 "4/7",
 "4/26",
 "4/27"
];


// ===== 送信 =====
window.submitAnswer = async function(){

 const name =
   document.getElementById("name").value.trim();

 if(!name){
   alert("名前を入力してください");
   return;
 }

 const data={};
 let allEmpty=true;

 schedule.forEach(day=>{

   const select =
     document.getElementById("date_"+day);

   if(!select) return;

   const value=select.value;

   if(value!=="未選択") allEmpty=false;

   data[day]=value;
 });

 const ref = doc(db,"responses",name);
 const before = await getDoc(ref);

 // ⭐ 全未選択 → 削除
 if(allEmpty){

   if(before.exists()){
     await deleteDoc(ref);
     document.getElementById("message").textContent =
       "🗑 回答を削除しました";
   }else{
     document.getElementById("message").textContent =
       "未選択のため保存されません";
   }

   return;
 }

 // 保存
 await setDoc(ref,data);

 document.getElementById("message").textContent =
   before.exists()
   ? "✅ 回答を更新しました"
   : "✅ 回答を保存しました";
};


// ===== 手動削除 =====
window.deleteAnswer = async function(){

 const name =
   document.getElementById("name").value.trim();

 if(!name){
   alert("名前を入力してください");
   return;
 }

 await deleteDoc(doc(db,"responses",name));

 document.getElementById("message").textContent =
   "🗑 削除しました";
};


// ===== 結果リアルタイム =====
onSnapshot(collection(db,"responses"),snap=>{

 const result =
   document.getElementById("result");

 result.innerHTML="";

 if(snap.empty){
   document.getElementById("bestDay").textContent="";
   return;
 }

 const table=document.createElement("table");

 const header=document.createElement("tr");
 header.innerHTML=
   "<th>名前</th>"+
   schedule.map(d=>`<th>${d}</th>`).join("");

 table.appendChild(header);

 const goodCount={};
 schedule.forEach(d=>goodCount[d]=0);

 snap.forEach(docSnap=>{

   const name=docSnap.id;
   const data=docSnap.data();

   const tr=document.createElement("tr");
   tr.innerHTML=`<td>${name}</td>`;

   schedule.forEach(day=>{

     const val=data[day]||"未選択";

     if(val==="〇参加できます")
       goodCount[day]++;

     tr.innerHTML+=`<td>${val}</td>`;
   });

   table.appendChild(tr);
 });

 result.appendChild(table);

 const max=Math.max(...Object.values(goodCount));

 const best=Object.keys(goodCount)
   .filter(d=>goodCount[d]===max);

 document.getElementById("bestDay").textContent =
   "⭐おすすめ日程：" +
   best.join(" / ") +
   `（${max}人参加可能）`;

});
