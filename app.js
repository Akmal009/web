window.Telegram.WebApp.ready();
const tg = Telegram.WebApp;

const user = tg.initDataUnsafe.user;

const userInfo = document.getElementById("user-info");
if (userInfo) {
  const shortId = `...${user.id.toString().slice(-6)}`;
  userInfo.innerHTML = `
    <img src="${user.photo_url}" alt="avatar" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 6px;">
    ${shortId}
  `;
}

function navigate(screenId, navItem) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  navItem.classList.add('active');
}

function openProfile() {
  navigate('profile-screen', document.querySelectorAll('.nav-item')[4]);
}

function openMining() {
  navigate('mining-screen', document.querySelectorAll('.nav-item')[2]);
}

function openTasks() {
  navigate('tasks-screen', document.querySelectorAll('.nav-item')[1]);
}

const CHANNEL_USERNAME = 'Akmalmineroadieltsbrooooo';
let taskCompleted = false;

function subscribeTask() {
  window.open(`https://t.me/${CHANNEL_USERNAME}`, '_blank');
}

async function checkSubscription() {
  if (taskCompleted) {
    document.getElementById('task-result').innerText = 'Вы уже выполнили задание!';
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot7215321735:AAFsrypbRH9o9WggpRE6oPIx11Nyv_yW4mI/getChatMember?chat_id=@${CHANNEL_USERNAME}&user_id=${user.id}`);
    const data = await res.json();

    if (data.ok && (data.result.status === 'member' || data.result.status === 'administrator' || data.result.status === 'creator')) {
      taskCompleted = true;
      document.getElementById('task-result').innerText = '+1000 баллов!';
      updateBalance(1000);
      document.getElementById('task-count').style.display = 'none';
    } else {
      document.getElementById('task-result').innerText = 'Вы не подписались на канал.';
    }
  } catch (e) {
    console.error(e);
    document.getElementById('task-result').innerText = 'Ошибка проверки.';
  }
}

function updateBalance(amount) {
  let current = parseInt(localStorage.getItem('balance') || '0');
  current += amount;
  localStorage.setItem('balance', current);
  document.getElementById('balance').innerText = current;
}

// при старте загрузить баланс
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem('balance') || '0';
  document.getElementById('balance').innerText = saved;
});

function mine() {
  updateBalance(1);
  spawnPlusOne();
}

function spawnPlusOne() {
  const miningArea = document.getElementById("mining-area");
  const plus = document.createElement("div");
  plus.className = "floating-plus";
  plus.innerText = "+1";

  const randomX = Math.random() * 60 - 30; // смещение по горизонтали
  plus.style.left = `calc(50% + ${randomX}px)`;

  miningArea.appendChild(plus);

  setTimeout(() => {
    plus.remove();
  }, 1000);
}

const leaderboard = Array.from({ length: 100 }, (_, i) => ({
  id: 1000 + i,
  name: `Пользователь ${i + 1}`,
  score: Math.floor(Math.random() * 10000),
}));

// добавить текущего пользователя
leaderboard.push({ id: user.id, name: user.username || 'Вы', score: parseInt(localStorage.getItem('balance') || '0') });

// отсортировать по убыванию баллов
leaderboard.sort((a, b) => b.score - a.score);

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  let userRank = "—";

  leaderboard.forEach((entry, index) => {
    if (index < 100) {
      const li = document.createElement("li");
      li.innerHTML = `<span>${index + 1}. ${entry.name}</span><span>${entry.score} баллов</span>`;
      list.appendChild(li);
    }
    if (entry.id === user.id) {
      userRank = index + 1;
    }
  });

  document.getElementById("user-rank").innerText = `Ваше место: ${userRank}`;
}

// вызываем отрисовку при переходе
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
  document.getElementById(id).style.display = "block";
  if (id === 'leaderboard-screen') {
    renderLeaderboard();
  }
}
