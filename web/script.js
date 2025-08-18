/* global Telegram */
const tg = window.Telegram ? window.Telegram.WebApp : null;

const STATE = {
  user: null,
  lang: "ru",
  theme: "light",
  otpWait: 0,
  tab: "home",
  cards: [],
  history: [],
  rates: null,
  draft: {},
};

const I18N = {
  hello: { ru: "Доброе утро", uz: "Hayrli tong", en: "Good morning", kz: "Қайырлы таң" },
  hello_evening: { ru: "Добрый вечер", uz: "Xayrli kech", en: "Good evening", kz: "Қайырлы кеш" },
  open_from_tg: { ru: "Откройте из Telegram", uz: "Telegramdan oching", en: "Open from Telegram", kz: "Telegram-нан ашыңыз" },
  phone_title: { ru: "Регистрация", uz: "Ro'yxatdan o'tish", en: "Registration", kz: "Тіркелу" },
  phone_label: { ru: "Номер телефона", uz: "Telefon raqami", en: "Phone number", kz: "Телефон нөмірі" },
  continue: { ru: "Продолжить", uz: "Davom etish", en: "Continue", kz: "Жалғастыру" },
  otp_title: { ru: "Подтверждение", uz: "Tasdiqlash", en: "Verification", kz: "Растау" },
  otp_desc: { ru: "Мы отправили код на ваш номер. Демо-код: 111111", uz: "Kodni telefoningizga yubordik. Demo-kod: 111111", en: "We sent a code. Demo: 111111", kz: "Код жіберілді. Демо: 111111" },
  resend: { ru: "Отправить ещё раз", uz: "Qayta yuborish", en: "Resend", kz: "Қайта жіберу" },
  pin_set_title: { ru: "Создайте PIN", uz: "PIN yarating", en: "Create PIN", kz: "PIN жасаңыз" },
  pin_confirm_title: { ru: "Подтвердите PIN", uz: "PIN tasdiqlang", en: "Confirm PIN", kz: "PIN растаңыз" },
  pin_login_title: { ru: "Введите PIN", uz: "PIN kiriting", en: "Enter PIN", kz: "PIN енгізіңіз" },
  forgot: { ru: "Забыл пароль", uz: "Parolni unutdim", en: "Forgot PIN", kz: "PIN ұмытылды" },
  home_cards: { ru: "Мои карты", uz: "Kartalarim", en: "My Cards", kz: "Карталарым" },
  add_card: { ru: "Добавить карту", uz: "Karta qo'shish", en: "Add Card", kz: "Карта қосу" },
  send: { ru: "Отправить", uz: "Yuborish", en: "Send", kz: "Жіберу" },
  receive: { ru: "Получить", uz: "Qabul qilish", en: "Receive", kz: "Алу" },
  topup: { ru: "Пополнить", uz: "To'ldirish", en: "Top Up", kz: "Толықтыру" },
  scan: { ru: "Скан", uz: "Skan", en: "Scan", kz: "Скан" },
  recent: { ru: "Недавние операции", uz: "Yaqinda amalga oshirilganlar", en: "Recent Transfers", kz: "Жуырдағы аударымдар" },
  see_all: { ru: "Показать все", uz: "Hammasini ko‘rish", en: "See all", kz: "Барлығын көру" },
  rates: { ru: "Курсы валют", uz: "Valyuta kurslari", en: "Exchange Rates", kz: "Валюта бағамдары" },
  promos: { ru: "Промо", uz: "Aksiyalar", en: "Promotions", kz: "Акциялар" },
  transfers_title: { ru: "Перевод", uz: "O'tkazma", en: "Transfer", kz: "Аудару" },
  from: { ru: "Счёт списания", uz: "Jo'natuvchi karta", en: "From", kz: "Шығарыу" },
  to: { ru: "Получатель (карта)", uz: "Qabul qiluvchi (karta)", en: "To (card)", kz: "Алушы (карта)" },
  amount: { ru: "Сумма", uz: "Miqdor", en: "Amount", kz: "Сома" },
  confirm: { ru: "Подтвердить", uz: "Tasdiqlash", en: "Confirm", kz: "Растау" },
  processing: { ru: "Отправка...", uz: "Yuborilmoqda...", en: "Processing...", kz: "Жіберілуде..." },
  status_ok: { ru: "Успешно!", uz: "Muvaffaqiyatli!", en: "Success!", kz: "Сәтті!" },
  history_title: { ru: "История операций", uz: "Amaliyotlar tarixi", en: "History", kz: "Тарих" },
  profile_title: { ru: "Профиль", uz: "Profil", en: "Profile", kz: "Профиль" },
  settings: { ru: "Настройки", uz: "Sozlamalar", en: "Settings", kz: "Баптаулар" },
  language: { ru: "Язык", uz: "Til", en: "Language", kz: "Тіл" },
  theme: { ru: "Стиль", uz: "Uslub", en: "Theme", kz: "Тақырып" },
  light: { ru: "Светлый", uz: "Yorug'", en: "Light", kz: "Жарық" },
  dark: { ru: "Тёмный", uz: "Qorong'i", en: "Dark", kz: "Қараңғы" },
  logout: { ru: "Выйти", uz: "Chiqish", en: "Logout", kz: "Шығу" },
  fee: { ru: "Комиссия", uz: "Komissiya", en: "Fee", kz: "Комиссия" },
  txid: { ru: "ID транзакции", uz: "Tranzaksiya ID", en: "Transaction ID", kz: "Транзакция ID" },
};

function t(key){ return (I18N[key] && I18N[key][STATE.lang]) || key; }

function ready(){
  if(tg){ tg.ready(); tg.expand(); }
}

async function api(path, opts={}){
  const url = path + (path.includes("?") ? "&" : "?") + "ts=" + Date.now();
  const r = await fetch(url, {
    headers: { "Content-Type":"application/json" },
    method: opts.method || "GET",
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  return r.json();
}

function byId(id){ return document.getElementById(id); }

function setGreeting(){
  const d = new Date();
  const h = d.getHours();
  const text = (h >= 18 || h < 6) ? I18N.hello_evening[STATE.lang] : I18N.hello[STATE.lang];
  const node = document.getElementById("greeting");
  node.textContent = text;
}

async function loadUser(){
  const tgUser = tg?.initDataUnsafe?.user || null;
  const queryUser = new URLSearchParams(location.search).get("user_id");
  const uid = tgUser?.id || queryUser;
  if(!uid){
    renderSimple(`<div class="card center">${t("open_from_tg")}</div>`);
    return;
  }
  const res = await api(`/api/user?user_id=${uid}`);
  if(!res.ok){
    renderRegisterPhone(uid);
    return;
  }
  STATE.user = res.data;
  STATE.lang = (res.data.language || "ru");
  setGreeting();
  // decide where to go
  if(!res.data.is_registered){
    renderRegisterPhone(res.data.user_id);
  } else if(!(res.data.pin_hash && res.data.pin_salt)){
    renderPinSet(res.data.user_id, true);
  } else {
    renderPinLogin(res.data.user_id);
  }
  // tabs handlers
  hookTabs();
}

function hookTabs(){
  const tabs = document.querySelectorAll(".tabs button");
  tabs.forEach(b=>{
    b.onclick = () => {
      tabs.forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      STATE.tab = b.dataset.tab;
      routeTab();
    };
  });
}

function routeTab(){
  if(STATE.tab==="home") renderHome();
  if(STATE.tab==="transfers") renderTransfer();
  if(STATE.tab==="history") renderHistory();
  if(STATE.tab==="profile") renderProfile();
}

function renderSimple(html){
  byId("view").innerHTML = html;
}

function renderRegisterPhone(userId){
  STATE.tab = "home";
  document.querySelector('.tabs button[data-tab="home"]').classList.add("active");
  renderSimple(`
    <div class="card center">
      <div class="badge">${t("phone_title")}</div>
      <h2>${t("phone_label")}</h2>
      <input id="phone" placeholder="+7 900 000 00 00" />
      <div style="height:10px"></div>
      <button class="btn" id="btnCont">${t("continue")}</button>
    </div>
  `);
  byId("btnCont").onclick = async () => {
    const phone = byId("phone").value.trim();
    const res = await api("/api/register/start", { method:"POST", body:{ user_id: userId, phone } });
    if(res.ok){
      STATE.otpWait = res.resend_in_sec || 120;
      renderOTP(userId);
    }
  };
}

function renderOTP(userId){
  renderSimple(`
    <div class="card center">
      <div class="badge">${t("otp_title")}</div>
      <p class="small">${t("otp_desc")}</p>
      <input id="code" placeholder="------" maxlength="6" />
      <div style="height:10px"></div>
      <button class="btn" id="btnOtp">${t("continue")}</button>
      <div style="height:8px"></div>
      <button class="secondary" id="btnResend" disabled>${t("resend")} (${STATE.otpWait})</button>
    </div>
  `);
  const timer = setInterval(()=>{
    STATE.otpWait--; if(STATE.otpWait<=0){clearInterval(timer); byId("btnResend").disabled=false; byId("btnResend").textContent=t("resend");}
    else { byId("btnResend").textContent = `${t("resend")} (${STATE.otpWait})`; }
  },1000);
  byId("btnResend").onclick = ()=>{
    STATE.otpWait = 120;
    renderOTP(userId);
  };
  byId("btnOtp").onclick = async ()=>{
    const code = byId("code").value.trim();
    const res = await api("/api/register/verify", { method:"POST", body:{ user_id:userId, code } });
    if(res.ok){ renderPinSet(userId, false); }
    else alert("Invalid code");
  };
}

function renderPinSet(userId, fresh){
  STATE.draft.pin1 = "";
  renderSimple(`
    <div class="card center">
      <div class="badge">${fresh? t("pin_set_title") : t("pin_confirm_title")}</div>
      <div id="pinDots" style="font-size:30px; letter-spacing:8px; margin:12px 0;">____</div>
      <div class="kb">
        ${[1,2,3,4,5,6,7,8,9,"del",0,"ok"].map(x=>`<button data-k="${x}">${x==="del"?"⌫":(x==="ok"?"OK":x)}</button>`).join("")}
      </div>
    </div>
  `);
  const dots = byId("pinDots");
  function updateDots(val){ dots.textContent = (val+"____").slice(0,4).replace(/./g, c=> c==="_"?"_":"•"); }
  let buffer = "";
  document.querySelectorAll(".kb button").forEach(b=>{
    b.onclick = async () => {
      const k = b.dataset.k;
      if(k==="del"){ buffer = buffer.slice(0,-1); updateDots(buffer); return; }
      if(k==="ok"){
        if(buffer.length!==4){ return; }
        if(fresh){
          STATE.draft.pin1 = buffer;
          renderPinSet(userId, false);
        } else {
          if(buffer !== STATE.draft.pin1){ alert("PIN mismatch"); renderPinSet(userId, true); return; }
          const res = await api("/api/pin/set", { method:"POST", body:{ user_id:userId, pin:buffer } });
          if(res.ok){ renderHome(); }
        }
        return;
      }
      if(buffer.length<4){ buffer += k; updateDots(buffer); }
    };
  });
}

function renderPinLogin(userId){
  renderSimple(`
    <div class="card center">
      <div class="badge">${t("pin_login_title")}</div>
      <div id="pinDots" style="font-size:30px; letter-spacing:8px; margin:12px 0;">____</div>
      <div class="kb">
        ${[1,2,3,4,5,6,7,8,9,"del",0,"ok"].map(x=>`<button data-k="${x}">${x==="del"?"⌫":(x==="ok"?"OK":x)}</button>`).join("")}
      </div>
      <div class="small" style="margin-top:8px;">${t("forgot")}</div>
    </div>
  `);
  const dots = byId("pinDots");
  function updateDots(val){ dots.textContent = (val+"____").slice(0,4).replace(/./g, c=> c==="_"?"_":"•"); }
  let buffer = "";
  document.querySelectorAll(".kb button").forEach(b=>{
    b.onclick = async () => {
      const k = b.dataset.k;
      if(k==="del"){ buffer = buffer.slice(0,-1); updateDots(buffer); return; }
      if(k==="ok"){
        if(buffer.length!==4) return;
        const res = await api("/api/pin/verify", { method:"POST", body:{ user_id:userId, pin:buffer } });
        if(res.ok){ renderHome(); } else { alert("Wrong PIN"); buffer=""; updateDots(buffer); }
        return;
      }
      if(buffer.length<4){ buffer += k; updateDots(buffer); }
    };
  });
}

async function loadCards(){
  const res = await api(`/api/cards/list?user_id=${STATE.user.user_id}`);
  STATE.cards = res.ok ? res.cards : [];
}

async function loadRates(){
  const res = await api("/api/exchange");
  if(res.ok){ STATE.rates = res.rates; }
}

async function loadHistory(){
  const res = await api(`/api/history/list?user_id=${STATE.user.user_id}`);
  STATE.history = res.ok ? res.items : [];
}

function renderHome(){
  Promise.all([loadCards(), loadRates(), loadHistory()]).then(()=>{
    const avatar = document.getElementById("avatar");
    const name = (STATE.user?.first_name || "") + " " + (STATE.user?.last_name || "");
    avatar.title = name.trim() || (STATE.user?.username ? "@"+STATE.user.username : "User");

    const cardsHtml = (STATE.cards.length? STATE.cards.map(c=>`
      <div class="row"><span class="label">${c.card_mask} — ${c.bank||""}</span><span class="value">${Number(c.balance).toLocaleString()} ${c.currency}</span></div>
    `).join("") : `<div class="small">No cards yet</div>`);

    const recents = STATE.history.slice(0,5).map(x=>`
      <div class="tx">
        <div><div class="title">${x.type.toUpperCase()}</div><div class="small">${new Date(x.created_at).toLocaleString()}</div></div>
        <div class="amount ${x.type==='send'?'neg':'pos'}">${x.type==='send'?'-':'+'}${Number(x.amount).toLocaleString()} ${x.currency}</div>
      </div>
    `).join("");

    const ratesHtml = STATE.rates ? `
      <div class="rate"><div>USD → UZS</div><div>${STATE.rates.USD_UZS.toFixed(2)}</div></div>
      <div class="rate"><div>USD → RUB</div><div>${STATE.rates.USD_RUB.toFixed(2)}</div></div>
      <div class="rate"><div>RUB → UZS</div><div>${STATE.rates.RUB_UZS.toFixed(2)}</div></div>
      <div class="rate"><div>RUB → USD</div><div>${STATE.rates.RUB_USD.toFixed(4)}</div></div>
    ` : `<div class="small">No rates</div>`;

    renderSimple(`
      <div class="card">
        <div class="row"><div class="label">${t("home_cards")}</div><button class="badge" id="addCard">${t("add_card")}</button></div>
        ${cardsHtml}
        <div class="grid cols2" style="margin-top:10px">
          <button class="secondary">${t("send")}</button>
          <button class="secondary" disabled>${t("receive")}</button>
          <button class="secondary" disabled>${t("topup")}</button>
          <button class="secondary" disabled>${t("scan")}</button>
        </div>
      </div>
      <div class="card">
        <div class="row"><div class="label">${t("recent")}</div><button class="badge" id="seeAll">${t("see_all")}</button></div>
        <div class="list">${recents || `<div class="small">—</div>`}</div>
      </div>
      <div class="card">
        <div class="row"><div class="label">${t("rates")}</div><div class="small">api.exchangerate.host</div></div>
        ${ratesHtml}
      </div>
      <div class="card"><div class="label">${t("promos")}</div><div class="small">—</div></div>
    `);

    document.getElementById("addCard").onclick = ()=> renderAddCard();
    document.getElementById("seeAll").onclick = ()=> { STATE.tab="history"; document.querySelector('.tabs button[data-tab="history"]').click(); };
  });
}

function renderAddCard(){
  renderSimple(`
    <div class="card">
      <div class="row"><div class="label">${t("add_card")}</div></div>
      <input id="cardNumber" placeholder="8600 1234 5678 9012" />
      <div style="height:8px"></div>
      <div class="grid cols2">
        <input id="cardHolder" placeholder="CARDHOLDER" />
        <input id="expiry" placeholder="MM/YY" />
      </div>
      <div style="height:10px"></div>
      <button class="btn" id="saveCard">${t("continue")}</button>
    </div>
  `);
  byId("saveCard").onclick = async ()=>{
    const body = {
      user_id: STATE.user.user_id,
      number: byId("cardNumber").value,
      holder: byId("cardHolder").value,
      expiry: byId("expiry").value
    };
    const res = await api("/api/cards/add", { method:"POST", body });
    if(res.ok){ alert("Card added"); renderHome(); }
    else alert("Card error");
  };
}

function renderTransfer(){
  Promise.all([loadCards()]).then(()=>{
    const options = STATE.cards.map(c=>`<option value="${c.id}">${c.card_mask} (${Number(c.balance).toLocaleString()} ${c.currency})</option>`).join("");
    renderSimple(`
      <div class="card">
        <div class="badge">${t("transfers_title")}</div>
        <label class="small">${t("from")}</label>
        <select id="fromCard">${options}</select>
        <div style="height:8px"></div>
        <label class="small">${t("to")}</label>
        <input id="toCard" placeholder="8600 0000 0000 0000" />
        <div style="height:8px"></div>
        <label class="small">${t("amount")}</label>
        <input id="amt" placeholder="100000" type="number" />
        <div style="height:10px"></div>
        <button class="btn" id="btnConf">${t("confirm")}</button>
      </div>
    `);
    byId("btnConf").onclick = async ()=>{
      const from_card_id = Number(byId("fromCard").value);
      const to_card = byId("toCard").value;
      const amount = Number(byId("amt").value);
      renderSimple(`<div class="card center">${t("processing")}</div>`);
      const res = await api("/api/transfer/create", { method:"POST", body:{ user_id: STATE.user.user_id, from_card_id, to_card, amount } });
      if(res.ok){
        const txid = res.txid;
        const st = await api(`/api/transfer/status?user_id=${STATE.user.user_id}&txid=${txid}`);
        renderSimple(`
          <div class="card center">
            <h2>${t("status_ok")}</h2>
            <div class="row"><span class="label">${t("amount")}</span><span class="value">${amount.toLocaleString()} UZS</span></div>
            <div class="row"><span class="label">${t("fee")}</span><span class="value">0.5%</span></div>
            <div class="row"><span class="label">${t("txid")}</span><span class="value">${txid}</span></div>
            <div style="height:10px"></div>
            <button class="btn" id="btnOk">OK</button>
          </div>
        `);
        byId("btnOk").onclick = ()=>{ STATE.tab="home"; document.querySelector('.tabs button[data-tab="home"]').click(); };
      } else {
        alert(res.error || "Transfer error");
        renderTransfer();
      }
    };
  });
}

function renderHistory(){
  loadHistory().then(()=>{
    const items = STATE.history.map(x=>`
      <div class="tx">
        <div>
          <div class="title">${x.type.toUpperCase()}</div>
          <div class="small">${new Date(x.created_at).toLocaleString()}</div>
        </div>
        <div class="amount ${x.type==='send'?'neg':'pos'}">${x.type==='send'?'-':'+'}${Number(x.amount).toLocaleString()} ${x.currency}</div>
      </div>
    `).join("");
    renderSimple(`<div class="card"><div class="badge">${t("history_title")}</div><div class="list">${items || "<div class='small'>—</div>"}</div></div>`);
  });
}

function renderProfile(){
  renderSimple(`
    <div class="card">
      <div class="badge">${t("profile_title")}</div>
      <div class="row"><span class="label">ID</span><span class="value">${STATE.user?.user_id||"-"}</span></div>
      <div class="row"><span class="label">${t("language")}</span><span class="value">${STATE.lang.toUpperCase()}</span></div>
      <div class="row"><span class="label">${t("theme")}</span><span class="value">${t("light")}</span></div>
      <div style="height:10px"></div>
      <button class="btn" id="btnLogout">${t("logout")}</button>
    </div>
  `);
  byId("btnLogout").onclick = ()=>{
    // Simple: force PIN login again
    renderPinLogin(STATE.user.user_id);
  };
}

function init(){
  ready();
  setGreeting();
  loadUser();
}

init();
