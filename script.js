const PRODUCTS = [
  {id:1,brand:"ON",name:"Cloudmonster 3 — Hyper Lily",price:210,tags:["all","best","race"],image:"image.png",desc:"A responsive everyday runner designed for smooth, energetic miles."},
  {id:2,brand:"Nike",name:"Vaporfly 4 — Volt Ice",price:240,tags:["all","best","race"],image:"image.png",desc:"Lightweight race-day footwear built for fast sessions and competition."},
  {id:3,brand:"Hoka",name:"Tecton X 4 — Frost / Tangerine",price:220,tags:["all","trail"],image:"image.png",desc:"A trail-focused shoe for technical terrain and long-distance adventures."},
  {id:4,brand:"Asics",name:"Megablast — White / Orange Glow",price:210,tags:["all","best","race"],image:"image.png",desc:"Cushioned daily performance with a lively, comfortable ride."},
  {id:5,brand:"Salomon",name:"S/Lab Trail — Black",price:230,tags:["trail"],image:"image.png",desc:"Trail-ready grip and protection for demanding terrain."},
  {id:6,brand:"Hoka",name:"Speedgoat — Stone",price:180,tags:["trail"],image:"image.png",desc:"A dependable trail shoe with confident grip and cushioning."}
];

let cart = JSON.parse(localStorage.getItem("pacelineCart") || "[]");
let selectedProduct = null;
let quantity = 1;

const $ = id => document.getElementById(id);
const money = n => `£${n}`;

function saveCart(){ localStorage.setItem("pacelineCart", JSON.stringify(cart)); updateCartUI(); }
function cartCount(){ return cart.reduce((sum,item)=>sum+item.qty,0); }

function updateCartUI(){
  const count=cartCount();
  ["cartCount","storyCartCount"].forEach(id=>{const el=$(id);if(el)el.textContent=count});
  const items=$("cartItems"), empty=$("cartEmpty"), subtotal=$("cartSubtotal");
  if(!items)return;
  items.innerHTML="";
  if(!cart.length){empty.style.display="block";subtotal.textContent="£0";return}
  empty.style.display="none";
  let total=0;
  cart.forEach((item,index)=>{
    total += item.price*item.qty;
    const row=document.createElement("div");
    row.className="cart-row";
    row.innerHTML=`<div class="cart-row-image" style="background-image:url('assets/${item.image}')"></div>
      <div><h3>${item.name}</h3><p>${item.brand} · ${item.size} · ${item.colour}</p><p>Qty: ${item.qty} · ${money(item.price*item.qty)}</p><button class="remove-item" data-index="${index}">Remove</button></div>
      <strong>${money(item.price*item.qty)}</strong>`;
    items.appendChild(row);
  });
  subtotal.textContent=money(total);
  items.querySelectorAll(".remove-item").forEach(btn=>btn.onclick=()=>{cart.splice(Number(btn.dataset.index),1);saveCart()});
}

function renderProducts(filter="all", search=""){
  const grid=$("productGrid"); if(!grid)return;
  grid.innerHTML="";
  const list=PRODUCTS.filter(p=>p.tags.includes(filter) && `${p.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase()));
  list.forEach((p,i)=>{
    const card=document.createElement("article");
    card.className="product-card";
    card.tabIndex=0;
    card.innerHTML=`<div class="product-image ${i%4===1?"alt2":i%4===2?"alt3":i%4===3?"alt4":""}" style="background-image:url('assets/${p.image}')">
      <span class="product-badge ${p.id===4?"sale":""}">${p.id===4?"SALE":"NEW"}</span></div>
      <div class="product-info"><small>${p.brand}</small><h3>${p.name}</h3><strong>${money(p.price)}</strong></div>`;
    card.onclick=()=>openProduct(p);
    card.onkeydown=e=>{if(e.key==="Enter")openProduct(p)};
    grid.appendChild(card);
  });
}

function openProduct(p){
  selectedProduct=p; quantity=1;
  $("modalBrand").textContent=p.brand;
  $("modalTitle").textContent=p.name;
  $("modalPrice").textContent=money(p.price);
  $("modalDescription").textContent=p.desc;
  $("modalImage").style.backgroundImage=`url('assets/${p.image}')`;
  $("qtyValue").textContent=1; $("sizeSelect").value="";
  $("productModal").hidden=false; document.body.style.overflow="hidden";
}
function closeProduct(){ $("productModal").hidden=true;document.body.style.overflow="" }

function openCart(){
  updateCartUI(); $("cartBackdrop").hidden=false; $("cartDrawer").classList.add("open"); $("cartDrawer").setAttribute("aria-hidden","false");
}
function closeCart(){ $("cartDrawer").classList.remove("open");setTimeout(()=>$("cartBackdrop").hidden=true,300);$("cartDrawer").setAttribute("aria-hidden","true")}

document.addEventListener("DOMContentLoaded",()=>{
  renderProducts(); updateCartUI();

  document.querySelectorAll(".filter").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderProducts(btn.dataset.filter);
  });

  $("modalClose")?.addEventListener("click",closeProduct);
  $("productModal")?.addEventListener("click",e=>{if(e.target.id==="productModal")closeProduct()});
  $("qtyMinus")?.addEventListener("click",()=>{quantity=Math.max(1,quantity-1);$("qtyValue").textContent=quantity});
  $("qtyPlus")?.addEventListener("click",()=>{quantity++;$("qtyValue").textContent=quantity});

  $("addToCartBtn")?.addEventListener("click",()=>{
    const size=$("sizeSelect").value;
    if(!size){alert("Please select a size.");return}
    const colour=$("colourSelect").value;
    const existing=cart.find(i=>i.id===selectedProduct.id&&i.size===size&&i.colour===colour);
    if(existing)existing.qty+=quantity;
    else cart.push({...selectedProduct,size,colour,qty:quantity});
    saveCart(); closeProduct(); openCart();
  });

  $("cartBtn")?.addEventListener("click",openCart); $("storyCartBtn")?.addEventListener("click",openCart);
  $("cartClose")?.addEventListener("click",closeCart); $("cartBackdrop")?.addEventListener("click",closeCart);

  document.querySelector(".mobile-menu-btn")?.addEventListener("click",e=>{
    const nav=document.querySelector(".main-nav");nav.classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",nav.classList.contains("open"));
  });
  document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".main-nav")?.classList.remove("open")));

  const searchBtn=$("searchBtn")||$("storySearchBtn");
  searchBtn?.addEventListener("click",()=>{$("searchBar").hidden=false;$("searchInput").focus()});
  $("searchClose")?.addEventListener("click",()=>{$("searchBar").hidden=true});
  $("searchInput")?.addEventListener("input",e=>{if($("productGrid"))renderProducts("all",e.target.value)});

  $("newsletterForm")?.addEventListener("submit",e=>{e.preventDefault();alert("Thanks for joining the Paceline club!")});
  $("storyNewsletter")?.addEventListener("submit",e=>{e.preventDefault();alert("Thanks for joining the Paceline club!")});
  $("checkoutBtn")?.addEventListener("click",()=>alert("Checkout is a frontend demo. Connect your payment/backend flow here."));
});
