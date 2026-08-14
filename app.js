const demo=[
 {id:1,title:"Apartemen Gunawangsa Manyar",type:"Apartemen",status:"Dijual",price:"Rp 170 Juta",location:"Manyar, Surabaya",specs:"Studio • 21 m² • Tower A",description:"Full furnished, lokasi strategis dekat area pendidikan dan pusat kota.",images:["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85"]},
 {id:2,title:"Apartemen Puncak Kertajaya",type:"Apartemen",status:"Dijual",price:"Rp 255 Juta",location:"Kertajaya, Surabaya",specs:"2 Bedroom • 36 m² • Tower A",description:"Pool view, lantai favorit, cocok untuk hunian maupun investasi.",images:["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"]},
 {id:3,title:"Apartemen Educity Tower Yale",type:"Apartemen",status:"Dijual",price:"Rp 290 Juta",location:"Surabaya Timur",specs:"Studio • 21 m² • Tower Yale",description:"Interior baru dengan view pool, dekat ITS dan area pendidikan.",images:["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85"]}
];
let properties=[];
const clientReady=()=>window.SUPABASE_URL && !window.SUPABASE_URL.includes("ISI_") && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes("ISI_");
async function load(){
  try{
    if(clientReady()){
      const sb=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
      const {data,error}=await sb.from("properties").select("*").order("created_at",{ascending:false});
      if(!error && data?.length) properties=data; else properties=demo;
    }else properties=demo;
  }catch(e){properties=demo}
  render();
}
function img(p){return Array.isArray(p.images)?p.images[0]:(p.images||"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85")}
function render(){
 const q=(document.getElementById("search").value||"").toLowerCase(), type=document.getElementById("typeFilter").value;
 const rows=properties.filter(p=>(!q||JSON.stringify(p).toLowerCase().includes(q))&&(!type||p.type===type));
 document.getElementById("count").textContent=`${rows.length} properti`;
 document.getElementById("empty").classList.toggle("hidden",rows.length>0);
 document.getElementById("grid").innerHTML=rows.map((p,i)=>`<article class="card"><div class="photo"><img src="${img(p)}" alt="${p.title||"Properti"}" loading="lazy"><span class="badge">${p.status||"Dijual"}</span></div><div class="body"><h3>${p.title||"-"}</h3><div class="meta">${p.specs||p.type||""}</div><div class="price">${p.price||"-"}</div><div class="loc">📍 ${p.location||"Surabaya"}</div><button class="detail-btn" onclick="detail(${i},${JSON.stringify(rows).replaceAll('"','&quot;')})">Lihat Detail →</button></div></article>`).join("");
 window.currentRows=rows;
}
function detail(i){const p=window.currentRows[i];document.getElementById("detail").innerHTML=`<img class="detail-photo" src="${img(p)}" alt=""><div class="detail-content"><div class="eyebrow">${p.status||"PROPERTI"}</div><h2>${p.title||"-"}</h2><div class="price">${p.price||"-"}</div><div class="loc">📍 ${p.location||"Surabaya"}</div><p><b>${p.specs||""}</b></p><p>${p.description||"Hubungi kami untuk informasi lengkap mengenai properti ini."}</p><a class="wa" target="_blank" href="${waLink(`Halo WillProperty, saya tertarik dengan ${p.title||"properti"} ${p.price||""}.`)}">Tanya via WhatsApp</a></div>`;document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function waLink(text){return `https://wa.me/${window.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`}
function quick(v){document.getElementById("search").value=v;document.getElementById("typeFilter").value="";document.getElementById("listing").scrollIntoView({behavior:"smooth"});render()}
document.getElementById("search").addEventListener("input",render);document.getElementById("typeFilter").addEventListener("change",render);
for(const id of ["waTop","waBottom","waFloat"]) document.getElementById(id).href=waLink("Halo WillProperty, saya ingin mencari informasi properti.");
load();