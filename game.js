// 小學成語大冒險 — 遊戲邏輯

// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const CONFIG = {
  LEVELS: 10,
  WINS_TO_UNLOCK: 3,
  MAX_WRONG_PER_BATTLE: 3,
  PLAYER_HP: 3,
  CRIT_CHANCE: 0.25,
  BOSS_HP_BASE: 120,
  ATK_BASE: 20,
  CRIT_MULTIPLIER: 1.5,
  HP_SCALE: 1.25,
  ATK_SCALE: 1.25,
};

const BOSS_DATA = [
  null, // index 0 unused
  { name: "青蛙魔",   emoji: "🐸", halo: "🫧🫧", weapon: "💧💧", title: "見習劍士"  },
  { name: "狡猾狐",   emoji: "🦊", halo: "🍃🍃", weapon: "🗡️🗡️", title: "銅牌勇者"  },
  { name: "蠍子將軍", emoji: "🦂", halo: "⚡⚡", weapon: "🪤🪤", title: "鐵甲騎士"  },
  { name: "冰狼王",   emoji: "🐺", halo: "❄️❄️", weapon: "🌨️🌨️", title: "詞彙戰士"  },
  { name: "黑鷹將",   emoji: "🦅", halo: "🌪️🌪️", weapon: "💨💨", title: "魔法學徒"  },
  { name: "深海鯊",   emoji: "🦈", halo: "🌊🌊", weapon: "🐚🐚", title: "語言法師"  },
  { name: "獅王",     emoji: "🦁", halo: "🔥🔥", weapon: "⚡⚡", title: "風暴騎士"  },
  { name: "暗翼蝙蝠", emoji: "🦇", halo: "🌙🌙", weapon: "💜💜", title: "聖光守護"  },
  { name: "古龍",     emoji: "🐉", halo: "✨✨", weapon: "🔥🔥", title: "傳說英雄"  },
  { name: "星際魔將", emoji: "👾", halo: "🌌🌌", weapon: "⚡⚡", title: "星空征服者" },
  { name: "究極魔獸", emoji: "🔥🔥", halo: "💥💥", weapon: "☄️☄️", title: "究極成語王" },
];

const TREASURE_DATA = [
  null,
  ["🪙","💍","🗡️","🏹","🧪","🔮","💎","🪬"],
  ["🛡️","⚔️","🪄","🧿","📿","🌟","🏆","🎖️"],
  ["🦴","🔱","🪅","🧸","🎭","🗺️","🔭","🪆"],
  ["🪸","🧲","⚗️","🪡","🎪","🌀","💠","🔑"],
  ["🎋","🌿","🍄","🌙","⭐","🌊","🔥","💫"],
  ["❄️","🌪️","⚡","🌈","🌸","🍁","🌋","🌌"],
  ["🦷","🪝","🔒","🗝️","🧱","⛓️","🪤","🔓"],
  ["🎯","🎲","🃏","🎰","🎳","🎮","🕹️","🎴"],
  ["🏰","🗼","🛸","🚀","🌍","🌏","🌎","🪐"],
  ["🎓","🏅","🥇","🏵️","🎗️","🎀","🧧","🎁"],
];

const TREASURE_NAMES = [
  null,
  ["金幣","寶石戒","劍","弓箭","藥水","水晶球","鑽石","護身符"],
  ["盾牌","寶劍","魔杖","護眼石","念珠","星光","獎杯","勳章"],
  ["骨頭","三叉戟","面具","玩偶","面具","地圖","望遠鏡","娃娃"],
  ["珊瑚","磁鐵","煉金瓶","線軸","魔術帳篷","漩渦","菱形","鑰匙"],
  ["竹子","嫩葉","蘑菇","月亮","星星","海浪","火焰","光芒"],
  ["冰晶","龍捲風","閃電","彩虹","櫻花","楓葉","火山","星雲"],
  ["牙齒","鉤子","鎖","舊鑰匙","磚牆","鎖鏈","陷阱","鎖頭"],
  ["靶心","骰子","撲克","吃角子","保齡球","遊戲機","搖桿","花牌"],
  ["城堡","鐵塔","飛碟","火箭","地球A","地球B","地球C","行星"],
  ["學士帽","獎牌","金牌","花環","絲帶","蝴蝶結","紅繩","禮盒"],
];

const SAVE_VERSION = 2;

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
let state = null;
let battleState = null;

function defaultState() {
  const levelProgress = {};
  for (let i = 1; i <= CONFIG.LEVELS; i++) {
    levelProgress[String(i)] = { winCount: 0, treasures: [], unlocked: i === 1 };
  }
  levelProgress["boss"] = { winCount: 0, treasures: [], unlocked: false };
  return {
    saveVersion: SAVE_VERSION,
    levelProgress,
    savedQuestions: {},
    titlesEarned: [],
    displayTitle: "",
    totalCorrect: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem("idiom_game_save");
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (parsed.saveVersion !== SAVE_VERSION) return defaultState();
    return parsed;
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem("idiom_game_save", JSON.stringify(state));
}

// ══════════════════════════════════════════
// GAME MATH
// ══════════════════════════════════════════
function bossMaxHP(level) {
  // level: 1-10, boss = 11
  const n = level;
  return Math.round(CONFIG.BOSS_HP_BASE * Math.pow(CONFIG.HP_SCALE, n - 1));
}

function playerAtk(level) {
  const n = level;
  return Math.round(CONFIG.ATK_BASE * Math.pow(CONFIG.ATK_SCALE, n - 1));
}

function isCrit() {
  return Math.random() < CONFIG.CRIT_CHANCE;
}

// ══════════════════════════════════════════
// QUESTION GENERATION
// ══════════════════════════════════════════
function generateQuestions(levelKey) {
  const isBoS = levelKey === "boss";
  const level = isBoS ? 10 : parseInt(levelKey);

  // Pool of words for this level
  const levelWords = WORDS.filter(w => w.level === level);
  const otherWords = WORDS.filter(w => w.level !== level);

  const shuffled = shuffle([...levelWords]);
  const selected = shuffled.slice(0, Math.min(30, shuffled.length));

  return selected.map(w => {
    const sentence = w.sentence.replace(w.word, "＿＿＿＿");
    const wrongOpts = shuffle([...otherWords]).slice(0, 3);
    const options = shuffle([
      { word: w.word, meaning: w.meaning, correct: true },
      ...wrongOpts.map(x => ({ word: x.word, meaning: x.meaning, correct: false })),
    ]);
    return { sentence, options, answer: w.word };
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ══════════════════════════════════════════
// SCREEN NAVIGATION
// ══════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function showHome() {
  renderHome();
  showScreen("screen-home");
}

function showTreasury() {
  renderTreasury();
  showScreen("screen-treasury");
}

// ══════════════════════════════════════════
// TITLE CHEAT (7 clicks)
// ══════════════════════════════════════════
let _cheatCount = 0;
let _cheatTimer = null;

function onTitleClick() {
  _cheatCount++;
  clearTimeout(_cheatTimer);
  _cheatTimer = setTimeout(() => { _cheatCount = 0; }, 1500);
  if (_cheatCount >= 7) {
    _cheatCount = 0;
    activateLevelCheat();
  }
}

function activateLevelCheat() {
  // Find highest currently unlocked level number (1-10)
  let maxUnlocked = 0;
  for (let i = 1; i <= CONFIG.LEVELS; i++) {
    if (state.levelProgress[String(i)].unlocked) maxUnlocked = i;
  }
  if (maxUnlocked === 0) maxUnlocked = 1;

  const key = String(maxUnlocked);
  const prog = state.levelProgress[key];

  // Give all 8 treasures
  prog.treasures = [0,1,2,3,4,5,6,7];

  // Set winCount to unlock threshold (unlocks next level)
  if (prog.winCount < CONFIG.WINS_TO_UNLOCK) {
    prog.winCount = CONFIG.WINS_TO_UNLOCK;
  }

  // Unlock next level
  if (maxUnlocked < CONFIG.LEVELS) {
    state.levelProgress[String(maxUnlocked + 1)].unlocked = true;
  }

  // Check boss unlock
  const allDone = Array.from({length: CONFIG.LEVELS}, (_, i) => String(i+1))
    .every(k => state.levelProgress[k].winCount >= CONFIG.WINS_TO_UNLOCK);
  if (allDone) state.levelProgress["boss"].unlocked = true;

  saveState();
  spawnParticles();
  renderHome();
}

// ══════════════════════════════════════════
// HOME SCREEN RENDER
// ══════════════════════════════════════════
function renderHome() {
  const titleEl = document.getElementById("player-title-display");
  titleEl.textContent = state.displayTitle ? `🎖️ ${state.displayTitle}` : "🗡️ 無名劍士";
  titleEl.onclick = onTitleClick;

  const grid = document.getElementById("level-grid");
  grid.innerHTML = "";

  for (let i = 1; i <= CONFIG.LEVELS; i++) {
    const key = String(i);
    const prog = state.levelProgress[key];
    const boss = BOSS_DATA[i];
    const treasures = TREASURE_DATA[i];
    const names = TREASURE_NAMES[i];

    const card = document.createElement("div");
    card.className = "level-card" + (prog.unlocked ? "" : " locked");
    if (i === CONFIG.LEVELS) card.classList.add("boss-card-hint");

    const wins = Math.min(prog.winCount, CONFIG.WINS_TO_UNLOCK);
    const pct = (wins / CONFIG.WINS_TO_UNLOCK) * 100;

    // Treasure slots
    let slotsHTML = "";
    for (let t = 0; t < 8; t++) {
      if (prog.treasures.includes(t)) {
        slotsHTML += `<div class="treasure-slot">${treasures[t]}</div>`;
      } else {
        slotsHTML += `<div class="treasure-slot empty">❓</div>`;
      }
    }

    card.innerHTML = `
      <div class="level-card-top">
        <div class="level-boss-emoji">${prog.unlocked ? boss.emoji : "🔒"}</div>
        <div class="level-info">
          <div class="level-name">LV${i} ${prog.unlocked ? boss.name : "????"}</div>
          <div class="level-sub">${prog.unlocked ? "" : "尚未解鎖"}</div>
          <div class="level-wins">${prog.unlocked ? `勝場：${prog.winCount} / ${CONFIG.WINS_TO_UNLOCK}` : ""}</div>
        </div>
      </div>
      ${prog.unlocked ? `<div class="level-treasures">${slotsHTML}</div>` : ""}
      ${prog.unlocked ? `<div class="level-progress-bar"><div class="level-progress-fill" style="width:${pct}%"></div></div>` : ""}
    `;

    if (prog.unlocked) {
      card.addEventListener("click", () => startBattle(key));
    }
    grid.appendChild(card);
  }

  // Boss level card
  const bossProg = state.levelProgress["boss"];
  const bossCard = document.createElement("div");
  if (bossProg.unlocked) {
    bossCard.className = "level-card boss-card";
    const bossBoss = BOSS_DATA[11];
    bossCard.innerHTML = `
      <div class="level-card-top">
        <div class="level-boss-emoji" style="font-size:32px">${bossBoss.emoji}</div>
        <div class="level-info">
          <div class="level-name" style="color:var(--accent)">⚠ 大魔王終關 ⚠</div>
          <div class="level-wins" style="color:var(--accent)">勝場：${bossProg.winCount}</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--text-dim);margin-top:4px">打倒究極魔獸，獲得王冠！</div>
    `;
    bossCard.addEventListener("click", () => startBattle("boss"));
  } else {
    bossCard.className = "boss-card-locked";
    bossCard.innerHTML = `🔒 大魔王終關<br><span style="font-size:12px">10 個等級各贏 3 場後解鎖</span>`;
  }
  grid.appendChild(bossCard);
}

// ══════════════════════════════════════════
// BATTLE
// ══════════════════════════════════════════
function startBattle(levelKey) {
  const isBoS = levelKey === "boss";
  const levelNum = isBoS ? 11 : parseInt(levelKey);
  const bossInfo = BOSS_DATA[levelNum];
  const prog = state.levelProgress[levelKey];

  // Generate or load questions
  let questions;
  if (state.savedQuestions[levelKey] && state.savedQuestions[levelKey].length > 0) {
    questions = state.savedQuestions[levelKey];
  } else {
    questions = generateQuestions(levelKey);
  }

  const maxHP = bossMaxHP(levelNum);

  battleState = {
    levelKey,
    levelNum,
    bossInfo,
    questions,
    questionIndex: 0,
    bossHP: maxHP,
    bossMaxHP: maxHP,
    playerHP: CONFIG.PLAYER_HP,
    wrongCount: 0,
    correctCount: 0,
    selectedOption: null,
  };

  // Render battle UI
  document.getElementById("boss-badge").style.display = isBoS ? "inline-block" : "none";

  renderBossSprite();
  renderPlayerSprite();
  updateBattleHP();
  loadNextQuestion();

  const wins = state.levelProgress[levelKey].winCount;
  document.getElementById("counter-wins").textContent = `累計勝場：${wins}`;
  document.getElementById("counter-correct").textContent = `本場答對：0`;

  showScreen("screen-battle");
}

function renderBossSprite() {
  const { bossInfo } = battleState;
  const spriteEl = document.getElementById("boss-sprite");
  const isBoS = battleState.levelKey === "boss";
  spriteEl.innerHTML = `
    <div class="boss-halo">${bossInfo.halo}</div>
    <span class="boss-main ${isBoS ? "final-boss-glow" : ""}">${bossInfo.emoji}</span>
    <div class="boss-weapon">${bossInfo.weapon}</div>
  `;
  document.getElementById("boss-name").textContent = `${bossInfo.emoji} ${bossInfo.name}`;
}

function renderPlayerSprite() {
  const level = battleState.levelNum;
  let sprite, stageName, stageClass;
  if (level <= 4) {
    sprite = "⚔️"; stageName = "小劍士"; stageClass = "";
  } else if (level <= 8) {
    sprite = "🛡️"; stageName = "騎士"; stageClass = "player-stage-2";
  } else {
    sprite = "✨⚔️"; stageName = "魔法劍士"; stageClass = "player-stage-3";
  }
  document.getElementById("player-sprite").innerHTML = `<span class="${stageClass}">${sprite}</span>`;
  document.getElementById("player-name").textContent = stageName;
}

function updateBattleHP() {
  const { bossHP, bossMaxHP, playerHP } = battleState;

  // Boss HP bar
  const pct = Math.max(0, (bossHP / bossMaxHP) * 100);
  document.getElementById("boss-hp-fill").style.width = pct + "%";
  document.getElementById("boss-hp-text").textContent = `${Math.max(0,bossHP)} / ${bossMaxHP}`;

  // Player hearts
  let hearts = "";
  for (let i = 0; i < CONFIG.PLAYER_HP; i++) {
    hearts += i < playerHP ? "❤️" : "🖤";
  }
  document.getElementById("player-hp").innerHTML = hearts;
}

function loadNextQuestion() {
  const { questions, questionIndex } = battleState;
  if (questionIndex >= questions.length) {
    // Ran out of questions — regenerate
    const newQs = generateQuestions(battleState.levelKey);
    battleState.questions = newQs;
    battleState.questionIndex = 0;
  }

  const q = battleState.questions[battleState.questionIndex];
  battleState.selectedOption = null;

  // Render prompt
  document.getElementById("question-prompt").innerHTML =
    `請填入正確的成語：<br><span style="font-size:18px;line-height:2">${q.sentence.replace("＿＿＿＿", '<span class="blank">＿＿＿＿</span>')}</span>`;

  // Render options
  const grid = document.getElementById("options-grid");
  grid.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.index = idx;
    btn.innerHTML = `<span class="option-word">${opt.word}</span>`;
    btn.addEventListener("click", () => selectOption(btn, idx, opt.meaning));
    grid.appendChild(btn);
  });

  // 清空說明欄
  const box = document.getElementById("option-meaning-box");
  box.textContent = "點選成語查看解釋";
  box.className = "option-meaning-box empty";

  document.getElementById("confirm-btn").style.display = "none";
}

function selectOption(btn, idx, meaning) {
  document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  battleState.selectedOption = idx;

  // 更新共用說明欄
  const box = document.getElementById("option-meaning-box");
  box.textContent = meaning;
  box.className = "option-meaning-box";

  document.getElementById("confirm-btn").style.display = "inline-block";
}

function confirmAnswer() {
  if (battleState.selectedOption === null) return;

  const q = battleState.questions[battleState.questionIndex];
  const chosen = q.options[battleState.selectedOption];

  // Disable all buttons
  document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
  document.getElementById("confirm-btn").style.display = "none";

  if (chosen.correct) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
}

function handleCorrectAnswer() {
  const crit = isCrit();
  const baseAtk = playerAtk(battleState.levelNum);
  const dmg = crit ? Math.round(baseAtk * CONFIG.CRIT_MULTIPLIER) : baseAtk;

  battleState.bossHP -= dmg;
  battleState.correctCount++;
  battleState.questionIndex++;
  state.totalCorrect++;

  // Slash effect
  const slash = document.getElementById("slash-effect");
  slash.textContent = crit ? "💥" : "⚔️";
  slash.classList.remove("slash-animate");
  void slash.offsetWidth;
  slash.classList.add("slash-animate");

  // Float damage
  showFloatDamage(dmg, crit);

  // Boss hit animation
  const spriteEl = document.getElementById("boss-sprite");
  spriteEl.classList.remove("boss-hit", "boss-hit-crit");
  void spriteEl.offsetWidth;
  spriteEl.classList.add(crit ? "boss-hit-crit" : "boss-hit");

  // Crit screen flash
  if (crit) {
    const flash = document.getElementById("crit-flash");
    flash.classList.remove("crit-flashing");
    void flash.offsetWidth;
    flash.classList.add("crit-flashing");
  }

  document.getElementById("counter-correct").textContent = `本場答對：${battleState.correctCount}`;

  updateBattleHP();

  setTimeout(() => {
    if (battleState.bossHP <= 0) {
      endBattle(true);
    } else {
      loadNextQuestion();
    }
  }, 500);
}

function handleWrongAnswer() {
  battleState.playerHP--;
  battleState.wrongCount++;
  battleState.questionIndex++;

  // Player hit animation
  const playerEl = document.getElementById("player-sprite");
  playerEl.classList.remove("player-hit");
  void playerEl.offsetWidth;
  playerEl.classList.add("player-hit");

  updateBattleHP();

  setTimeout(() => {
    if (battleState.playerHP <= 0) {
      endBattle(false);
    } else {
      loadNextQuestion();
    }
  }, 500);
}

function showFloatDamage(dmg, crit) {
  const stage = document.getElementById("battle-stage");
  const el = document.createElement("div");
  el.className = "float-damage " + (crit ? "crit" : "normal");
  el.textContent = crit ? `💥 暴擊! +${dmg}` : `+${dmg}`;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ══════════════════════════════════════════
// BATTLE END
// ══════════════════════════════════════════
function endBattle(won) {
  const { levelKey, levelNum, correctCount } = battleState;
  const prog = state.levelProgress[levelKey];
  const isBoS = levelKey === "boss";

  if (won) {
    prog.winCount++;
    delete state.savedQuestions[levelKey];

    // Treasure
    let newTreasure = null;
    if (!isBoS) {
      const nextTreasureIdx = prog.treasures.length;
      if (nextTreasureIdx < 8) {
        prog.treasures.push(nextTreasureIdx);
        newTreasure = TREASURE_DATA[levelNum][nextTreasureIdx];
      }
    } else {
      // Crown
      if (!prog.treasures.includes(0)) {
        prog.treasures.push(0);
        newTreasure = "👑";
      }
    }

    // Unlock next level
    let justUnlocked = null;
    if (!isBoS && prog.winCount >= CONFIG.WINS_TO_UNLOCK) {
      const nextKey = String(levelNum + 1);
      if (levelNum < CONFIG.LEVELS) {
        if (!state.levelProgress[nextKey].unlocked) {
          state.levelProgress[nextKey].unlocked = true;
          justUnlocked = nextKey;
        }
      }
      // Check boss unlock
      const allDone = Array.from({length: CONFIG.LEVELS}, (_, i) => String(i+1))
        .every(k => state.levelProgress[k].winCount >= CONFIG.WINS_TO_UNLOCK);
      if (allDone && !state.levelProgress["boss"].unlocked) {
        state.levelProgress["boss"].unlocked = true;
        justUnlocked = "boss";
      }
    }

    // Title
    const newTitle = isBoS ? "究極成語王" : BOSS_DATA[levelNum].title;
    if (!state.titlesEarned.includes(newTitle)) {
      state.titlesEarned.push(newTitle);
    }
    state.displayTitle = newTitle;

    saveState();
    showResultScreen(true, correctCount, newTreasure, justUnlocked, isBoS);

  } else {
    // Save questions for next time
    state.savedQuestions[levelKey] = battleState.questions;
    saveState();
    showResultScreen(false, correctCount, null, null, isBoS);
  }
}

function showResultScreen(won, correct, newTreasure, justUnlocked, isBoS) {
  document.getElementById("result-icon").textContent = won ? "🎉" : "💔";

  const titleEl = document.getElementById("result-title");
  titleEl.textContent = won ? "勝利！" : "失敗...";
  titleEl.className = "result-title " + (won ? "win" : "lose");

  document.getElementById("result-stats").innerHTML =
    `本場答對：${correct} 題<br>` +
    (won ? `累計勝場：${state.levelProgress[battleState.levelKey].winCount}` : "愛心歸零，繼續努力！");

  const treasureEl = document.getElementById("result-treasure");
  if (newTreasure) {
    treasureEl.textContent = `獲得寶物：${newTreasure}`;
  } else {
    treasureEl.textContent = "";
  }

  const btn = document.getElementById("result-continue-btn");
  if (won && justUnlocked) {
    btn.textContent = justUnlocked === "boss" ? "解鎖大魔王！" : `解鎖 LV${justUnlocked}！`;
  } else if (won && isBoS) {
    btn.textContent = "🏆 查看完成畫面";
  } else {
    btn.textContent = "繼續";
  }

  showScreen("screen-result");
}

function onResultContinue() {
  const { levelKey, levelNum } = battleState;
  const isBoS = levelKey === "boss";
  const prog = state.levelProgress[levelKey];
  const won = battleState.bossHP <= 0;

  if (!won) { showHome(); return; }

  // Check if all bosses done
  const bossWon = state.levelProgress["boss"].winCount > 0;
  if (bossWon && isBoS) {
    showGameComplete();
    return;
  }

  // Show levelup if a new level was just unlocked (check via titlesEarned last entry)
  const newTitle = isBoS ? "究極成語王" : BOSS_DATA[levelNum].title;
  const isNewTitle = state.titlesEarned[state.titlesEarned.length - 1] === newTitle
    && state.levelProgress[levelKey].winCount === CONFIG.WINS_TO_UNLOCK;

  if (!isBoS && prog.winCount === CONFIG.WINS_TO_UNLOCK && levelNum < CONFIG.LEVELS) {
    showLevelUp(levelNum);
    return;
  }

  showHome();
}

// ══════════════════════════════════════════
// LEVEL UP SCREEN
// ══════════════════════════════════════════
function showLevelUp(completedLevel) {
  const title = BOSS_DATA[completedLevel].title;
  document.getElementById("levelup-title-name").textContent = `🎖️ ${title}`;

  const nextLevel = completedLevel + 1;
  const nextBoss = BOSS_DATA[nextLevel];
  const preview = document.getElementById("next-boss-preview");
  if (nextBoss && nextLevel <= CONFIG.LEVELS) {
    preview.innerHTML = `下一關：<br><span class="next-boss-emoji">${nextBoss.emoji}</span>${nextBoss.name}`;
  } else if (nextLevel > CONFIG.LEVELS) {
    preview.innerHTML = `<span class="next-boss-emoji">🔥🔥</span>大魔王終關解鎖！`;
  } else {
    preview.innerHTML = "";
  }

  spawnParticles();
  showScreen("screen-levelup");
}

// ══════════════════════════════════════════
// GAME COMPLETE
// ══════════════════════════════════════════
function showGameComplete() {
  const list = document.getElementById("titles-list");
  list.innerHTML = state.titlesEarned
    .map(t => `<li>✅ <span>${t}</span></li>`)
    .join("");
  spawnParticles();
  showScreen("screen-gamecomplete");
}

// ══════════════════════════════════════════
// TREASURY
// ══════════════════════════════════════════
function renderTreasury() {
  let total = 0;
  let earned = 0;

  const container = document.getElementById("treasury-levels");
  container.innerHTML = "";

  for (let i = 1; i <= CONFIG.LEVELS; i++) {
    const key = String(i);
    const prog = state.levelProgress[key];
    const treasures = TREASURE_DATA[i];
    const names = TREASURE_NAMES[i];
    total += 8;
    earned += prog.treasures.length;

    const block = document.createElement("div");
    block.className = "treasury-level-block";

    const bossName = BOSS_DATA[i] ? BOSS_DATA[i].name : "";
    block.innerHTML = `<div class="treasury-level-title">LV${i} ${bossName}</div>`;

    const grid = document.createElement("div");
    grid.className = "treasury-grid";

    for (let t = 0; t < 8; t++) {
      const slot = document.createElement("div");
      if (prog.treasures.includes(t)) {
        slot.className = "treasury-slot";
        slot.innerHTML = `${treasures[t]}<div class="treasury-slot-name">${names[t]}</div>`;
      } else {
        slot.className = "treasury-slot empty";
        slot.textContent = "❓";
      }
      grid.appendChild(slot);
    }
    block.appendChild(grid);
    container.appendChild(block);
  }

  // Crown
  total += 1;
  const crownSlot = document.getElementById("crown-slot");
  const bossHasCrown = state.levelProgress["boss"].treasures.includes(0);
  if (bossHasCrown) {
    earned++;
    crownSlot.className = "crown-slot earned";
    crownSlot.innerHTML = `<span class="crown-emoji">👑</span><div style="font-size:11px;color:var(--gold);margin-top:4px">英語王冠</div>`;
  } else {
    crownSlot.className = "crown-slot";
    crownSlot.innerHTML = `<span style="font-size:18px;color:var(--text-dim)">🔒</span><div style="font-size:11px;color:var(--text-dim);margin-top:4px">打倒大魔王</div>`;
  }

  document.getElementById("treasury-count").textContent = `${earned} / ${total}`;
}

// ══════════════════════════════════════════
// PARTICLES
// ══════════════════════════════════════════
function spawnParticles() {
  const container = document.getElementById("particles-container");
  container.innerHTML = "";
  const emojis = ["⭐","✨","🌟","💫","🎊","🎉","🎈","🌈","💥","🔥","🌸","🎀","🏆","🎖️"];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 14; i++) {
    const el = document.createElement("div");
    el.className = "particle";
    el.textContent = emojis[i % emojis.length];
    const angle = (i / 14) * 2 * Math.PI;
    const dist = 120 + Math.random() * 100;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    el.style.left = cx + "px";
    el.style.top  = cy + "px";
    el.style.setProperty("--tx", tx + "px");
    el.style.setProperty("--ty", ty + "px");
    el.style.animationDelay = (Math.random() * 0.3) + "s";
    container.appendChild(el);
  }
  setTimeout(() => { container.innerHTML = ""; }, 1800);
}

// ══════════════════════════════════════════
// CONFIRM / RESET
// ══════════════════════════════════════════
function confirmBackHome() {
  if (confirm("確定要離開戰鬥？（進度不保留）")) {
    showHome();
  }
}

function confirmReset() {
  if (confirm("確定要重置所有進度？")) {
    localStorage.removeItem("idiom_game_save");
    state = defaultState();
    showHome();
  }
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  state = loadState();
  showHome();
});
