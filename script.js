const tg = window.Telegram.WebApp;
tg.expand();

document.getElementById("user").innerText =
  `Привет, ${tg.initDataUnsafe.user?.first_name || "гость"}!`;