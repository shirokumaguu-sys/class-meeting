// ======================
// データ保存
// ======================
let data = {};

// ======================
// 送信処理
// ======================
function submitData(){

  const date = document.getElementById("date").value;
  const morningInput = document.getElementById("morning").value;
  const afternoonInput = document.getElementById("afternoon").value;

  if(!date){
    alert("日付を選んでください");
    return;
  }

  // 空でもOKにする
  const morning = Number(morningInput) || 0;
  const afternoon = Number(afternoonInput) || 0;

  if(!data[date]){
    data[date] = {morning:0, afternoon:0};
  }

  data[date].morning += morning;
  data[date].afternoon += afternoon;

  renderCalendar();
  showResult();

  // 入力リセット
  document.getElementById("morning").value="";
  document.getElementById("afternoon").value="";
}

// ======================
// カレンダー表示
// ======================
function renderCalendar(){

  const calendar = document.getElementById("calendar");
  calendar.innerHTML="";

  const dates = Object.keys(data).sort();

  dates.forEach(date=>{
    const d = data[date];

    const div = document.createElement("div");
    div.className="day";

    div.innerHTML = `
      <strong>${date}</strong><br>
      午前：${d.morning}<br>
      午後：${d.afternoon}
    `;

    calendar.appendChild(div);
  });
}

// ======================
// 結果表示（最混雑）
// ======================
function showResult(){

  let maxPeople = -1;
  let maxText = "データなし";

  for(const date in data){

    if(data[date].morning > maxPeople){
      maxPeople = data[date].morning;
      maxText = `${date} の午前`;
    }

    if(data[date].afternoon > maxPeople){
      maxPeople = data[date].afternoon;
      maxText = `${date} の午後`;
    }
  }

  document.getElementById("result").innerText =
    `一番人が多い時間：${maxText}（${maxPeople}人）`;
}
