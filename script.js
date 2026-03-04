const API_KEY = "927328d3c74c3898d730d3c158059809";

const river = localStorage.getItem("river") || "Krishna";
document.getElementById("riverName").innerText = river + " River";

const riverMap = {
  Indus: "Leh",
  Ganga: "Varanasi",
  Brahmaputra: "Guwahati",
  Yamuna: "Delhi",
  Sutlej: "Ludhiana",
  Beas: "Jalandhar",
  Chenab: "Jammu",
  Jhelum: "Srinagar",

  Godavari: "Rajahmundry",
  Krishna: "Vijayawada",
  Narmada: "Jabalpur",
  Mahanadi: "Cuttack",
  Kaveri: "Tiruchirappalli",
  Tapti: "Surat",
  Sabarmati: "Ahmedabad"
};

/* 🔥 CARD COLOR LOGIC */
/* 🟢 Good = Green hover */
/* 🟡 Medium = Yellow hover */
/* 🔴 Bad = Red hover */

function setCardStatus(id,value,type){

  const el=document.getElementById(id);
  el.classList.remove("good","medium","bad");

  if(type=="temp"){
    if(value<30)el.classList.add("good");     // 🟢 Green hover (safe temperature)
    else if(value<40)el.classList.add("medium"); // 🟡 Yellow hover (moderate)
    else el.classList.add("bad");             // 🔴 Red hover (high temperature)
  }

  if(type=="pm"){
    if(value<50)el.classList.add("good");     // 🟢 Green hover (clean air)
    else if(value<100)el.classList.add("medium"); // 🟡 Yellow hover (moderate pollution)
    else el.classList.add("bad");             // 🔴 Red hover (high pollution)
  }

  if(type=="ph"){
    if(value>=6.5 && value<=8.5)el.classList.add("good"); // 🟢 Green hover (safe water pH)
    else el.classList.add("bad");                         // 🔴 Red hover (unsafe pH)
  }

  /* 🆕 HUMIDITY */
  if(type=="humidity"){
    if(value>=40 && value<=70)el.classList.add("good");   // 🟢 Green hover (good humidity)
    else if(value>=20)el.classList.add("medium");         // 🟡 Yellow hover (moderate)
    else el.classList.add("bad");                         // 🔴 Red hover (very low humidity)
  }

}

/* HEALTH */
/* 🟢 Healthy → Green */
/* 🟡 Moderate → Yellow */
/* 🔴 Critical → Red */

function calculateHealth(d,t,pm){

  let s=0;

  if(d.ph>=6.5&&d.ph<=8.5)s++;
  if(d.do>6)s++;
  if(d.bod<3)s++;
  if(pm<60)s++;
  if(t<30)s++;

  return s>=4?"Healthy":s>=2?"Moderate":"Critical";

}

function getScore(d,t,pm){

  let s=0;

  if(d.ph>=6.5&&d.ph<=8.5)s+=20;
  if(d.do>6)s+=20;
  if(d.bod<3)s+=20;
  if(pm<60)s+=20;
  if(t<30)s+=20;

  return s;

}

function refreshData(){
  location.reload();
}

/* MAIN */
async function loadData(){

  const res=await fetch("data.json");
  const data=await res.json();

  const r=data.rivers.find(x=>x.river_name===river);

  document.getElementById("ph").innerText="pH: "+r.ph;

  /* 🐟 BIODIVERSITY */
  document.getElementById("biodiversity").innerHTML=`
    <p><b>🐟 Fish:</b> ${r.fish_species.join(", ")}</p>
    <p><b>🌿 Plants:</b> ${r.aquatic_plants.join(", ")}</p>
  `;

  const city=riverMap[river];

  const w=await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  ).then(r=>r.json());

  const temp=w.main.temp;
  const hum=w.main.humidity;

  document.getElementById("temp").innerText="Temp: "+temp+"°C";
  document.getElementById("humidity").innerText="Humidity: "+hum+"%";

  const pm=r.pm25;

  document.getElementById("pm25").innerText="PM2.5: "+pm;

  /* 🔥 APPLY COLORS (hover colors based on condition) */
  setCardStatus("temp",temp,"temp");
  setCardStatus("pm25",pm,"pm");
  setCardStatus("ph",r.ph,"ph");
  setCardStatus("humidity",hum,"humidity");

  const status=calculateHealth(r,temp,pm);
  const score=getScore(r,temp,pm);

  const h=document.getElementById("health");

  h.innerText="Ecosystem: "+status;

  /* 🟢 Healthy → Green text */
  /* 🟡 Moderate → Yellow text */
  /* 🔴 Critical → Red text */

  h.className="health "+(
    status=="Healthy"?"green":
    status=="Moderate"?"yellow":"red"
  );

  document.getElementById("scoreMeter").innerText="Score: "+score;

  /* GRAPH 1 */
  new Chart(document.getElementById("chart1"),{

    type:'line',

    data:{
      labels:["Temp","PM2.5","DO"],

      datasets:[{
        label:"Environmental Data",
        data:[temp,pm,r.do],
        borderColor:"#22c55e", // 🟢 Green line
        tension:0.4
      }]
    }

  });

  /* GRAPH 2 */
  new Chart(document.getElementById("chart2"),{

    type:'bar',

    data:{
      labels:["pH","DO","BOD"],

      datasets:[{
        label:"Water Quality",
        data:[r.ph,r.do,r.bod],
        backgroundColor:[
          "#0ea5e9", // 🔵 Blue (pH)
          "#22c55e", // 🟢 Green (DO)
          "#ef4444"  // 🔴 Red (BOD)
        ]
      }]
    }

  });

  /* MAP */
  const map=L.map('map').setView([r.latitude,r.longitude],7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  L.marker([r.latitude,r.longitude]).addTo(map);

  /* 💡 SUGGESTIONS SECTION */

  let suggestionsHTML="";

  if(status=="Healthy"){

    suggestionsHTML=`
    <h3>Suggestions</h3>
    <ul>
    <li>Water quality is healthy. Continue regular monitoring.</li>
    <li>Protect aquatic plants and fish species.</li>
    <li>Avoid dumping waste into the river.</li>
    <li>Maintain clean surroundings near the river.</li>
    </ul>
    `;

  }

  else if(status=="Moderate"){

    suggestionsHTML=`
    <h3>Suggestions</h3>
    <ul>
    <li>Some pollution is detected in this river.</li>
    <li>Aquatic plants and fish may be affected.</li>
    <li>Farmers using this water for irrigation should monitor crop impact.</li>
    <li>Reduce waste discharge and protect surrounding areas.</li>
    </ul>
    `;

  }

  else{

    suggestionsHTML=`
    <h3>Suggestions</h3>
    <ul>
    <li>Water pollution is critical.</li>
    <li>Aquatic animals and plants may be seriously affected.</li>
    <li>Polluted water can harm agriculture irrigation.</li>
    <li>Nearby land and water areas may also get polluted.</li>
    </ul>
    `;

  }

  document.getElementById("suggestions").innerHTML=suggestionsHTML;

  document.getElementById("loader").style.display="none";

}

loadData();