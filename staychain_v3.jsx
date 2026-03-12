import { useState, useEffect, useRef } from "react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#222;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes bounceIn{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
@keyframes qrPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,56,92,.4)}70%{box-shadow:0 0 0 12px rgba(255,56,92,0)}}
@keyframes scanLine{0%{top:0}100%{top:100%}}
@keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mkTx = () => "0x" + Array.from({length:64},()=>"0123456789abcdef"[Math.random()*16|0]).join("");
const mkCID = () => "Qm" + Array.from({length:44},()=>"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789"[Math.random()*58|0]).join("");
const mkBlock = () => (18200000 + Math.random()*100000|0).toString();
const fmtINR = n => "₹" + Number(n).toLocaleString("en-IN");
const fmtD = s => { try { return new Date(s).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); } catch { return s; }};
const nowStr = () => new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

// ── 80 Hotels across India ────────────────────────────────────────────────────
const HOTELS = [
  // ── Heritage Palaces ──────────────────────────────────────────────────────
  {id:1,name:"The Leela Palace",city:"Udaipur, Rajasthan",price:12500,rating:4.97,reviews:284,type:"Heritage Palace",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75"],
    owner:{name:"Arjun Mewar",photo:"https://i.pravatar.cc/56?img=11",since:"2018"},
    desc:"A restored 18th-century palace on the banks of Lake Pichola. Hand-painted frescoes, antique Rajasthani furniture, and silk draperies. Peacocks roam the marble courtyards at sunrise.",
    amenities:["Lake view","Infinity pool","Ayurvedic spa","Heritage walks","Butler service"],
    locality:"City Palace District, 200m from Lake Pichola ghats.",
    localityImg:"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:2,name:"Taj Mahal Tower",city:"Mumbai, Maharashtra",price:18000,rating:4.95,reviews:512,type:"City Landmark",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=75","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=700&q=75","https://images.unsplash.com/photo-1586105251261-72a756497a11?w=700&q=75"],
    owner:{name:"Priya Kapoor",photo:"https://i.pravatar.cc/56?img=47",since:"2017"},
    desc:"Iconic harbour-view suites overlooking the Gateway of India. Edwardian grandeur meets contemporary luxury.",
    amenities:["Harbour view","Rooftop bar","Spa","Concierge","Fine dining"],
    locality:"Colaba waterfront, 2-min walk to Gateway of India.",
    localityImg:"https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:3,name:"Jodhpur Blue Haveli",city:"Jodhpur, Rajasthan",price:5500,rating:4.88,reviews:176,type:"Heritage Haveli",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=700&q=75","https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=700&q=75","https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=75"],
    owner:{name:"Vikram Rathore",photo:"https://i.pravatar.cc/56?img=15",since:"2019"},
    desc:"A 200-year-old indigo-washed haveli in Jodhpur's old city. Rooftop overlooks Mehrangarh Fort dramatically lit at night.",
    amenities:["Fort view","Rajasthani meals","Desert safari","Camel ride","Local guide"],
    locality:"Old City, 400m from Mehrangarh Fort.",
    localityImg:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:4,name:"Jaipur Pink Mahal",city:"Jaipur, Rajasthan",price:8800,rating:4.91,reviews:203,type:"Heritage Palace",superhost:true,rooms:3,
    cover:"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=75","https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=700&q=75","https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&q=75"],
    owner:{name:"Meera Shekhawat",photo:"https://i.pravatar.cc/56?img=22",since:"2016"},
    desc:"Pink sandstone palace with 12 suites, each named after a Rajput queen. Elephant rides and folk music evenings are daily rituals.",
    amenities:["Elephant ride","Folk music","Palace gardens","Puppet shows","Royal dining"],
    locality:"Bani Park, 15-min from Hawa Mahal.",
    localityImg:"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:5,name:"Mysore Royal Retreat",city:"Mysore, Karnataka",price:7200,rating:4.86,reviews:139,type:"Heritage Palace",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=75","https://images.unsplash.com/photo-1612011213000-91cf5cbf3eb2?w=700&q=75","https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=700&q=75"],
    owner:{name:"Chandrika Wodeyar",photo:"https://i.pravatar.cc/56?img=31",since:"2020"},
    desc:"Teak-pillared 1920s palace adjacent to the Mysore Zoo. Silk weaving demonstrations and palace light-show views every Sunday.",
    amenities:["Palace view","Silk weaving","Heritage dining","Yoga lawn","Bird watching"],
    locality:"Nazarbad, 500m from Mysore Palace.",
    localityImg:"https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},

  // ── Beach & Coastal ───────────────────────────────────────────────────────
  {id:6,name:"Ashvem Beach Villa",city:"North Goa, Goa",price:11500,rating:4.91,reviews:419,type:"Beachfront Villa",superhost:true,rooms:3,
    cover:"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=75","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=75"],
    owner:{name:"Maria Fernandes",photo:"https://i.pravatar.cc/56?img=5",since:"2018"},
    desc:"Private villas where the Arabian Sea is your backyard. Portuguese-tile accents, plunge pool, chef Maria's seafood platters are legendary.",
    amenities:["Private pool","Beach butler","Seafood BBQ","Kayaking","Sunset yoga"],
    locality:"Ashvem Beach, 10-min from Chapora Fort.",
    localityImg:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:7,name:"Kovalam Cliff Resort",city:"Kovalam, Kerala",price:6200,rating:4.84,reviews:287,type:"Beachfront Villa",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75","https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75","https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75"],
    owner:{name:"Rajan Pillai",photo:"https://i.pravatar.cc/56?img=12",since:"2019"},
    desc:"Clifftop rooms with panoramic Arabian Sea views. Lighthouse visible from every balcony. Authentic Kerala fish curry for breakfast.",
    amenities:["Sea view","Lighthouse walk","Kerala cuisine","Surf lessons","Ayurveda"],
    locality:"Lighthouse Beach, Kovalam.",
    localityImg:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:8,name:"Radhanagar Shore Hut",city:"Havelock Island, A&N",price:9400,rating:4.93,reviews:94,type:"Beachfront Villa",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75"],
    owner:{name:"Deva Shankar",photo:"https://i.pravatar.cc/56?img=41",since:"2021"},
    desc:"Bamboo huts 30m from Asia's best beach. Bioluminescent sea at night, coral reefs for snorkelling at dawn. Zero light pollution.",
    amenities:["Snorkelling","Bioluminescence tours","Fresh seafood","Kayaking","Diving lessons"],
    locality:"Radhanagar Beach, Havelock Island.",
    localityImg:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:9,name:"Vagator Cliffhouse",city:"North Goa, Goa",price:7800,rating:4.87,reviews:312,type:"Beachfront Villa",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75"],
    owner:{name:"Antonio Pereira",photo:"https://i.pravatar.cc/56?img=3",since:"2020"},
    desc:"Red laterite cliffhouse above Little Vagator Beach. Infinity plunge pool, hammocks over the sea, trance music Saturdays.",
    amenities:["Infinity pool","Cliff views","Private beach path","Hammocks","DJ Saturdays"],
    locality:"Vagator Cliff, Bardez.",
    localityImg:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:10,name:"Mahabalipuram Shore Room",city:"Mahabalipuram, Tamil Nadu",price:4800,rating:4.82,reviews:188,type:"Beachfront Villa",superhost:false,rooms:8,
    cover:"https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75"],
    owner:{name:"Suresh Kannan",photo:"https://i.pravatar.cc/56?img=8",since:"2018"},
    desc:"Rooms overlooking the Shore Temple lit golden at dusk. Temple-carved stone courtyard, fresh-catch thalis served in palm-leaf plates.",
    amenities:["Temple view","Heritage walk","Fresh thali","Sunrise yoga","Craft market"],
    locality:"Shore Temple Beach, East Coast Road.",
    localityImg:"https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},

  // ── Forest & Eco ──────────────────────────────────────────────────────────
  {id:11,name:"Coorg Forest Cottage",city:"Madikeri, Karnataka",price:6800,rating:4.92,reviews:198,type:"Forest Retreat",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=700&q=75","https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Anand Thimmaiah",photo:"https://i.pravatar.cc/56?img=33",since:"2019"},
    desc:"Stone-and-timber cottages inside a 12-acre arabica coffee estate. Wake to fresh roast scent, walk the plantation, bonfire evenings.",
    amenities:["Coffee walks","Bonfire","Organic meals","Waterfall trek","Bird watching"],
    locality:"5km from Abbey Falls, 2hr from Mysore.",
    localityImg:"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:12,name:"Wayanad Treehouse",city:"Vythiri, Kerala",price:8200,rating:4.94,reviews:367,type:"Treehouse",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=700&q=75","https://images.unsplash.com/photo-1565118531796-763e5082d113?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Sreedharan Nair",photo:"https://i.pravatar.cc/56?img=44",since:"2018"},
    desc:"Eight treehouses 30 feet above the forest floor, connected by rope bridges. UNESCO Biosphere naturalist-led dawn forest trails.",
    amenities:["Dawn walks","Rope bridges","Organic meals","Bamboo spa","Night safari"],
    locality:"Vythiri Village, Wayanad Wildlife Sanctuary edge.",
    localityImg:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:13,name:"Bandipur Jungle Lodge",city:"Bandipur, Karnataka",price:7600,rating:4.89,reviews:224,type:"Forest Retreat",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75","https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=700&q=75"],
    owner:{name:"Krishnamurthy",photo:"https://i.pravatar.cc/56?img=29",since:"2019"},
    desc:"Inside Bandipur Tiger Reserve buffer zone. Morning jeep safaris, elephant sightings guaranteed in winter months.",
    amenities:["Jeep safari","Tiger tracking","Naturalist guide","Camp bonfire","Bird walks"],
    locality:"Bandipur National Park buffer zone, 80km from Mysore.",
    localityImg:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:14,name:"Munnar Tea Estate Bungalow",city:"Munnar, Kerala",price:5900,rating:4.85,reviews:301,type:"Forest Retreat",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Thomas Mathew",photo:"https://i.pravatar.cc/56?img=19",since:"2017"},
    desc:"1920s British planter's bungalow surrounded by 400 acres of rolling tea. Mist rolls in every afternoon. Guided factory tours included.",
    amenities:["Tea factory tour","Mist walks","Planter's breakfast","Bird watching","Campfire"],
    locality:"Chinnakanal Estate, 22km from Munnar town.",
    localityImg:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:15,name:"Chikmagalur Coffee Cabin",city:"Chikmagalur, Karnataka",price:4400,rating:4.83,reviews:156,type:"Forest Retreat",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75"],
    owner:{name:"Shilpa Hegde",photo:"https://i.pravatar.cc/56?img=38",since:"2021"},
    desc:"Teak log cabins inside India's first coffee-growing region. Mullayanagiri peak trek at sunrise, estate-fresh coffee all day.",
    amenities:["Estate coffee","Mountain trek","Organic meals","Bonfire","Cycling"],
    locality:"Baba Budan Giri foothills, 350km from Bangalore.",
    localityImg:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},

  // ── Mountain & Hill ───────────────────────────────────────────────────────
  {id:16,name:"Manali Snow Lodge",city:"Old Manali, Himachal Pradesh",price:7200,rating:4.86,reviews:231,type:"Mountain Lodge",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75","https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75"],
    owner:{name:"Karma Dolma",photo:"https://i.pravatar.cc/56?img=27",since:"2018"},
    desc:"Himalayan stone-and-timber lodge at 2050m. Heated floors, wood-burning fireplace. Observatory deck with unobstructed Milky Way views.",
    amenities:["Observatory","Heated floors","Ski packages","Bonfire","Hot springs"],
    locality:"Old Manali Village, 3km from New Manali.",
    localityImg:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:17,name:"Shimla Heritage Cottage",city:"Shimla, Himachal Pradesh",price:5600,rating:4.81,reviews:178,type:"Mountain Lodge",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75"],
    owner:{name:"Rajesh Chauhan",photo:"https://i.pravatar.cc/56?img=16",since:"2019"},
    desc:"Victorian colonial cottage on Jakhu Hill. Monkeys in the deodar trees, toy-train views, apple orchard breakfasts.",
    amenities:["Apple orchard","Toy train view","Fireplace","Mall Road walk","Apple picking"],
    locality:"Jakhu Hill, Shimla, 2km from the Ridge.",
    localityImg:"https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:18,name:"Spiti Valley Camp",city:"Kaza, Himachal Pradesh",price:6500,rating:4.90,reviews:89,type:"Mountain Lodge",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75","https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75"],
    owner:{name:"Tenzin Wangchuk",photo:"https://i.pravatar.cc/56?img=52",since:"2021"},
    desc:"High-altitude luxury camping at 3800m in Spiti Valley. Solar-heated tents, local Spitian cuisine, monastery visits at 12,000 feet.",
    amenities:["Monastery tours","Star gazing","Local cuisine","Yak safari","Photography"],
    locality:"Kaza Town, Spiti Valley, 200km from Manali.",
    localityImg:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:19,name:"Darjeeling Tea Bungalow",city:"Darjeeling, West Bengal",price:7800,rating:4.88,reviews:214,type:"Mountain Lodge",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75"],
    owner:{name:"Prashant Rai",photo:"https://i.pravatar.cc/56?img=21",since:"2017"},
    desc:"1880s colonial bungalow on a working first-flush tea estate. Kanchenjunga sunrise from the verandah. Toy train station 200m away.",
    amenities:["Tea factory","Kanchenjunga view","Toy train","Plucking experience","Fireplace"],
    locality:"Happy Valley Estate, 3km from Darjeeling Mall.",
    localityImg:"https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:20,name:"Ooty Colonial Home",city:"Ooty, Tamil Nadu",price:4900,rating:4.80,reviews:267,type:"Mountain Lodge",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Annamalai Gounder",photo:"https://i.pravatar.cc/56?img=9",since:"2018"},
    desc:"Eucalyptus-scented colonial bungalow in the Nilgiris. Rose garden, strawberry farm, and the Blue Mountain Railway within walking distance.",
    amenities:["Rose garden","Strawberry picking","Blue Mountain Railway","Boating","Organic meals"],
    locality:"Ooty Lake Road, 10-min to Botanical Gardens.",
    localityImg:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},

  // ── Glamping & Desert ─────────────────────────────────────────────────────
  {id:21,name:"Rann Luxury Tents",city:"Dhordo, Gujarat",price:14000,rating:4.89,reviews:143,type:"Glamping",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75","https://images.unsplash.com/photo-1500581276021-a4469e3a8b6f?w=700&q=75"],
    owner:{name:"Harshida Parmar",photo:"https://i.pravatar.cc/56?img=25",since:"2020"},
    desc:"Climate-controlled canvas pavilions over the White Rann salt flats. Full-moon the salt glows silver for miles. Kutchi folk performances nightly.",
    amenities:["Salt flat safari","Stargazing","Camel rides","Folk nights","Gourmet meals"],
    locality:"400m from White Rann viewpoint. 4hr from Bhuj airport.",
    localityImg:"https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:22,name:"Jaisalmer Desert Camp",city:"Jaisalmer, Rajasthan",price:8900,rating:4.93,reviews:201,type:"Glamping",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75"],
    owner:{name:"Jagdish Purohit",photo:"https://i.pravatar.cc/56?img=17",since:"2019"},
    desc:"Sleep under the stars in the Thar Desert. Swiss-style tents with attached baths, camel safari at sunset, live Rajasthani folk music.",
    amenities:["Camel safari","Desert trek","Folk music","Rajasthani dinner","Star gazing"],
    locality:"Sam Sand Dunes, 42km from Jaisalmer Fort.",
    localityImg:"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:23,name:"Pushkar Bubble Camp",city:"Pushkar, Rajasthan",price:6600,rating:4.87,reviews:112,type:"Glamping",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75","https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=700&q=75"],
    owner:{name:"Bhopal Singh",photo:"https://i.pravatar.cc/56?img=43",since:"2022"},
    desc:"Transparent bubble tents overlooking the sacred Pushkar Lake. Star ceiling effect even on cloudy nights. Brahma Temple at 5am arti.",
    amenities:["Lake view","Transparent dome","Arti walks","Camel ride","Desert sunrise"],
    locality:"Pushkar Lake edge, 700m from Brahma Temple.",
    localityImg:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},

  // ── Floating & Backwater ──────────────────────────────────────────────────
  {id:24,name:"Alleppey Houseboat",city:"Alleppey, Kerala",price:9500,rating:4.96,reviews:308,type:"Floating Suite",superhost:true,rooms:3,
    cover:"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1559467286-1c82cec44a71?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75","https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75"],
    owner:{name:"George Kuriakose",photo:"https://i.pravatar.cc/56?img=37",since:"2017"},
    desc:"A converted traditional kettuvallam drifting through Kerala's backwaters. Private chef serving fresh catches. 48hrs of uninterrupted canal sunsets.",
    amenities:["Private chef","Backwater cruise","Sunset deck","Village walks","Ayurvedic oils"],
    locality:"Vembanad Lake, starting from Alappuzha boat jetty.",
    localityImg:"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:25,name:"Kumarakom Lake House",city:"Kumarakom, Kerala",price:11200,rating:4.94,reviews:189,type:"Floating Suite",superhost:true,rooms:3,
    cover:"https://images.unsplash.com/photo-1559467286-1c82cec44a71?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75","https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75"],
    owner:{name:"Beena Varghese",photo:"https://i.pravatar.cc/56?img=48",since:"2018"},
    desc:"Stilted heritage villa at the edge of Vembanad Lake. 200-year-old teak interiors, attached private jetty, crab fishing at dusk.",
    amenities:["Private jetty","Crab fishing","Lake yoga","Bird watching","Canoe ride"],
    locality:"Kumarakom Bird Sanctuary edge, 16km from Kottayam.",
    localityImg:"https://images.unsplash.com/photo-1559467286-1c82cec44a71?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},

  // ── Boutique & Urban ──────────────────────────────────────────────────────
  {id:26,name:"Pondicherry French B&B",city:"Pondicherry, Tamil Nadu",price:4200,rating:4.85,reviews:254,type:"Boutique B&B",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75"],
    owner:{name:"Aurélien Dupont",photo:"https://i.pravatar.cc/56?img=7",since:"2019"},
    desc:"Mustard-yellow colonial mansion on Rue Romain Rolland. High ceilings, wrought-iron balconies. Breakfast: croissants with filter coffee and coconut chutney.",
    amenities:["Franco-Tamil breakfast","Bicycle rental","Rooftop terrace","Auroville tours","Beach 5min"],
    locality:"French Quarter, White Town, Pondicherry.",
    localityImg:"https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:27,name:"Bangalore Artist Loft",city:"Indiranagar, Karnataka",price:3800,rating:4.78,reviews:421,type:"Boutique B&B",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75"],
    owner:{name:"Nisha Sharma",photo:"https://i.pravatar.cc/56?img=46",since:"2020"},
    desc:"Refurbished factory loft in Indiranagar. Local artist murals cover every wall. Walk to craft breweries, vinyl record shops, farm-to-table bistros.",
    amenities:["Art studio","Craft beer walk","Vinyl library","Rooftop café","Co-working"],
    locality:"100 Feet Road, Indiranagar. Walkable to Cubbon Park.",
    localityImg:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:28,name:"Kolkata Heritage Mansion",city:"Kolkata, West Bengal",price:5100,rating:4.83,reviews:167,type:"Boutique B&B",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=700&q=75","https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75"],
    owner:{name:"Debashis Roy",photo:"https://i.pravatar.cc/56?img=13",since:"2018"},
    desc:"1890s zamindari mansion with ornate plasterwork and billiard rooms. Street food tours of Tiretti Bazaar and Kumortuli potter's quarter.",
    amenities:["Heritage tour","Street food walk","Billiard room","Colonial library","River evening"],
    locality:"Shyambazar, North Kolkata. 15-min to Howrah Bridge.",
    localityImg:"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:29,name:"Chennai Marina Suites",city:"Chennai, Tamil Nadu",price:5800,rating:4.80,reviews:193,type:"Boutique B&B",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=700&q=75"],
    owner:{name:"Kavitha Rajan",photo:"https://i.pravatar.cc/56?img=35",since:"2019"},
    desc:"Art-deco building 200m from Marina Beach. Filter coffee on the balcony at dawn, evening samosa walks to the beach. Jazz bar in the building.",
    amenities:["Marina view","Filter coffee","Jazz bar","Beach yoga","Temple walks"],
    locality:"Luz Church Road, Mylapore. 200m from Marina Beach.",
    localityImg:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:30,name:"Delhi Hauz Khas Loft",city:"Hauz Khas, Delhi",price:6400,rating:4.86,reviews:342,type:"Boutique B&B",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75"],
    owner:{name:"Ritu Malhotra",photo:"https://i.pravatar.cc/56?img=50",since:"2017"},
    desc:"Modern loft overlooking the medieval Hauz Khas lake and deer park. Gallery district, indie restaurants and vintage boutiques at your doorstep.",
    amenities:["Lake view","Gallery tours","Rooftop party","Cycling","Art market"],
    locality:"Hauz Khas Village, South Delhi. 10-min to IIT Delhi metro.",
    localityImg:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},

  // ── More spread across India ──────────────────────────────────────────────
  {id:31,name:"Hampi Ruins Cottage",city:"Hampi, Karnataka",price:3900,rating:4.87,reviews:198,type:"Boutique B&B",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75","https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75","https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=700&q=75"],
    owner:{name:"Suleman Khan",photo:"https://i.pravatar.cc/56?img=23",since:"2020"},
    desc:"Mud-and-stone cottage inside the Hampi UNESCO World Heritage zone. Virupaksha Temple bell at dawn, boulder-scrambling at sunset.",
    amenities:["Sunrise ruins walk","Coracle ride","Boulder trek","Cycle rent","Temple visits"],
    locality:"Hampi Bazaar, 500m from Virupaksha Temple.",
    localityImg:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:32,name:"Kaziranga Elephant Lodge",city:"Kaziranga, Assam",price:8100,rating:4.90,reviews:76,type:"Forest Retreat",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Bolin Gogoi",photo:"https://i.pravatar.cc/56?img=56",since:"2021"},
    desc:"Stilted lodge at the edge of Kaziranga National Park. Elephant safari to spot one-horned rhinos. Brahmaputra river views from every room.",
    amenities:["Elephant safari","Rhino tracking","Brahmaputra views","Assamese meals","Bird walks"],
    locality:"Kohora range, Kaziranga NP western edge.",
    localityImg:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:33,name:"Leh Ladakh Mud House",city:"Leh, Ladakh",price:5300,rating:4.88,reviews:134,type:"Mountain Lodge",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75"],
    owner:{name:"Stanzin Dolkar",photo:"https://i.pravatar.cc/56?img=54",since:"2019"},
    desc:"Traditional Ladakhi mud-brick home at 3500m. Prayer flags, monastery rooftop views, hand-kneaded tsampa breakfasts. Solar-powered.",
    amenities:["Monastery trek","Pangong day trip","Tsampa breakfast","Stargazing","Bike rental"],
    locality:"Old Leh town, 1km from Leh Palace.",
    localityImg:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:34,name:"Rishikesh River Camp",city:"Rishikesh, Uttarakhand",price:4700,rating:4.84,reviews:389,type:"Glamping",superhost:true,rooms:6,
    cover:"https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75","https://images.unsplash.com/photo-1500581276021-a4469e3a8b6f?w=700&q=75"],
    owner:{name:"Ramesh Bhatt",photo:"https://i.pravatar.cc/56?img=26",since:"2018"},
    desc:"Riverside camping on the banks of the Ganga. White-water rafting grades 3-5, Ganga aarti at Triveni Ghat, morning yoga by the river.",
    amenities:["River rafting","Ganga aarti","River yoga","Bungee jump","Camping"],
    locality:"Shivpuri Beach, 16km from Rishikesh Laxman Jhula.",
    localityImg:"https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:35,name:"Nainital Lake Cabin",city:"Nainital, Uttarakhand",price:5200,rating:4.82,reviews:276,type:"Mountain Lodge",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75"],
    owner:{name:"Kaveri Bisht",photo:"https://i.pravatar.cc/56?img=39",since:"2019"},
    desc:"Pine-panelled cabin directly above Naini Lake. Rowing boats available at 6am. Snow View peak via aerial ropeway 500m away.",
    amenities:["Lake boating","Snow View ropeway","Fireplace","Apple orchards","Forest walk"],
    locality:"Mallital, above Naini Lake. 300m from Mall Road.",
    localityImg:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:36,name:"Mussoorie Cloud Villa",city:"Mussoorie, Uttarakhand",price:5700,rating:4.83,reviews:201,type:"Mountain Lodge",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75"],
    owner:{name:"Priyanka Nautiyal",photo:"https://i.pravatar.cc/56?img=30",since:"2020"},
    desc:"Cantilevered villa on a cliff above the Doon Valley. Cloud-level terraces, Himalayan foothill panoramas, and Mall Road 10-min walk.",
    amenities:["Valley panorama","Cantilevered deck","Landour walks","Heritage bakery","Fireplace"],
    locality:"Landour, Mussoorie. Above Char Dukan café row.",
    localityImg:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:37,name:"Vagamon Meadow Hut",city:"Vagamon, Kerala",price:4100,rating:4.81,reviews:143,type:"Forest Retreat",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75"],
    owner:{name:"Anil Menon",photo:"https://i.pravatar.cc/56?img=14",since:"2021"},
    desc:"Perched on pine-meadow ridges with 360° cloud views. Paragliding launch pad 200m away. Wild strawberries grow at the doorstep.",
    amenities:["Paragliding","Pine meadows","Cycling","Fishing","Strawberry picking"],
    locality:"Thangalpara, Vagamon. 45km from Kottayam.",
    localityImg:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:38,name:"Varkala Cliff Cottage",city:"Varkala, Kerala",price:5400,rating:4.85,reviews:311,type:"Beachfront Villa",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75","https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75"],
    owner:{name:"Lakshmi Devi",photo:"https://i.pravatar.cc/56?img=34",since:"2018"},
    desc:"Clifftop perch above Varkala's red-laterite cliffs, North Cliff strip. Mineral springs at beach, Janardana Temple sunrise arti 10-min walk.",
    amenities:["Cliff views","Mineral springs","Temple sunrise","Ayurveda","Surfing"],
    locality:"North Cliff, Varkala. 51km from Thiruvananthapuram.",
    localityImg:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:39,name:"Kutch Village Stay",city:"Bhuj, Gujarat",price:3600,rating:4.79,reviews:98,type:"Boutique B&B",superhost:false,rooms:8,
    cover:"https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75","https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75"],
    owner:{name:"Jivaben Sodha",photo:"https://i.pravatar.cc/56?img=28",since:"2022"},
    desc:"Authentic bhungas (circular mud huts) decorated with Kutchi mirror embroidery. Craft village walk, tie-dye demonstrations and camel milk chai.",
    amenities:["Kutchi crafts","Mirror embroidery","Camel safari","Village walk","Traditional cooking"],
    locality:"Hodka Village, 60km from Bhuj.",
    localityImg:"https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:40,name:"Agra Taj View Suite",city:"Agra, Uttar Pradesh",price:11800,rating:4.92,reviews:531,type:"Heritage Palace",superhost:true,rooms:3,
    cover:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75","https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75","https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=700&q=75"],
    owner:{name:"Gaurav Agarwal",photo:"https://i.pravatar.cc/56?img=20",since:"2016"},
    desc:"The only rooftop room with an unobstructed Taj Mahal view at sunrise and sunset. Mughal garden in the courtyard, private Taj photography tour.",
    amenities:["Taj Mahal sunrise","Photography tour","Mughal garden","Heritage dining","Agra fort tour"],
    locality:"Tajganj, 300m from the Taj Mahal East Gate.",
    localityImg:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:41,name:"Varanasi Ghat Haveli",city:"Varanasi, Uttar Pradesh",price:6100,rating:4.89,reviews:288,type:"Heritage Haveli",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75","https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75","https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75"],
    owner:{name:"Pandit Diwakar",photo:"https://i.pravatar.cc/56?img=6",since:"2019"},
    desc:"18th-century haveli directly on Manikarnika Ghat. Boat ride for Ganga aarti, Kashi Vishwanath morning puja, silk weaving workshops.",
    amenities:["Ghat view","Ganga boat ride","Aarti ceremony","Silk weaving","Yoga at dawn"],
    locality:"Manikarnika Ghat, Old Varanasi.",
    localityImg:"https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:42,name:"Kodaikanal Lake View",city:"Kodaikanal, Tamil Nadu",price:5100,rating:4.84,reviews:219,type:"Mountain Lodge",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75"],
    owner:{name:"Gomathy Krishnan",photo:"https://i.pravatar.cc/56?img=42",since:"2019"},
    desc:"Shola forest cottage on Kodai Lake's quietest shore. Star-gazer path, Bear Shola falls 2km, Coaker's Walk at golden hour.",
    amenities:["Lake boating","Shola forest","Star gazing","Cycling","Coaker walk"],
    locality:"Lake Road, Kodaikanal. 120km from Madurai.",
    localityImg:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:43,name:"Andaman Jungle Bungalow",city:"Port Blair, A&N",price:7300,rating:4.86,reviews:107,type:"Forest Retreat",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Prakash Dey",photo:"https://i.pravatar.cc/56?img=45",since:"2021"},
    desc:"Teak bungalow inside a mangrove reserve 20 minutes from Ross Island. Crocodile-spotting kayak tours and forest nights amplified by cicadas.",
    amenities:["Mangrove kayak","Snorkelling","Coral reef diving","Forest walk","Night safari"],
    locality:"Chidiya Tapu, 30km from Port Blair.",
    localityImg:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:44,name:"Gokarna Om Beach Hut",city:"Gokarna, Karnataka",price:4600,rating:4.83,reviews:267,type:"Beachfront Villa",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75"],
    owner:{name:"Ashok Hegde",photo:"https://i.pravatar.cc/56?img=2",since:"2020"},
    desc:"Palm-thatched huts steps from Om Beach's iconic crescent. Kudle Beach trek at sunrise, Mahabaleshwar Temple, bonfire jams nightly.",
    amenities:["Om Beach access","Temple walks","Yoga shala","Bonfire jams","Kayaking"],
    locality:"Om Beach, Gokarna. 58km from Karwar.",
    localityImg:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:45,name:"Kochi Heritage House",city:"Fort Kochi, Kerala",price:5700,rating:4.87,reviews:344,type:"Boutique B&B",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75"],
    owner:{name:"Hannah Thomas",photo:"https://i.pravatar.cc/56?img=49",since:"2017"},
    desc:"Portuguese-era house in Fort Kochi's spice merchant quarter. Chinese fishing nets at dawn, Kathakali evening show, Jew Town antique market.",
    amenities:["Chinese fishing nets","Kathakali show","Spice market","Backwater cruise","Art galleries"],
    locality:"Princess Street, Fort Kochi. 5-min to Chinese nets.",
    localityImg:"https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:46,name:"Pondicherry Sea Pavilion",city:"Pondicherry, Tamil Nadu",price:7200,rating:4.88,reviews:178,type:"Beachfront Villa",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75"],
    owner:{name:"Isabelle Morel",photo:"https://i.pravatar.cc/56?img=53",since:"2019"},
    desc:"Seafront villa on Pondicherry's rocky promenade. Auroville day passes, sunrise meditation sessions, Franco-Tamil fusion breakfast.",
    amenities:["Sea promenade","Auroville visits","Sunrise meditation","French cuisine","Cycling"],
    locality:"Goubert Salai beachfront, White Town, Pondicherry.",
    localityImg:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:47,name:"Puri Beach House",city:"Puri, Odisha",price:4300,rating:4.80,reviews:167,type:"Beachfront Villa",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75"],
    owner:{name:"Jagannath Panda",photo:"https://i.pravatar.cc/56?img=32",since:"2020"},
    desc:"Heritage house 50m from Puri beach, directly across from Jagannath Temple. Rath Yatra procession passes the front gate every July.",
    amenities:["Temple procession","Beach sunrise","Chhena poda desserts","Fishing boats","Sand art"],
    locality:"Marine Drive, Puri. 50m from Puri beach.",
    localityImg:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:48,name:"Tawang Monastery Lodge",city:"Tawang, Arunachal Pradesh",price:5800,rating:4.91,reviews:63,type:"Mountain Lodge",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75"],
    owner:{name:"Lobsang Rinpoche",photo:"https://i.pravatar.cc/56?img=55",since:"2022"},
    desc:"Stone lodge beside Asia's second-largest monastery complex. Monks' morning chants at 5am, Sela Pass day trips, Tibetan butter tea.",
    amenities:["Monastery access","Butter tea","Sela Pass","Yak rides","Buddhist art"],
    locality:"Below Tawang Monastery, 10,000ft altitude.",
    localityImg:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:49,name:"Udaipur Lake Bungalow",city:"Udaipur, Rajasthan",price:9200,rating:4.90,reviews:176,type:"Heritage Palace",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1565118531796-763e5082d113?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=75","https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75","https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75"],
    owner:{name:"Rajveer Singh",photo:"https://i.pravatar.cc/56?img=24",since:"2018"},
    desc:"Heritage bungalow on the banks of Fateh Sagar Lake. Evening boat rides to Nehru Island Garden, royal Rajasthani dinner under the stars.",
    amenities:["Lake boat ride","Royal dinner","Fateh Sagar view","Heritage cycle tour","Rajput cooking"],
    locality:"Fateh Sagar Lake Road, Udaipur.",
    localityImg:"https://images.unsplash.com/photo-1565118531796-763e5082d113?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:50,name:"Mcleodganj Himalayan Cafe",city:"McLeod Ganj, Himachal Pradesh",price:3400,rating:4.78,reviews:289,type:"Boutique B&B",superhost:false,rooms:8,
    cover:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75"],
    owner:{name:"Tashi Dorje",photo:"https://i.pravatar.cc/56?img=57",since:"2019"},
    desc:"Tibetan-run guesthouse 100m from Dalai Lama Temple. Butter lamp evenings, momos and thukpa breakfasts, Triund trek from the doorstep.",
    amenities:["Triund trek","Dalai Lama Temple","Tibetan cooking","Meditation class","Namgyal Monastery"],
    locality:"Temple Road, McLeod Ganj. 100m from Dalai Lama Temple.",
    localityImg:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  // ── Batch 51-80 ───────────────────────────────────────────────────────────
  {id:51,name:"Mahadev Cliff House",city:"Mahabaleshwar, Maharashtra",price:6200,rating:4.84,reviews:234,type:"Mountain Lodge",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75"],
    owner:{name:"Pramod Patil",photo:"https://i.pravatar.cc/56?img=10",since:"2019"},
    desc:"Perched on Wilson Point, India's highest peak in Mahabaleshwar. Strawberry farms, Arthur's Seat viewpoint, and valley mist every morning.",
    amenities:["Strawberry farm","Wilson Point","Valley mist","Horse rides","Waterfall trek"],
    locality:"Wilson Point, Mahabaleshwar, 80km from Pune.",
    localityImg:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:52,name:"Alleppey Lagoon Villa",city:"Alleppey, Kerala",price:8400,rating:4.91,reviews:145,type:"Floating Suite",superhost:true,rooms:3,
    cover:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=75","https://images.unsplash.com/photo-1559467286-1c82cec44a71?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75"],
    owner:{name:"Jobin Jose",photo:"https://i.pravatar.cc/56?img=40",since:"2020"},
    desc:"Private lagoon villa surrounded by coconut palms on three sides. Canoe fishing at 5am, paddy-field walks, backwater cycle trails.",
    amenities:["Lagoon canoe","Cycle trails","Paddy farm walk","Coir weaving","Fishing"],
    locality:"Punnamada Lagoon, Alappuzha. 5km from town.",
    localityImg:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:53,name:"Vizag Steel City Suite",city:"Visakhapatnam, AP",price:4900,rating:4.79,reviews:189,type:"Boutique B&B",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75"],
    owner:{name:"Suryanarayana Murthy",photo:"https://i.pravatar.cc/56?img=18",since:"2021"},
    desc:"Hillside cottage above Rishikonda Beach. Submarine museum, Araku Valley coffee plantation day trip, Borra Caves.",
    amenities:["Beach walk","Araku day trip","Borra Caves","Submarine museum","Sunset views"],
    locality:"Rushikonda Hills, Vizag. 10km from city.",
    localityImg:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:54,name:"Coimbatore Forest Spa",city:"Coimbatore, Tamil Nadu",price:5500,rating:4.83,reviews:176,type:"Forest Retreat",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Jaya Krishnaswamy",photo:"https://i.pravatar.cc/56?img=36",since:"2020"},
    desc:"Nilgiri foothills spa resort with organic gardens. Isha Yoga Centre 20-min, Valparai tea estates, Anamalai Tiger Reserve day safari.",
    amenities:["Organic spa","Isha Yoga Centre","Tiger Reserve","Organic farm","Yoga retreat"],
    locality:"Marudamalai Hills, Coimbatore. Near Isha Foundation.",
    localityImg:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:55,name:"Bhubaneswar Temple Suite",city:"Bhubaneswar, Odisha",price:4400,rating:4.82,reviews:134,type:"Heritage Palace",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75","https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=700&q=75","https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=700&q=75"],
    owner:{name:"Namita Das",photo:"https://i.pravatar.cc/56?img=51",since:"2021"},
    desc:"Heritage property among the thousand temples of Bhubaneswar. Odissi dance lessons, Pattachitra painting workshops, Udayagiri caves day trip.",
    amenities:["Temple corridor","Odissi dance","Pattachitra workshop","Dhabaleswar trip","Tribal crafts"],
    locality:"Old Town, Bhubaneswar. 500m from Lingaraj Temple.",
    localityImg:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:56,name:"Allahabad Sangam House",city:"Prayagraj, Uttar Pradesh",price:3800,rating:4.79,reviews:98,type:"Heritage Haveli",superhost:false,rooms:7,
    cover:"https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75","https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75","https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75"],
    owner:{name:"Shivam Tripathi",photo:"https://i.pravatar.cc/56?img=4",since:"2022"},
    desc:"Old city haveli with terraced views of the Sangam. Boat rides to Triveni Sangam at sunrise, Anand Bhavan heritage museum walk.",
    amenities:["Sangam boat ride","Sunrise puja","Anand Bhavan","Prayag walk","River view"],
    locality:"Daraganj, 2km from Triveni Sangam.",
    localityImg:"https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:57,name:"Hyderabad Char Minar Suite",city:"Hyderabad, Telangana",price:5200,rating:4.82,reviews:223,type:"Heritage Haveli",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1612011213000-91cf5cbf3eb2?w=700&q=75","https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=700&q=75","https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=700&q=75"],
    owner:{name:"Yasmeen Sultana",photo:"https://i.pravatar.cc/56?img=58",since:"2018"},
    desc:"Nizam-era haveli 200m from Char Minar. Laad Bazaar bangles, Shadab haleem, biryani morning walks, Golconda Fort evening light show.",
    amenities:["Char Minar walk","Biryani trail","Laad Bazaar","Golconda Fort","Irani chai"],
    locality:"Laad Bazaar, Old Hyderabad. 200m from Char Minar.",
    localityImg:"https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:58,name:"Amritsar Golden View",city:"Amritsar, Punjab",price:5600,rating:4.88,reviews:312,type:"Boutique B&B",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1612011213000-91cf5cbf3eb2?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=75","https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=700&q=75","https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=700&q=75"],
    owner:{name:"Gurpreet Singh",photo:"https://i.pravatar.cc/56?img=60",since:"2017"},
    desc:"Terrace suite with Golden Temple views. Langar seva experience at 4am, Wagah Border ceremony, phulkari embroidery workshop.",
    amenities:["Golden Temple","Langar seva","Wagah Border","Phulkari workshop","Amritsari kulcha"],
    locality:"Golden Temple Road, 300m from Harmandir Sahib.",
    localityImg:"https://images.unsplash.com/photo-1612011213000-91cf5cbf3eb2?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:59,name:"Sikkim Monastery Retreat",city:"Gangtok, Sikkim",price:6400,rating:4.90,reviews:88,type:"Mountain Lodge",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75","https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75"],
    owner:{name:"Pema Wangchuk",photo:"https://i.pravatar.cc/56?img=59",since:"2021"},
    desc:"Organic mountain stay with Kanchenjunga sunrise views. Tsomgo Lake day trip, Rumtek Monastery, local Sikkimese thali and tongba millet beer.",
    amenities:["Kanchenjunga view","Tsomgo Lake","Rumtek Monastery","Organic farm","Tongba"],
    locality:"Tadong, Gangtok. 8km from MG Road.",
    localityImg:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:60,name:"Puducherry Ashram Stay",city:"Pondicherry, Tamil Nadu",price:3500,rating:4.77,reviews:209,type:"Boutique B&B",superhost:false,rooms:9,
    cover:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=700&q=75","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=75","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=75"],
    owner:{name:"Divya Menon",photo:"https://i.pravatar.cc/56?img=61",since:"2018"},
    desc:"Peaceful ashram-style rooms in Sri Aurobindo Ashram's guesthouse. Meditation at 6am, Auroville Matrimandir visits, organic café breakfasts.",
    amenities:["Meditation","Auroville","Organic meals","Yoga","Silence hours"],
    locality:"Sri Aurobindo Ashram, White Town, Pondicherry.",
    localityImg:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  // 61-80
  {id:61,name:"Konark Sun Temple Lodge",city:"Konark, Odisha",price:4100,rating:4.81,reviews:112,type:"Heritage Palace",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=75","https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75","https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=700&q=75"],
    owner:{name:"Bipin Sahoo",photo:"https://i.pravatar.cc/56?img=62",since:"2021"},
    desc:"Stone heritage lodge at the Sun Temple complex. Odisha dance festival in December, beach 3km, sunrise light on the chariot wheels.",
    amenities:["Sun Temple walk","Dance festival","Beach trip","Tribal crafts","Sunrise ritual"],
    locality:"Konark, Odisha. 35km from Puri.",
    localityImg:"https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:62,name:"Coorg Plantation Estate",city:"Coorg, Karnataka",price:7100,rating:4.88,reviews:167,type:"Forest Retreat",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75","https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75"],
    owner:{name:"Kaveri Cariappa",photo:"https://i.pravatar.cc/56?img=63",since:"2019"},
    desc:"British-era planter's bungalow on a 50-acre mixed estate of coffee, cardamom, and pepper. Dubare elephant camp 12km away.",
    amenities:["Elephant camp","Spice walk","Coffee tasting","Rafting","Birdwatching"],
    locality:"Siddapur, Coorg. 85km from Mysore.",
    localityImg:"https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:63,name:"Gir Forest Safari Camp",city:"Sasan Gir, Gujarat",price:8600,rating:4.92,reviews:76,type:"Glamping",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75","https://images.unsplash.com/photo-1500581276021-a4469e3a8b6f?w=700&q=75"],
    owner:{name:"Rajbha Jadeja",photo:"https://i.pravatar.cc/56?img=64",since:"2020"},
    desc:"World's only Asiatic lion habitat. Three daily jeep safaris, night-sky camps in the savanna, Maldhari tribal village walks.",
    amenities:["Lion safaris","Night camp","Tribal walks","Raptor watching","Nature trails"],
    locality:"Sasan Gir, 65km from Junagadh.",
    localityImg:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:64,name:"Ahmedabad Pols Homestay",city:"Ahmedabad, Gujarat",price:4600,rating:4.84,reviews:198,type:"Heritage Haveli",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=75","https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=700&q=75","https://images.unsplash.com/photo-1612011213000-91cf5cbf3eb2?w=700&q=75"],
    owner:{name:"Mitul Shah",photo:"https://i.pravatar.cc/56?img=65",since:"2018"},
    desc:"UNESCO-listed Pol house with original carved wooden façade. Heritage walk by Le Corbusier buildings, Vishalla village museum dinner.",
    amenities:["Heritage walk","Pol architecture","Le Corbusier tour","Village dinner","Textile museum"],
    locality:"Khadia Pol, Ahmedabad Old City. 500m from Sidi Saiyyed Mosque.",
    localityImg:"https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:65,name:"Pachmarhi Jungle Cottage",city:"Pachmarhi, Madhya Pradesh",price:5100,rating:4.83,reviews:145,type:"Forest Retreat",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Sunita Yadav",photo:"https://i.pravatar.cc/56?img=66",since:"2021"},
    desc:"MP's only hill station. Caves with prehistoric paintings at Pandav Caves, Duchess Falls 2km, Jatashankar gorge sunset walks.",
    amenities:["Cave paintings","Duchess Falls","Jungle jeep","Horse trekking","Ancient ruins"],
    locality:"Pachmarhi Cantonment, Satpura National Park edge.",
    localityImg:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:66,name:"Sundarbans Delta Camp",city:"Sundarbans, West Bengal",price:6800,rating:4.87,reviews:54,type:"Forest Retreat",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75","https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75"],
    owner:{name:"Moloy Mondal",photo:"https://i.pravatar.cc/56?img=67",since:"2022"},
    desc:"Mangrove-edge cottage in the world's largest tidal delta. Royal Bengal tiger tracking boat trips, river fishing at dawn, honey hunters.",
    amenities:["Tiger boat safari","Mangrove trek","Honey hunters","River fishing","Sunset cruise"],
    locality:"Gosaba Island, Sundarbans. 3hr from Kolkata.",
    localityImg:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:67,name:"Ranthambore Tiger Lodge",city:"Sawai Madhopur, Rajasthan",price:9800,rating:4.93,reviews:187,type:"Glamping",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75","https://images.unsplash.com/photo-1500581276021-a4469e3a8b6f?w=700&q=75"],
    owner:{name:"Fatima Sheikh",photo:"https://i.pravatar.cc/56?img=68",since:"2019"},
    desc:"Luxury tents at India's most successful tiger reserve. 6-seater open jeep safaris twice daily, Ranthambore Fort sunset views, campfire dinners.",
    amenities:["Tiger safari","Fort sunset","Campfire dinner","Photography guide","Bird watching"],
    locality:"Ranthambore Road, 14km from Sawai Madhopur.",
    localityImg:"https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:68,name:"Landsdowne Pine Retreat",city:"Lansdowne, Uttarakhand",price:4800,rating:4.82,reviews:156,type:"Mountain Lodge",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75"],
    owner:{name:"Deepak Rawat",photo:"https://i.pravatar.cc/56?img=69",since:"2020"},
    desc:"Oak-and-pine hilltop retreat in an undiscovered cantonment town. Tarkeshwar Mahadev forest trek, Bhim Pakora magical rock balancing spot.",
    amenities:["Oak forest trails","Tarkeshwar trek","Bhim Pakora","Fishing","Stargazing"],
    locality:"Lansdowne, Garhwal. 40km from Kotdwar.",
    localityImg:"https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:69,name:"Alibag Farmhouse Retreat",city:"Alibag, Maharashtra",price:7400,rating:4.85,reviews:234,type:"Beachfront Villa",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75"],
    owner:{name:"Roshni Patel",photo:"https://i.pravatar.cc/56?img=70",since:"2019"},
    desc:"Mango-coconut farmhouse 200m from Alibaug beach. Kolaba Fort low-tide walk, Mandwa jetty sunsets, Mumbai ferry weekend getaway.",
    amenities:["Kolaba Fort walk","Mango orchards","Ferry to Mumbai","Beach yoga","Fishing"],
    locality:"Alibaug Beach Road, 2hr ferry from Mumbai Gateway.",
    localityImg:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:70,name:"Chopta Meadow Camp",city:"Chopta, Uttarakhand",price:5400,rating:4.89,reviews:97,type:"Glamping",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1500581276021-a4469e3a8b6f?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75"],
    owner:{name:"Mahesh Negi",photo:"https://i.pravatar.cc/56?img=71",since:"2021"},
    desc:"Mini Switzerland of India at 2700m. Tungnath temple trek — world's highest Shiva shrine — starts from camp. Rhododendron forests in March.",
    amenities:["Tungnath temple","Chandrashila summit","Rhododendron forest","Stargazing","Snow treks"],
    locality:"Chopta Meadow, Kedarnath Wildlife Sanctuary.",
    localityImg:"https://images.unsplash.com/photo-1500581276021-a4469e3a8b6f?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:71,name:"Tarkarli Coral House",city:"Tarkarli, Maharashtra",price:5800,rating:4.86,reviews:178,type:"Beachfront Villa",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&q=75"],
    owner:{name:"Bhaskar Desai",photo:"https://i.pravatar.cc/56?img=72",since:"2020"},
    desc:"Konkan coastline gem. India's clearest water for snorkelling, scuba diving, and dolphin spotting. Sindhudurg Fort boat trips daily.",
    amenities:["Scuba diving","Dolphin spotting","Sindhudurg Fort","Seafood thali","Beach volleyball"],
    locality:"Tarkarli Beach, Sindhudurg. 120km from Goa.",
    localityImg:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:72,name:"Bir Billing Paragliders Camp",city:"Bir, Himachal Pradesh",price:4200,rating:4.88,reviews:213,type:"Glamping",superhost:true,rooms:6,
    cover:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=700&q=75","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=75","https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=700&q=75"],
    owner:{name:"Tsewang Dorje",photo:"https://i.pravatar.cc/56?img=73",since:"2020"},
    desc:"World paragliding championship launch site. Tandem flights over Dhauladhar range, Tibetan monastery walks, mountain biking trails.",
    amenities:["Paragliding","Monastery walk","Mountain biking","Stargazing","Tibetan cuisine"],
    locality:"Billing launch site, Bir. 67km from Dharamsala.",
    localityImg:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:73,name:"Kanyakumari Sunrise Villa",city:"Kanyakumari, Tamil Nadu",price:4700,rating:4.84,reviews:289,type:"Beachfront Villa",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1559339352-11d035aa65de?w=700&q=75","https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=700&q=75"],
    owner:{name:"Chandra Bose",photo:"https://i.pravatar.cc/56?img=74",since:"2019"},
    desc:"India's southernmost stay. Watch sunrise and moonrise over three seas simultaneously. Vivekananda Rock boat rides, Thiruvalluvar Statue views.",
    amenities:["Three-sea sunrise","Vivekananda Rock","Thiruvalluvar view","Temple visits","Sunset cruise"],
    locality:"Beach Road, Kanyakumari. 300m from the tri-sea confluence.",
    localityImg:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:74,name:"Ziro Valley Apatani Cottage",city:"Ziro, Arunachal Pradesh",price:4900,rating:4.91,reviews:47,type:"Boutique B&B",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75","https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=700&q=75"],
    owner:{name:"Hage Laling",photo:"https://i.pravatar.cc/56?img=75",since:"2022"},
    desc:"Traditional Apatani bamboo cottage in a UNESCO tentative heritage valley. Rice terraces at eye level, Ziro Music Festival September, tribal weaving.",
    amenities:["Rice terrace walks","Music festival","Tribal weaving","Pine forest hike","Apatani cuisine"],
    locality:"Hong Village, Ziro Valley. 167km from Itanagar.",
    localityImg:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75",
    cancel:"Full refund if cancelled 72h before check-in."},
  {id:75,name:"Majuli River Island Stay",city:"Majuli, Assam",price:4100,rating:4.86,reviews:61,type:"Floating Suite",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1559467286-1c82cec44a71?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=75","https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75"],
    owner:{name:"Lakhimi Chutia",photo:"https://i.pravatar.cc/56?img=76",since:"2021"},
    desc:"World's largest river island on the Brahmaputra. Neo-Vaishnavite Sattra (monastery) mask dance performances, hand-made pottery, river fishing.",
    amenities:["Sattra mask dance","River fishing","Pottery workshop","Boat ferry","Mishing tribal visit"],
    locality:"Kamalabari, Majuli Island. Ferry from Jorhat.",
    localityImg:"https://images.unsplash.com/photo-1559467286-1c82cec44a71?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:76,name:"Mount Abu Sunset Cottage",city:"Mount Abu, Rajasthan",price:4800,rating:4.80,reviews:198,type:"Mountain Lodge",superhost:false,rooms:6,
    cover:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=75","https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=75","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=75"],
    owner:{name:"Hemant Suthar",photo:"https://i.pravatar.cc/56?img=77",since:"2020"},
    desc:"Rajasthan's only hill station. Dilwara Jain Temples marble miracles, Nakki Lake evening walks, Guru Shikhar Rajasthan's highest point.",
    amenities:["Dilwara Temples","Nakki Lake","Guru Shikhar trek","Cable car","Sunset Point"],
    locality:"Sunset Point Road, Mount Abu. 30km from Abu Road station.",
    localityImg:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:77,name:"Diu Portuguese Fort Stay",city:"Diu, Daman & Diu",price:5100,rating:4.83,reviews:134,type:"Heritage Palace",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75","https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75","https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75"],
    owner:{name:"Fatima Mascarenhas",photo:"https://i.pravatar.cc/56?img=78",since:"2019"},
    desc:"16th-century Portuguese fort converted into boutique rooms. Sea-facing bastions, St. Paul's Church, pristine Nagoa Beach 3km.",
    amenities:["Fort bastions","St. Paul's Church","Nagoa Beach","Scooter rental","Seafood BBQ"],
    locality:"Diu Fort, Old Town. 300km from Ahmedabad.",
    localityImg:"https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:78,name:"Pondicherry Auro Beach",city:"Pondicherry, Tamil Nadu",price:6300,rating:4.86,reviews:167,type:"Beachfront Villa",superhost:true,rooms:5,
    cover:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=75","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=700&q=75","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=75"],
    owner:{name:"Bernard Lefèvre",photo:"https://i.pravatar.cc/56?img=79",since:"2020"},
    desc:"Colonial villa 30m from Auro Beach's rock promenade. Morning jogging on empty beach, boutique French bistro, Auroville 15-min.",
    amenities:["Rock promenade","Auroville","French bistro","Beach yoga","Sunrise walks"],
    locality:"Auro Beach Road, near Chunnambar Boat House.",
    localityImg:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=75",
    cancel:"Full refund if cancelled 24h before check-in."},
  {id:79,name:"Khimsar Desert Fort",city:"Khimsar, Rajasthan",price:10200,rating:4.91,reviews:154,type:"Heritage Palace",superhost:true,rooms:4,
    cover:"https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&q=75","https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=75","https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=75"],
    owner:{name:"Onkar Singh",photo:"https://i.pravatar.cc/56?img=80",since:"2016"},
    desc:"500-year-old Rathore fort on the Thar Desert edge. Royal antique bedchambers, wild black buck antelopes at the fort walls, dune safari.",
    amenities:["Black buck watching","Dune safari","Fort battlements","Desert stargazing","Royal dining"],
    locality:"Khimsar, 90km from Jodhpur, Thar Desert.",
    localityImg:"https://images.unsplash.com/photo-1519744346361-7a029b427a59?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
  {id:80,name:"Chikmangalur Sunrise Peak",city:"Chikmagalur, Karnataka",price:6100,rating:4.87,reviews:143,type:"Mountain Lodge",superhost:false,rooms:5,
    cover:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=75",
    imgs:["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=75","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75","https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=75"],
    owner:{name:"Rukmini Hegde",photo:"https://i.pravatar.cc/56?img=81",since:"2021"},
    desc:"Luxury tented rooms on Mullayanagiri's southern slope, Karnataka's highest peak. Trek to summit for 360° Shola forest sunrise.",
    amenities:["Mullayanagiri trek","Shola sunrise","Coffee tasting","Waterfall swim","Forest birding"],
    locality:"Mullayanagiri foothills, 22km from Chikmagalur town.",
    localityImg:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=75",
    cancel:"Full refund if cancelled 48h before check-in."},
];

// ── UPI QR Code SVG Generator ─────────────────────────────────────────────────
function QRCode({ value, size = 160 }) {
  // Generate a deterministic pixel pattern from the value string
  const hash = Array.from(value).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const modules = 21;
  const cellSize = size / modules;
  const cells = [];
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Finder patterns (corners)
      const inFinder =
        (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
      const inFinderInner =
        (r >= 1 && r <= 5 && c >= 1 && c <= 5) ||
        (r >= 1 && r <= 5 && c >= modules - 6 && c <= modules - 2) ||
        (r >= modules - 6 && r <= modules - 2 && c >= 1 && c <= 5);
      const finderBorder =
        (r === 0 || r === 6 || c === 0 || c === 6) && r < 7 && c < 7 ||
        (r === 0 || r === 6 || c === modules - 1 || c === modules - 7) && r < 7 && c >= modules - 7 ||
        (r === modules - 7 || r === modules - 1 || c === 0 || c === 6) && r >= modules - 7 && c < 7;
      // Timing patterns
      const timing = (r === 6 && c >= 8 && c <= modules - 9) || (c === 6 && r >= 8 && r <= modules - 9);
      // Data modules: pseudo-random based on position and hash
      const dataVal = ((hash ^ (r * 137 + c * 29 + r * c)) & 1) === 1;
      const dark = inFinder ? (finderBorder || (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
        (r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3) ||
        (r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4)) :
        timing ? (r === 6 ? c % 2 === 0 : r % 2 === 0) : dataVal;
      if (dark) cells.push(<rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#000" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {cells}
    </svg>
  );
}

// ── Tx Timeline ───────────────────────────────────────────────────────────────
function TxTimeline({ steps, txHash, ipfsCid, blockNum }) {
  return (
    <div style={{ padding: "4px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all .3s", background: s.done ? "#e8f5e9" : s.active ? "#fff3e0" : "#f5f5f5", border: `2px solid ${s.done ? "#4caf50" : s.active ? "#ff9800" : "#ddd"}`, color: s.done ? "#4caf50" : s.active ? "#ff9800" : "#ccc" }}>
              {s.done ? "✓" : s.active ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> : "○"}
            </div>
            {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 8, background: s.done ? "#c8e6c9" : "#eee", marginTop: 3 }} />}
          </div>
          <div style={{ paddingBottom: i < steps.length - 1 ? 12 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: s.done ? "#222" : s.active ? "#ff9800" : "#bbb", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.done ? "#4caf50" : "#bbb", fontFamily: "'JetBrains Mono',monospace" }}>{s.detail}</div>
            {s.done && s.showTx && txHash && (
              <div style={{ marginTop: 5, background: "#f1f8f4", borderRadius: 6, padding: "5px 10px", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-all" }}>
                <span style={{ color: "#888" }}>TX: </span><span style={{ color: "#2e7d32" }}>{txHash.slice(0, 38)}...</span>
                <span style={{ marginLeft: 6, background: "#c8e6c9", padding: "1px 6px", borderRadius: 4, fontSize: 9, cursor: "pointer" }}>Block #{blockNum} · Polygonscan ↗</span>
              </div>
            )}
            {s.done && s.showIpfs && ipfsCid && (
              <div style={{ marginTop: 5, background: "#e8f0fe", borderRadius: 6, padding: "5px 10px", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-all" }}>
                <span style={{ color: "#888" }}>CID: </span><span style={{ color: "#1565c0" }}>{ipfsCid}</span>
                <span style={{ marginLeft: 6, background: "#bbdefb", padding: "1px 6px", borderRadius: 4, fontSize: 9, cursor: "pointer" }}>IPFS Explorer ↗</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI Chat Bubble ────────────────────────────────────────────────────────────
function AIChatBubble({ hotel, onProceedToPayment }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collected, setCollected] = useState({});
  const [fieldIdx, setFieldIdx] = useState(0);
  const [bookingReady, setBookingReady] = useState(null);
  const endRef = useRef(null);
  const FIELDS = [
    { key: "checkin", ask: "Check-in date? (e.g. 25 Dec 2025)" },
    { key: "checkout", ask: "Check-out date?" },
    { key: "guests", ask: "Number of guests?" },
    { key: "roomType", ask: "Room type — Standard, Deluxe, or Suite?" },
    { key: "guestName", ask: "Full name for the booking?" },
    { key: "phone", ask: "Mobile number?" },
    { key: "email", ask: "Email for confirmation?" },
    { key: "idProof", ask: "ID proof type — Aadhaar / Passport / DL?" },
    { key: "specialRequests", ask: "Any special requests? (or say none)" },
  ];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  const addMsg = (role, text) => setMsgs(p => [...p, { role, text }]);
  async function send() {
    const txt = input.trim(); if (!txt || loading) return;
    setInput(""); addMsg("user", txt); setLoading(true);
    await sleep(500);
    if (fieldIdx < FIELDS.length) {
      const newC = { ...collected, [FIELDS[fieldIdx].key]: txt };
      setCollected(newC);
      const next = fieldIdx + 1;
      setFieldIdx(next);
      if (next < FIELDS.length) { addMsg("bot", FIELDS[next].ask); }
      else {
        const nights = (() => { try { return Math.max(1, Math.round((new Date(newC.checkout) - new Date(newC.checkin)) / 86400000)); } catch { return 1; } })();
        const bd = { ...newC, nights };
        setBookingReady(bd);
        addMsg("bot", `✅ Got it! Here's a summary:\n\n📅 ${bd.checkin} → ${bd.checkout} (${nights}n)\n👥 ${bd.guests} guests · ${bd.roomType}\n👤 ${bd.guestName}\n📧 ${bd.email}`);
      }
    }
    setLoading(false);
  }
  function handleOpen() {
    setOpen(true);
    if (msgs.length === 0) setTimeout(() => { addMsg("bot", `Hi! I'm your AI concierge for ${hotel.name} 🎩\n\nI'll collect your booking details. ${FIELDS[0].ask}`); }, 200);
  }
  return (
    <>
      {!open && (
        <button onClick={handleOpen} style={{ position: "fixed", bottom: 24, right: 24, background: "#FF385C", color: "#fff", border: "none", borderRadius: "50%", width: 56, height: 56, fontSize: 24, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,56,92,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>🤵</button>
      )}
      {open && (
        <div style={{ position: "fixed", bottom: 24, right: 24, width: 340, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,.18)", zIndex: 1000, display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "70vh" }}>
          <div style={{ background: "#FF385C", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>🤵 AI Concierge</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, marginTop: 1 }}>{hotel.name}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", padding: "9px 13px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "#FF385C" : "#f5f5f5", color: m.role === "user" ? "#fff" : "#222", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            ))}
            {bookingReady && (
              <button onClick={() => { onProceedToPayment(bookingReady); setOpen(false); }} style={{ marginTop: 6, width: "100%", padding: "11px", background: "#FF385C", border: "none", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Proceed to Payment →
              </button>
            )}
            {loading && <div style={{ fontSize: 13, color: "#aaa" }}>Typing...</div>}
            <div ref={endRef} />
          </div>
          {!bookingReady && (
            <div style={{ padding: "10px 12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type your answer..." style={{ flex: 1, padding: "9px 12px", border: "1px solid #eee", borderRadius: 20, fontSize: 13, outline: "none" }} />
              <button onClick={send} style={{ background: "#FF385C", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontSize: 16, cursor: "pointer" }}>↑</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ hotel, bd, onClose, onSuccess }) {
  const [method, setMethod] = useState(null);
  // UPI state
  const [upiId, setUpiId] = useState("");
  const [qrScanned, setQrScanned] = useState(false);
  const [qrTimer, setQrTimer] = useState(0);
  // Debit card state
  const [card, setCard] = useState(""); const [exp, setExp] = useState(""); const [cvv, setCvv] = useState(""); const [cardName, setCardName] = useState("");
  const [cardBank, setCardBank] = useState("");
  // Net banking state
  const [netBank, setNetBank] = useState("");
  const [netUser, setNetUser] = useState(""); const [netPass, setNetPass] = useState("");
  // OTP state
  const [showOtp, setShowOtp] = useState(false); const [otp, setOtp] = useState(""); const [otpSent, setOtpSent] = useState(false);
  // Flow state
  const [phase, setPhase] = useState("form");
  const [steps, setSteps] = useState([]);
  const [txHash, setTxHash] = useState(""); const [ipfsCid, setIpfsCid] = useState(""); const [blockNum, setBlockNum] = useState("");
  const [upiMode, setUpiMode] = useState("id"); // "id" | "qr"
  const timerRef = useRef(null);

  const nights = bd.nights || 1;
  const base = hotel.price * nights;
  const tax = (base * 0.12) | 0;
  const total = base + tax + 2;

  // QR countdown timer
  useEffect(() => {
    if (upiMode === "qr" && method === "UPI" && phase === "form") {
      setQrTimer(300);
      timerRef.current = setInterval(() => setQrTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [upiMode, method, phase]);

  const fmtTimer = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function runBlockchainSimulation() {
    setPhase("processing");
    const s = [
      { label: "AI Layer", detail: "Validating booking & locking room...", active: true, done: false, showTx: false, showIpfs: false },
      { label: "Database", detail: "Broadcasting via Redis pub/sub...", active: false, done: false, showTx: false, showIpfs: false },
      { label: "Blockchain", detail: "Deploying escrow on Polygon...", active: false, done: false, showTx: true, showIpfs: false },
      { label: "Storage", detail: "Pinning proof to IPFS...", active: false, done: false, showTx: false, showIpfs: true },
    ];
    const set = arr => setSteps([...arr]);
    set(s);
    await sleep(1300); s[0] = { ...s[0], active: false, done: true, detail: "Room locked · Booking validated ✓" }; set(s);
    s[1] = { ...s[1], active: true }; set(s);
    await sleep(1000); s[1] = { ...s[1], active: false, done: true, detail: "All sessions notified instantly ✓" }; set(s);
    s[2] = { ...s[2], active: true }; set(s);
    await sleep(1700); const tx = mkTx(); const bn = mkBlock(); setTxHash(tx); setBlockNum(bn);
    s[2] = { ...s[2], active: false, done: true, detail: `Escrow deployed · ${fmtINR(total)} held` }; set(s);
    s[3] = { ...s[3], active: true }; set(s);
    await sleep(1100); const cid = mkCID(); setIpfsCid(cid);
    s[3] = { ...s[3], active: false, done: true, detail: "Tamper-proof record stored forever ✓" }; set(s);
    await sleep(500); setPhase("done");
    onSuccess({ txHash: tx, ipfsCid: cid, blockNum: bn });
  }

  // ── UPI Flow ────────────────────────────────────────────────────────────────
  async function payUpi() {
    if (upiMode === "qr") {
      // Simulate QR scan: show scanning animation then proceed
      setQrScanned(true);
      await sleep(2000);
    }
    if (!showOtp) { setOtpSent(true); setShowOtp(true); return; }
    if (otp.length < 4) return;
    runBlockchainSimulation();
  }

  // ── Debit Card Flow ─────────────────────────────────────────────────────────
  async function payCard() {
    if (!showOtp) { setOtpSent(true); setShowOtp(true); return; }
    if (otp.length < 4) return;
    runBlockchainSimulation();
  }

  // ── Net Banking Flow ────────────────────────────────────────────────────────
  async function payNetBanking() {
    if (!netBank || !netUser || !netPass) return;
    if (!showOtp) { setOtpSent(true); setShowOtp(true); return; }
    if (otp.length < 4) return;
    runBlockchainSimulation();
  }

  function handlePay() {
    if (method === "UPI") payUpi();
    else if (method === "Card") payCard();
    else if (method === "NetBanking") payNetBanking();
  }

  const canPay = (() => {
    if (showOtp) return otp.length >= 4;
    if (method === "UPI") return upiMode === "qr" || upiId.includes("@");
    if (method === "Card") return card.replace(/\s/g, "").length >= 16 && exp && cvv.length === 3 && cardName;
    if (method === "NetBanking") return netBank && netUser && netPass;
    return false;
  })();

  const NET_BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Yes Bank", "IndusInd Bank"];
  const upiApps = [
    { id: "gpay", label: "Google Pay", color: "#4285F4", icon: "G" },
    { id: "phonepe", label: "PhonePe", color: "#5f259f", icon: "P" },
    { id: "paytm", label: "Paytm", color: "#00b9f1", icon: "T" },
    { id: "bhim", label: "BHIM", color: "#00529b", icon: "B" },
  ];

  const qrVal = `upi://pay?pa=staychain@hdfc&pn=StayChain&am=${total}&tn=Booking-${hotel.id}&cu=INR`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.48)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: 16 }}
      onClick={e => e.target === e.currentTarget && phase === "form" && onClose()}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 490, maxHeight: "94vh", overflowY: "auto", boxShadow: "0 20px 80px rgba(0,0,0,.2)", animation: "bounceIn .3s ease" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f5f5f5" }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>
            {phase === "done" ? "Booking Confirmed 🎉" : phase === "processing" ? "Processing..." : "Confirm & Pay"}
          </div>
          {phase === "form" && <button onClick={onClose} style={{ background: "#f5f5f5", border: "none", width: 30, height: 30, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
        </div>

        <div style={{ padding: "18px 24px 24px" }}>

          {/* Hotel preview */}
          <div style={{ display: "flex", gap: 12, background: "#fafafa", borderRadius: 12, padding: 12, marginBottom: 18 }}>
            <img src={hotel.cover} alt="" style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{hotel.name}</div>
              <div style={{ color: "#717171", fontSize: 12, marginTop: 2 }}>{fmtD(bd.checkin)} → {fmtD(bd.checkout)}</div>
              <div style={{ color: "#717171", fontSize: 12 }}>{nights} nights · {bd.guests} guests · {bd.roomType}</div>
            </div>
          </div>

          {/* ── FORM PHASE ── */}
          {phase === "form" && <>

            {/* Price breakdown */}
            <div style={{ marginBottom: 18 }}>
              {[[`₹${hotel.price.toLocaleString("en-IN")} × ${nights} nights`, fmtINR(base)], ["Taxes & fees (12%)", fmtINR(tax)], ["Smart contract fee", "₹2"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: 14, color: "#555" }}>
                  <span>{k}</span><span style={{ color: "#222" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, fontWeight: 800, fontSize: 16 }}>
                <span>Total</span><span>{fmtINR(total)}</span>
              </div>
            </div>

            {/* Escrow note */}
            <div style={{ background: "#f0fff4", border: "1px solid #c8e6c9", borderRadius: 10, padding: 12, marginBottom: 18, fontSize: 12, color: "#1b5e20", lineHeight: 1.6 }}>
              🔐 <b>Escrow Protection:</b> Funds held in Polygon smart contract. Auto-released on check-in. Instant refund on cancellation.
            </div>

            {/* Method selector */}
            {!showOtp && <>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Choose Payment Method</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { id: "UPI", icon: "📱", label: "UPI" },
                  { id: "Card", icon: "💳", label: "Debit Card" },
                  { id: "NetBanking", icon: "🏦", label: "Net Banking" },
                ].map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setShowOtp(false); setOtp(""); setQrScanned(false); }}
                    style={{ padding: "13px 8px", borderRadius: 10, border: `2px solid ${method === m.id ? "#FF385C" : "#ddd"}`, background: method === m.id ? "#fff0f3" : "#fff", color: method === m.id ? "#FF385C" : "#555", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all .15s" }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>

              {/* ── UPI Section ── */}
              {method === "UPI" && (
                <div style={{ marginBottom: 16 }}>
                  {/* UPI sub-tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[["id", "UPI ID"], ["qr", "Scan QR"]].map(([k, l]) => (
                      <button key={k} onClick={() => setUpiMode(k)}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${upiMode === k ? "#FF385C" : "#ddd"}`, background: upiMode === k ? "#fff0f3" : "#fff", color: upiMode === k ? "#FF385C" : "#555", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {upiMode === "id" && (
                    <>
                      {/* Popular UPI apps */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
                        {upiApps.map(a => (
                          <button key={a.id} onClick={() => setUpiId(`user@${a.id}`)}
                            style={{ padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${upiId.includes(a.id) ? a.color : "#eee"}`, background: upiId.includes(a.id) ? `${a.color}11` : "#fafafa", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: a.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{a.icon}</div>
                            <span style={{ fontSize: 9, color: "#555", fontWeight: 500 }}>{a.label}</span>
                          </button>
                        ))}
                      </div>
                      <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g. name@upi)"
                        style={{ width: "100%", padding: "11px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, outline: "none", marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }} />
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>Or enter your UPI ID manually</div>
                    </>
                  )}

                  {upiMode === "qr" && (
                    <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                      <div style={{ display: "inline-block", padding: 12, background: "#fff", border: "3px solid #FF385C", borderRadius: 16, animation: "qrPulse 2s infinite", marginBottom: 12, position: "relative", overflow: "hidden" }}>
                        <QRCode value={qrVal} size={160} />
                        {qrScanned && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                            <div style={{ fontSize: 40, animation: "checkPop .4s ease" }}>✅</div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#2e7d32" }}>Payment Received!</div>
                          </div>
                        )}
                        {/* Scanner line */}
                        {!qrScanned && (
                          <div style={{ position: "absolute", left: 12, right: 12, height: 2, background: "linear-gradient(90deg,transparent,#FF385C,transparent)", animation: "scanLine 2s linear infinite", top: 0 }} />
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#717171", marginBottom: 6 }}>Scan with any UPI app</div>
                      {qrTimer > 0 && !qrScanned && <div style={{ fontSize: 11, color: "#FF385C", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>Expires in {fmtTimer(qrTimer)}</div>}
                      {qrTimer === 0 && !qrScanned && <div style={{ fontSize: 11, color: "#e53935" }}>QR expired — refresh to try again</div>}
                      {/* Simulate scan button */}
                      {!qrScanned && qrTimer > 0 && (
                        <button onClick={() => { setQrScanned(true); setTimeout(() => payUpi(), 1800); }}
                          style={{ marginTop: 10, padding: "8px 20px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, cursor: "pointer", color: "#555" }}>
                          Simulate Scan ↗
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Debit Card Section ── */}
              {method === "Card" && (
                <div style={{ marginBottom: 16 }}>
                  {/* Card preview */}
                  <div style={{ background: "linear-gradient(135deg,#1e293b,#334155)", borderRadius: 14, padding: "20px 22px", marginBottom: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
                    <div style={{ position: "absolute", bottom: -40, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                      <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1 }}>DEBIT CARD</div>
                      <div style={{ fontSize: 20 }}>💳</div>
                    </div>
                    <div style={{ fontSize: 16, letterSpacing: 3, fontFamily: "'JetBrains Mono',monospace", marginBottom: 16, opacity: card ? 1 : 0.3 }}>
                      {card || "•••• •••• •••• ••••"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 2 }}>CARDHOLDER</div>
                        <div style={{ fontSize: 12, fontWeight: 600, opacity: cardName ? 1 : 0.3 }}>{cardName || "YOUR NAME"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 2 }}>EXPIRES</div>
                        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", opacity: exp ? 1 : 0.3 }}>{exp || "MM/YY"}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <input value={card} onChange={e => setCard(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                      placeholder="Card Number" style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }} />
                    <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                      placeholder="Cardholder Name" style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input value={exp} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setExp(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v); }}
                        placeholder="MM / YY" style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none" }} />
                      <input value={cvv} onChange={e => setCvv(e.target.value.slice(0, 3))} type="password"
                        placeholder="CVV" style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none" }} />
                    </div>
                    <select value={cardBank} onChange={e => setCardBank(e.target.value)}
                      style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, outline: "none", color: cardBank ? "#222" : "#aaa" }}>
                      <option value="">Select Issuing Bank</option>
                      {NET_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* ── Net Banking Section ── */}
              {method === "NetBanking" && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Popular Banks</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {NET_BANKS.slice(0, 6).map(b => (
                      <button key={b} onClick={() => setNetBank(b)}
                        style={{ padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${netBank === b ? "#FF385C" : "#eee"}`, background: netBank === b ? "#fff0f3" : "#fafafa", fontSize: 12, fontWeight: 500, cursor: "pointer", color: netBank === b ? "#FF385C" : "#333", textAlign: "left" }}>
                        🏦 {b}
                      </button>
                    ))}
                  </div>
                  <select value={netBank} onChange={e => setNetBank(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, outline: "none", marginBottom: 12, color: netBank ? "#222" : "#aaa" }}>
                    <option value="">All Banks ↓</option>
                    {NET_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {netBank && (
                    <>
                      <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fd", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#1e40af", marginBottom: 10 }}>🏦 {netBank} — Secure Login</div>
                        <div style={{ display: "grid", gap: 8 }}>
                          <input value={netUser} onChange={e => setNetUser(e.target.value)} placeholder="Customer ID / Username"
                            style={{ padding: "10px 12px", border: "1px solid #c7d7fd", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }} />
                          <input value={netPass} onChange={e => setNetPass(e.target.value)} type="password" placeholder="Password"
                            style={{ padding: "10px 12px", border: "1px solid #c7d7fd", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 8 }}>🔒 256-bit SSL encrypted · Simulated demo only</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>}

            {/* ── OTP Section ── */}
            {showOtp && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>📲 OTP Verification</div>
                  {method === "UPI" && <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>OTP sent to your UPI-linked mobile number</div>}
                  {method === "Card" && <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>OTP sent to your registered mobile for 3D Secure verification</div>}
                  {method === "NetBanking" && <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>OTP sent to your {netBank}-registered mobile number</div>}
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ width: 40, height: 48, border: "2px solid " + (otp[i] ? "#FF385C" : "#ddd"), borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: otp[i] ? "#fff0f3" : "#fafafa" }}>
                        {otp[i] ? "•" : ""}
                      </div>
                    ))}
                  </div>
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP" maxLength={6}
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 16, outline: "none", textAlign: "center", letterSpacing: 6, fontFamily: "'JetBrains Mono',monospace" }} />
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 8, textAlign: "center" }}>
                    Didn't receive? <span style={{ color: "#FF385C", cursor: "pointer", fontWeight: 600 }}>Resend OTP</span>
                    <span style={{ margin: "0 8px" }}>·</span>
                    <span style={{ color: "#28a745", fontWeight: 600, fontSize: 10 }}>Demo OTP: 123456</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pay / Verify button */}
            <div style={{ display: "flex", gap: 10 }}>
              {!showOtp && <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", color: "#555", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Back</button>}
              {showOtp && <button onClick={() => { setShowOtp(false); setOtp(""); }} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", color: "#555", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>}
              <button onClick={handlePay} disabled={!canPay || (method === "UPI" && upiMode === "qr" && qrScanned && !showOtp)}
                style={{ flex: 2, padding: "13px", borderRadius: 10, border: "none", background: canPay ? "#FF385C" : "#eee", color: canPay ? "#fff" : "#aaa", fontWeight: 700, fontSize: 14, cursor: canPay ? "pointer" : "not-allowed", transition: "background .2s" }}>
                {showOtp ? `Verify & Pay ${fmtINR(total)} →` : method === "UPI" && upiMode === "qr" && qrScanned ? "Payment Done — Processing..." : method ? `Pay ${fmtINR(total)} →` : "Select method"}
              </button>
            </div>
          </>}

          {/* ── PROCESSING / DONE PHASE ── */}
          {(phase === "processing" || phase === "done") && <>
            {phase === "done" && (
              <div style={{ textAlign: "center", padding: "8px 0 16px", animation: "bounceIn .5s ease" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#2e7d32" }}>Booking Confirmed!</div>
                <div style={{ color: "#717171", fontSize: 13, marginTop: 4 }}>Confirmation sent to {bd.email}</div>
                <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f5e9", borderRadius: 20, padding: "5px 14px" }}>
                  <span style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>
                    {method === "UPI" ? "📱 Paid via UPI" : method === "Card" ? "💳 Paid via Debit Card" : "🏦 Paid via Net Banking"}
                  </span>
                </div>
              </div>
            )}
            <TxTimeline steps={steps} txHash={txHash} ipfsCid={ipfsCid} blockNum={blockNum} />
            {phase === "done" && <>
              <div style={{ background: "#f0fff4", border: "1px solid #c8e6c9", borderRadius: 10, padding: 12, marginTop: 14, fontSize: 12, color: "#1b5e20", lineHeight: 1.6 }}>
                <b>Tamper-Proof Guarantee:</b> Your booking lives permanently on IPFS and the Polygon ledger. Even if our database is deleted, your proof remains.
              </div>
              <button onClick={onClose} style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 10, border: "none", background: "#FF385C", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>View My Trips →</button>
            </>}
          </>}
        </div>
      </div>
    </div>
  );
}

// ── Hotel Detail ──────────────────────────────────────────────────────────────
function HotelDetail({ hotel, vacancy, onClose, onBooked }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [pendingBd, setPendingBd] = useState(null);
  const allImgs = [hotel.cover, ...hotel.imgs];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 900, overflowY: "auto" }}>
      {pendingBd && <PaymentModal hotel={hotel} bd={pendingBd} onClose={() => setPendingBd(null)} onSuccess={data => { setPendingBd(null); onBooked({ ...pendingBd, ...data }); onClose(); }} />}
      <button onClick={onClose} style={{ position: "fixed", top: 20, left: 20, zIndex: 910, background: "#fff", border: "1px solid #eee", borderRadius: 30, padding: "8px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>← Back</button>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
        {/* Image grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "220px 220px", gap: 6, borderRadius: 14, overflow: "hidden", marginBottom: 28, marginTop: 20 }}>
          <img src={allImgs[0]} alt="" style={{ gridRow: "1/3", width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }} onClick={() => setImgIdx(0)} />
          {allImgs.slice(1, 5).map((img, i) => (
            <img key={i} src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }} onClick={() => setImgIdx(i + 1)} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 56, alignItems: "start" }}>
          {/* Left */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{hotel.name}</h1>
                <div style={{ color: "#717171", fontSize: 14 }}>📍 {hotel.city} · ★ {hotel.rating} ({hotel.reviews} reviews) · {hotel.type}</div>
              </div>
              <img src={hotel.owner.photo} alt={hotel.owner.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2px solid #eee" }} />
            </div>
            <div style={{ display: "flex", gap: 14, padding: "16px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", marginBottom: 24 }}>
              {[{ icon: "🏠", t: hotel.type }, { icon: "🌟", t: hotel.superhost ? "Superhost" : "Verified Host" }, { icon: "📅", t: `Host since ${hotel.owner.since}` }].map(h => (
                <div key={h.t} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{h.icon}</span>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.t}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#444", marginBottom: 24 }}>{hotel.desc}</p>
            <div style={{ marginBottom: 24, padding: "16px 0", borderTop: "1px solid #eee" }}>
              {[{ icon: "📍", t: "Great location", s: hotel.locality }, { icon: "🔐", t: "Smart Contract Escrow", s: "Payment secured on Polygon. Auto-refunded on cancellation." }].map(h => (
                <div key={h.t} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>{h.icon}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{h.t}</div><div style={{ color: "#717171", fontSize: 13, marginTop: 2 }}>{h.s}</div></div>
                </div>
              ))}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 14 }}>What this place offers</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {hotel.amenities.map(a => <div key={a} style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}><span>✓</span>{a}</div>)}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Where you'll be</h3>
            <img src={hotel.localityImg} alt="locality" style={{ width: "100%", borderRadius: 12, height: 200, objectFit: "cover", marginBottom: 10 }} />
            <div style={{ color: "#717171", fontSize: 13 }}>{hotel.locality}</div>
          </div>
          {/* Right: booking sticky card */}
          <div style={{ position: "sticky", top: 24, border: "1px solid #ddd", borderRadius: 16, padding: 24, boxShadow: "0 4px 30px rgba(0,0,0,.09)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 22 }}>{fmtINR(hotel.price)}</span>
              <span style={{ color: "#717171", fontSize: 14 }}> / night</span>
            </div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>★ {hotel.rating} · {hotel.reviews} reviews · {vacancy} rooms left</div>
            <div style={{ background: vacancy === 0 ? "#fce4ec" : vacancy <= 2 ? "#fff3e0" : "#f0fff4", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: vacancy === 0 ? "#c62828" : vacancy <= 2 ? "#e65100" : "#1b5e20" }}>
              {vacancy === 0 ? "❌ Sold out" : vacancy <= 2 ? `⚡ Only ${vacancy} rooms left!` : `✓ ${vacancy} rooms available`}
            </div>
            <div style={{ background: "#f0fff4", border: "1px solid #c8e6c9", borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 11, color: "#1b5e20" }}>
              🔐 Smart escrow · Auto-refund on cancellation
            </div>
            <div style={{ fontSize: 12, color: "#717171", marginBottom: 12 }}>🚫 {hotel.cancel}</div>
          </div>
        </div>
      </div>
      <AIChatBubble hotel={hotel} onProceedToPayment={bd => setPendingBd(bd)} />
    </div>
  );
}

// ── Hotel Card ────────────────────────────────────────────────────────────────
function HotelCard({ hotel, vacancy, onClick }) {
  const [liked, setLiked] = useState(false);
  const [imgI, setImgI] = useState(0);
  const imgs = [hotel.cover, ...hotel.imgs.slice(0, 2)];
  return (
    <div style={{ cursor: "pointer", animation: "fadeUp .4s ease" }} onClick={onClick}>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", marginBottom: 10, background: "#f5f5f5" }}>
        <img src={imgs[imgI]} alt={hotel.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .3s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"} />
        <button onClick={e => { e.stopPropagation(); setLiked(l => !l); }} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", fontSize: 20, filter: "drop-shadow(0 1px 3px rgba(0,0,0,.4))", cursor: "pointer" }}>
          {liked ? "❤️" : "🤍"}
        </button>
        {hotel.superhost && <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,.92)", color: "#222", fontSize: 9, padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>SUPERHOST</span>}
        {vacancy <= 2 && vacancy > 0 && <div style={{ position: "absolute", bottom: 10, left: 10, background: "#FF385C", color: "#fff", fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>⚡ {vacancy} left</div>}
        {vacancy === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#555", fontSize: 14 }}>Sold Out</div>}
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
          {imgs.map((_, i) => <div key={i} onClick={e => { e.stopPropagation(); setImgI(i); }} style={{ width: i === imgI ? 12 : 5, height: 5, borderRadius: 3, background: i === imgI ? "#fff" : "rgba(255,255,255,.5)", transition: "all .2s", cursor: "pointer" }} />)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#222", lineHeight: 1.3 }}>{hotel.name}</div>
          <div style={{ color: "#717171", fontSize: 13, marginTop: 2 }}>{hotel.city}</div>
          <div style={{ color: "#717171", fontSize: 13 }}>{hotel.type}</div>
          <div style={{ marginTop: 5, fontSize: 14 }}><span style={{ fontWeight: 700 }}>{fmtINR(hotel.price)}</span><span style={{ color: "#717171" }}> / night</span></div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>★ {hotel.rating}</div>
      </div>
    </div>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const [steps, setSteps] = useState([]);
  async function doCancel() {
    setCancelling(true);
    const s = [
      { label: "AI Layer", detail: "Processing cancellation...", active: true, done: false, showTx: false, showIpfs: false },
      { label: "Database", detail: "Broadcasting via Redis pub/sub...", active: false, done: false, showTx: false, showIpfs: false },
      { label: "Blockchain", detail: "Releasing escrow refund...", active: false, done: false, showTx: true, showIpfs: false },
      { label: "Storage", detail: "Logging cancellation on IPFS...", active: false, done: false, showTx: false, showIpfs: true },
    ];
    const set = arr => setSteps([...arr]);
    set(s);
    await sleep(900); s[0] = { ...s[0], active: false, done: true, detail: "Cancellation approved ✓" }; set(s);
    s[1] = { ...s[1], active: true }; set(s);
    await sleep(800); s[1] = { ...s[1], active: false, done: true, detail: "All sessions notified instantly ✓" }; set(s);
    s[2] = { ...s[2], active: true }; set(s);
    await sleep(1200); const tx = mkTx(); const bn = mkBlock();
    s[2] = { ...s[2], active: false, done: true, detail: `Refund of ${fmtINR(booking.hotel.price * (booking.nights || 1))} initiated ✓`, txHash: tx }; set(s);
    s[3] = { ...s[3], active: true }; set(s);
    await sleep(800); const cid = mkCID();
    s[3] = { ...s[3], active: false, done: true, detail: "Cancellation record pinned ✓", ipfsCid: cid }; set(s);
    await sleep(400); onCancel(booking.id);
  }
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, marginBottom: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)", animation: "fadeUp .4s ease" }}>
      <div style={{ display: "flex", gap: 14, padding: 18 }}>
        <img src={booking.hotel.cover} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{booking.hotel.name}</div>
          <div style={{ color: "#717171", fontSize: 12, marginBottom: 2 }}>{fmtD(booking.checkin)} → {fmtD(booking.checkout)} · {booking.nights}n · {booking.guests} guests</div>
          <div style={{ color: "#717171", fontSize: 12, marginBottom: 4 }}>{booking.roomType} · {booking.guestName}</div>
          <div style={{ fontSize: 10, color: "#aaa", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7 }}>
            TX: {booking.txHash?.slice(0, 34)}...<br />
            IPFS: {booking.ipfsCid?.slice(0, 26)}...
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <span style={{ background: "#f0fff4", color: "#2e7d32", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>Confirmed</span>
          <span style={{ fontWeight: 800, fontSize: 15 }}>{fmtINR(booking.hotel.price * (booking.nights || 1))}</span>
          {!cancelling && (
            <button onClick={doCancel} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontSize: 12, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 500, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF385C"; e.currentTarget.style.color = "#FF385C"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#555"; }}>Cancel</button>
          )}
        </div>
      </div>
      {cancelling && steps.length > 0 && (
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#e65100", marginBottom: 10 }}>
            ⚡ Redis broadcasting vacancy update — open a second tab to see the room reappear instantly without refresh!
          </div>
          <TxTimeline steps={steps} />
        </div>
      )}
    </div>
  );
}

// ── Live Feed ─────────────────────────────────────────────────────────────────
function LiveFeed({ events }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [events]);
  return (
    <div style={{ background: "#0d0d0d", borderRadius: 12, padding: 16, height: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #4ade80", animation: "pulse 2s infinite" }} />
        <span style={{ color: "#555", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 3 }}>LIVE BLOCKCHAIN EVENTS</span>
      </div>
      <div ref={ref} style={{ overflowY: "auto", height: 110 }}>
        {events.map((e, i) => (
          <div key={i} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, marginBottom: 5, opacity: i === events.length - 1 ? 1 : .45, animation: "slideIn .3s ease", color: e.type === "book" ? "#facc15" : e.type === "cancel" ? "#f87171" : e.type === "redis" ? "#60a5fa" : "#555" }}>
            {e.icon} {e.msg} <span style={{ color: "#333" }}>· {e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const CATS = [{ i: "🏠", l: "All" }, { i: "🏰", l: "Heritage" }, { i: "🌊", l: "Beach" }, { i: "🌿", l: "Eco" }, { i: "⛺", l: "Glamping" }, { i: "🌲", l: "Forest" }, { i: "🏔️", l: "Mountain" }, { i: "🚢", l: "Floating" }, { i: "🏡", l: "Boutique" }];
const CAT_TYPES = { Heritage: ["Heritage Palace", "Heritage Haveli", "City Landmark"], Beach: ["Beachfront Villa"], Eco: ["Forest Retreat"], Glamping: ["Glamping"], Forest: ["Treehouse", "Forest Retreat"], Mountain: ["Mountain Lodge"], Floating: ["Floating Suite"], Boutique: ["Boutique B&B"] };

export default function App() {
  const [vac, setVac] = useState(Object.fromEntries(HOTELS.map(h => [h.id, h.rooms])));
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("explore");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [events, setEvents] = useState([
    { type: "init", icon: "⛓", msg: "StayChain contract deployed · Polygon Mumbai", time: nowStr() },
    { type: "init", icon: "🤖", msg: "AI booking agent online · Claude Sonnet", time: nowStr() },
    { type: "redis", icon: "📡", msg: "Redis pub/sub live · real-time sync ready", time: nowStr() },
  ]);
  const [toasts, setToasts] = useState([]);

  const addEv = (type, icon, msg) => setEvents(e => [...e, { type, icon, msg, time: nowStr() }]);
  const toast = (msg, col = "#2e7d32") => { const id = Date.now(); setToasts(t => [...t, { id, msg, col }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000); };

  function handleBooked(data) {
    setBookings(b => [{ id: Date.now(), ...data }, ...b]);
    setVac(v => ({ ...v, [data.hotel.id]: Math.max(0, v[data.hotel.id] - 1) }));
    addEv("book", "📥", `Booked · ${data.hotel.name} · ${data.txHash?.slice(0, 14)}...`);
    addEv("redis", "📡", `Vacancy -1 broadcast · ${data.hotel.name}`);
    addEv("ipfs", "🗂", `IPFS pin · ${data.ipfsCid?.slice(0, 18)}...`);
    toast(`✅ Booking confirmed! ${data.hotel.name}`);
    setTab("trips");
  }

  function handleCancel(id) {
    const b = bookings.find(x => x.id === id); if (!b) return;
    setBookings(p => p.filter(x => x.id !== id));
    setVac(v => ({ ...v, [b.hotel.id]: v[b.hotel.id] + 1 }));
    addEv("cancel", "❌", `Cancelled · ${b.hotel.name} · vacancy +1`);
    addEv("redis", "📡", `Vacancy +1 broadcast · all sessions updated instantly`);
    addEv("init", "🔓", `Escrow released · refund initiated`);
    toast(`Booking cancelled. Room now available.`, "#c62828");
  }

  const filtered = HOTELS.filter(h => {
    const s = search.toLowerCase();
    const mS = !s || h.name.toLowerCase().includes(s) || h.city.toLowerCase().includes(s) || h.type.toLowerCase().includes(s);
    const mC = cat === "All" || (CAT_TYPES[cat] || []).some(t => h.type === t);
    return mS && mC;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <style>{STYLES}</style>
      <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: "#fff", borderLeft: `4px solid ${t.col}`, border: "1px solid #eee", padding: "11px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,.1)", animation: "slideIn .3s ease" }}>{t.msg}</div>
        ))}
      </div>
      {selected && <HotelDetail hotel={selected} vacancy={vac[selected.id]} onClose={() => setSelected(null)} onBooked={data => handleBooked({ ...data, hotel: selected })} />}
      <header style={{ borderBottom: "1px solid #eee", background: "rgba(255,255,255,.96)", position: "sticky", top: 0, zIndex: 800, backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect width="30" height="30" rx="8" fill="#FF385C" /><path d="M15 6C12.8 6 10 8.2 10 11.5C10 15.5 15 21 15 21s5-5.5 5-9.5C20 8.2 17.2 6 15 6Z" fill="white" /><circle cx="15" cy="11.5" r="2.2" fill="#FF385C" /></svg>
            <span style={{ fontWeight: 800, fontSize: 19, color: "#FF385C", letterSpacing: "-.5px" }}>staychain</span>
          </div>
          <div style={{ flex: 1, maxWidth: 500, margin: "0 auto" }}>
            <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: 40, boxShadow: "0 2px 8px rgba(0,0,0,.08)", background: "#fff", overflow: "hidden" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${HOTELS.length} properties across India...`}
                style={{ flex: 1, padding: "11px 18px", border: "none", fontSize: 13, outline: "none", background: "transparent" }} />
              <button style={{ background: "#FF385C", border: "none", padding: "8px 14px", margin: 4, borderRadius: 32, color: "#fff", fontSize: 15, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🔍</button>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {[["explore", "Explore"], ["trips", "Trips" + (bookings.length ? ` (${bookings.length})` : "")], ["live", "Live Feed"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: tab === id ? "#FF385C" : "transparent", color: tab === id ? "#fff" : "#222", fontWeight: tab === id ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>{lbl}</button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fff4", border: "1px solid #c8e6c9", borderRadius: 20, padding: "5px 12px", flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, background: "#4caf50", borderRadius: "50%", boxShadow: "0 0 5px #4caf50", animation: "pulse 2s infinite", display: "inline-block" }} />
            <span style={{ color: "#2e7d32", fontSize: 11, fontWeight: 600 }}>Polygon Mumbai</span>
          </div>
        </div>
        {tab === "explore" && (
          <div style={{ borderTop: "1px solid #f5f5f5" }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", gap: 4, overflowX: "auto", padding: "8px 24px" }}>
              {CATS.map(c => (
                <button key={c.l} onClick={() => setCat(c.l)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 14px", borderRadius: 8, border: "none", background: "transparent", flexShrink: 0, cursor: "pointer", borderBottom: cat === c.l ? "2px solid #222" : "2px solid transparent", color: cat === c.l ? "#222" : "#717171", transition: "all .15s" }}>
                  <span style={{ fontSize: 20 }}>{c.i}</span>
                  <span style={{ fontSize: 11, fontWeight: cat === c.l ? 700 : 500 }}>{c.l}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
        {tab === "explore" && (
          <>
            <div style={{ display: "flex", gap: 14, padding: "20px 0", overflowX: "auto" }}>
              {[{ i: "🏨", v: HOTELS.length, l: "Properties" }, { i: "🛏", v: Object.values(vac).reduce((a, b) => a + b, 0), l: "Rooms available" }, { i: "✅", v: bookings.length, l: "Active bookings" }, { i: "⛓", v: bookings.length * 4, l: "On-chain TXs" }].map(s => (
                <div key={s.l} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "12px 18px", display: "flex", gap: 10, alignItems: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
                  <span style={{ fontSize: 22 }}>{s.i}</span>
                  <div><div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{s.v}</div><div style={{ color: "#717171", fontSize: 11, marginTop: 2 }}>{s.l}</div></div>
                </div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>No properties found</div>
                <div style={{ color: "#717171", fontSize: 14, marginTop: 6 }}>Try a different search or category</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 26, paddingBottom: 60 }}>
                {filtered.map(h => <HotelCard key={h.id} hotel={h} vacancy={vac[h.id]} onClick={() => setSelected(h)} />)}
              </div>
            )}
          </>
        )}
        {tab === "trips" && (
          <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 0" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Your Trips</h2>
            <p style={{ color: "#717171", fontSize: 14, marginBottom: 28 }}>All bookings secured by Polygon smart contract escrow.</p>
            {bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🗺️</div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>No trips yet</div>
                <div style={{ color: "#717171", fontSize: 14, marginBottom: 20 }}>Start by exploring our properties.</div>
                <button onClick={() => setTab("explore")} style={{ padding: "12px 28px", background: "#FF385C", border: "none", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Explore {HOTELS.length} Properties →</button>
              </div>
            ) : bookings.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}
          </div>
        )}
        {tab === "live" && (
          <div style={{ maxWidth: 680, margin: "40px auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Live Blockchain Feed</h2>
            <p style={{ color: "#717171", fontSize: 14, marginBottom: 22 }}>Real-time events from smart contracts, Redis pub/sub, and IPFS.</p>
            <LiveFeed events={events} />
            <div style={{ marginTop: 20, border: "1px solid #eee", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#ccc", fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>ARCHITECTURE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Frontend", "React + Tailwind CSS"], ["Backend", "Node.js + FastAPI"], ["Blockchain", "Polygon + Solidity"], ["AI", "Claude Sonnet API"], ["Database", "PostgreSQL + Redis"], ["Storage", "IPFS + AWS S3"]].map(([k, v]) => (
                  <div key={k} style={{ background: "#fafafa", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#bbb", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
