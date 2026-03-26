// ===== Firebase =====
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
 getFirestore,
 doc,
 setDoc,
 deleteDoc,
 collection,
 onSnapshot,
 getDoc
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
 "未選択",
 "〇参加できます",
 "午前のみ",
 "午後のみ",
 "×参加できません"
];

// ===== UI生成 =====
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
 let allEmpty = true;

 schedule.forEach(day=>{
   const val=document.getElementById("date_"+day).value;
   if(val !== "未選択"){
     allEmpty = false;
   }
   data[day]=val;
 });

 const docRef = doc(db,"responses",name);
 const existing = await getDoc(docRef);

 // 🔥 全部未選択なら削除
 if(allEmpty){
   if(existing.exists()){
     await deleteDoc(docRef);
     document.getElementById("message").textContent =
       "🗑 全て未選択だったため回答を削除しました";
   } else {
     document.getElementById("message").textContent =
       "未選択のため保存されませんでした";
   }
   return;
 }

 // 通常保存
 await setDoc(docRef,data);

 if(existing.exists()){
   document.getElementById("message").textContent =
     "✅ 回答を更新しました";
 } else {
   document.getElementById("message").textContent =
     "✅ 新しく回答を保存しました";
 }
}

window.submitAnswer=submitAnswer;

// ===== 手動削除 =====
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


// ===== 結果表示 =====
onSnapshot(collection(db,"responses"),snapshot=>{

 const resultDiv=document.getElementById("result");
 resultDiv.innerHTML="";

 if(snapshot.empty){
   document.getElementById("bestDay").textContent="";
   return;
 }

 const table=document.createElement("table");

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

 const max=Math.max(...Object.values(goodCount));
 const best=Object.keys(goodCount)
   .filter(d=>goodCount[d]===max);

 document.getElementById("bestDay").textContent=
   "⭐ 最適日程：" +
   best.join(" / ") +
   `（参加可能 ${max}人）`;

});
