// =====================
// 日程一覧
// =====================
const dates = [
"3/29(金)","3/30(土)","3/31(日)",
"4/1(水)","4/2(木)","4/3(金)",
"4/4(土)","4/5(日)","4/6(月)",
"4/7(火)","4/26(土)","4/27(日)"
];

const options = [
"いける",
"午前だけ",
"午後だけ",
"いけない"
];

let data = JSON.parse(localStorage.getItem("classData")||"{}");

// =====================
// 表作成
// =====================
const table=document.getElementById("scheduleTable");

let header="<tr><th>日程</th><th>出席</th></tr>";

dates.forEach(d=>{
 header+=`
 <tr>
   <td>${d}</td>
   <td>
     <select id="${d}">
       ${options.map(o=>`<option>${o}</option>`).join("")}
     </select>
   </td>
 </tr>`;
});

table.innerHTML=header;


// =====================
// 送信（変更もここ）
// =====================
function submitForm(){

 const name=document.getElementById("name").value.trim();

 if(!name){
  alert("名前を入力してください");
  return;
 }

 data[name]={};

 dates.forEach(d=>{
  data[name][d]=document.getElementById(d).value;
 });

 localStorage.setItem("classData",JSON.stringify(data));

 renderResults();
}

// =====================
// 集計表示
// =====================
function renderResults(){

 const div=document.getElementById("results");
 div.innerHTML="";

 let bestDay="";
 let bestScore=-1;

 dates.forEach(date=>{

   let ok=0;
   let morning=0;
   let afternoon=0;

   for(const name in data){
     const v=data[name][date];

     if(v==="いける"){
       ok++; morning++; afternoon++;
     }
     if(v==="午前だけ") morning++;
     if(v==="午後だけ") afternoon++;
   }

   const score = ok*2 + morning + afternoon;

   if(score>bestScore){
     bestScore=score;
     bestDay=date;
   }

   div.innerHTML+=`
   <p>
   ${date}<br>
   ◎いける:${ok}人　
   🌞午前OK:${morning}人　
   🌙午後OK:${afternoon}人
   </p>`;
 });

 document.getElementById("recommend").innerText =
   "⭐おすすめ開催日："+bestDay;
}

renderResults();
