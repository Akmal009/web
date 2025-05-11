const tg = window.Telegram.WebApp;
tg.ready();

const userAvatarEl = document.getElementById("user-avatar");
const balanceEl = document.getElementById("balance-value");

// Используем данные Telegram
const tgUser = tg.initDataUnsafe?.user || {};
const user = {
  id: tgUser.id,
  nickname: tgUser.username || tgUser.first_name || "Пользователь",
  balance: 0,
  avatar: tgUser.photo_url || ""
};

if (user.avatar) {
  userAvatarEl.src = user.avatar;
  userAvatarEl.style.display = "block";
}

updateBalanceDisplay();

function updateBalanceDisplay() {
  balanceEl.textContent = user.balance;
}

function openTangaInfo() {
  tg.openTelegramLink("https://t.me/akmalminiappbot");
}

function showScreen(screen) {
  document.getElementById("main-screen").style.display = screen === "main" ? "block" : "none";
  document.getElementById("mining-screen").style.display = screen === "mining" ? "block" : "none";
  document.getElementById("tasks-screen").style.display = screen === "tasks" ? "block" : "none";
  document.getElementById("profile-screen").style.display = screen === "profile" ? "block" : "none";

  document.getElementById("nav-home").classList.toggle("active", screen === "main");
  document.getElementById("nav-mining").classList.toggle("active", screen === "mining");
  document.getElementById("nav-tasks").classList.toggle("active", screen === "tasks");
  document.getElementById("nav-profile").classList.toggle("active", screen === "profile");
}

function navigateTo(section) {
  showScreen(section);
}
