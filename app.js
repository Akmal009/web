const tg = window.Telegram.WebApp;
tg.ready();

const userIdEl = document.getElementById("user-id");
const userAvatarEl = document.getElementById("user-avatar");
const balanceEl = document.getElementById("balance-value");

// Проверка регистрации пользователя
let user = JSON.parse(localStorage.getItem("tanga_user"));

if (!user) {
  const nickname = prompt("Введите ваш никнейм:", tg.initDataUnsafe?.user?.first_name || "");
  if (!nickname) {
    alert("Никнейм обязателен!");
    throw new Error("Регистрация отменена");
  }
  user = {
    id: generateUserId(),
    nickname,
    balance: 0,
    avatar: tg.initDataUnsafe?.user?.photo_url || ""
  };
  localStorage.setItem("tanga_user", JSON.stringify(user));
}

userIdEl.textContent = `ID: ${shortenId(user.id)}`;
if (user.avatar) {
  userAvatarEl.src = user.avatar;
  userAvatarEl.style.display = "block";
}
updateBalanceDisplay();

function generateUserId() {
  return crypto.randomUUID();
}

function shortenId(id) {
  return id.slice(0, 3) + "..." + id.slice(-5);
}

function updateBalanceDisplay() {
  balanceEl.textContent = user.balance;
}

function sendAction(action) {
  tg.sendData(JSON.stringify({ action }));
}

function openTangaInfo() {
  tg.openTelegramLink("https://t.me/Akmalmineroadieltsbrooooo");
}

function showScreen(screen) {
  document.getElementById("main-screen").style.display = screen === "main" ? "block" : "none";
  document.getElementById("mining-screen").style.display = screen === "mining" ? "block" : "none";
  document.getElementById("tasks-screen").style.display = screen === "tasks" ? "block" : "none";

  document.getElementById("nav-home").classList.toggle("active", screen === "main");
  document.getElementById("nav-mining").classList.toggle("active", screen === "mining");
  document.getElementById("nav-tasks").classList.toggle("active", screen === "tasks");
}

function navigateTo(section) {
  showScreen(section);
}
