const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

function initApp() {
  const user = tg.initDataUnsafe.user?.first_name || "гость";
  document.getElementById("user").innerText = `Привет, ${user}!`;

  document.getElementById("loader").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
}

window.addEventListener("load", () => {
  setTimeout(initApp, 5); // здесь можешь заменить на fetch/инициализацию
});
