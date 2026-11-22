// Tes Kecepatan Ngetik — logika tes, skor WPM standar (karakter benar / 5 / menit).

const SENTENCES = [
  "Pagi ini saya berangkat ke kantor naik kereta pukul 06.30 dan sampai tepat waktu.",
  "Harga cabai di pasar naik lagi, kata ibu-ibu yang sedang antre di tukang sayur.",
  "Kucing oren itu tidur di atas keyboard sampai laptop saya penuh bulu semua.",
  "Kami memesan 25 porsi nasi goreng dan 10 es teh untuk rapat sore nanti.",
  "Belajar hal baru itu susah di awal, tapi lama-lama jadi kebiasaan yang menyenangkan.",
  "Anak-anak bermain layangan di lapangan sampai matahari hampir tenggelam.",
  "Jangan lupa minum air putih minimal 8 gelas sehari, kata dokter di puskesmas.",
  "Film itu durasinya 2 jam 15 menit, tapi ceritanya bagus jadi tidak terasa lama.",
  "Dia menabung sedikit demi sedikit, dan dalam 3 tahun terkumpul untuk uang muka rumah.",
  "Hujan deras turun sejak jam 4 sore, membuat jalanan depan rumah tergenang air.",
  "Resep rendang ini butuh 12 macam bumbu dan waktu memasak hampir 4 jam.",
  "Setiap hari Jumat, kantor kami pulang lebih awal, yaitu pukul 16.00 tepat.",
  "Buku itu tebalnya 480 halaman, tapi saya habiskan dalam waktu seminggu saja.",
  "Kakak membeli sepeda baru seharga 3,5 juta rupiah untuk berangkat kerja.",
  "Kalau mau hasil yang beda, cara kerjanya juga harus beda dari biasanya.",
  "Tim kami menang 3-1 setelah berjuang keras selama 90 menit pertandingan.",
];

const typeTextEl = document.getElementById("type-text");
const inputEl = document.getElementById("type-input");
const wrapEl = document.getElementById("type-wrap");
const hintEl = document.getElementById("type-hint");
const wpmEl = document.getElementById("stat-wpm");
const accEl = document.getElementById("stat-acc");
const timeEl = document.getElementById("stat-time");
const resultEl = document.getElementById("result");

let duration = 30;          // detik, dari pilihan mode
let target = "";            // teks yang harus diketik
let charSpans = [];         // span per karakter
let started = false;
let finished = false;
let startTime = 0;
let timerId = null;
let lastTypedLength = 0;

function shuffledSentences() {
  const pool = [...SENTENCES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

// Susun teks target dari beberapa kalimat acak supaya tidak habis di tengah tes.
function buildTarget() {
  let text = "";
  while (text.length < 420) {
    text += (text ? " " : "") + shuffledSentences().join(" ");
  }
  return text;
}

function renderTarget() {
  typeTextEl.innerHTML = "";
  charSpans = [];
  for (const ch of target) {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch;
    typeTextEl.appendChild(span);
    charSpans.push(span);
  }
}

function paintChars() {
  const typed = inputEl.value;
  for (let i = 0; i < charSpans.length; i++) {
    const span = charSpans[i];
    let cls = "char";
    if (i < typed.length) {
      cls += typed[i] === target[i] ? " correct" : " wrong";
    } else if (i === typed.length && !finished) {
      cls += " current";
    }
    if (span.className !== cls) span.className = cls;
  }
}

function countStats() {
  const typed = inputEl.value;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correct++;
  }
  return { typedCount: typed.length, correct, wrong: typed.length - correct };
}

function currentWpm(correct, elapsedMs) {
  if (elapsedMs < 1000 || correct === 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((correct / 5) / minutes);
}

function updateLiveStats() {
  const { typedCount, correct } = countStats();
  const acc = typedCount === 0 ? 100 : Math.round((correct / typedCount) * 100);
  accEl.textContent = acc + "%";
  if (started && !finished) {
    wpmEl.textContent = currentWpm(correct, performance.now() - startTime);
  }
}

function tick() {
  const elapsed = performance.now() - startTime;
  const left = Math.max(0, duration - elapsed / 1000);
  timeEl.textContent = Math.ceil(left);
  updateLiveStats();
  if (left <= 0) finish();
}

function startTimer() {
  started = true;
  startTime = performance.now();
  timerId = setInterval(tick, 100);
  hintEl.textContent = "Waktu jalan! Fokus ke teksnya, jangan lihat keyboard 👀";
}

function verdictFor(wpm) {
  if (wpm < 20) {
    return {
      label: "Mode Kura-Kura",
      text: "Kura-kura di taman aja nyalip kamu. Santai, yang penting udah mulai — latihan 5 menit sehari, seminggu lagi pasti naik kelas.",
    };
  }
  if (wpm < 40) {
    return {
      label: "Lumayan Ngacir",
      text: "Lumayan! Udah selevel ngetik chat ke gebetan pas lagi deg-degan. Dikit lagi tembus zona cepat.",
    };
  }
  if (wpm < 60) {
    return {
      label: "Jari Kilat",
      text: "Cepat! Jarimu udah kayak admin olshop pas lagi flash sale. Hormat dulu, suhu.",
    };
  }
  return {
    label: "Dewa Keyboard",
    text: "DEWA KEYBOARD. Ini sih bukan ngetik lagi, ini teleportasi pikiran ke layar. Ajarin kita-kita dong.",
  };
}

let lastResult = null;

function finish() {
  if (finished) return;
  finished = true;
  clearInterval(timerId);
  timeEl.textContent = "0";
  inputEl.disabled = true;
  wrapEl.classList.add("is-done");

  const { correct, wrong } = countStats();
  const typedCount = correct + wrong;
  const wpm = currentWpm(correct, duration * 1000);
  const acc = typedCount === 0 ? 0 : Math.round((correct / typedCount) * 100);
  const verdict = verdictFor(wpm);
  lastResult = { wpm, acc, correct, wrong, verdict, duration };

  wpmEl.textContent = wpm;
  document.getElementById("result-wpm-num").textContent = wpm;
  document.getElementById("result-acc").textContent = acc + "%";
  document.getElementById("result-correct").textContent = correct;
  document.getElementById("result-wrong").textContent = wrong;
  document.getElementById("result-mode").textContent = duration + " detik";
  document.getElementById("result-verdict").textContent = verdict.text;

  const shareText =
    `Aku baru tes kecepatan ngetik: ${wpm} WPM, akurasi ${acc}% (mode ${duration} detik). ` +
    `Kategoriku: ${verdict.label}. Berani lawan? Cobain Tes Kecepatan Ngetik by Remike Dev.`;
  document.getElementById("share-button").href =
    "https://wa.me/?text=" + encodeURIComponent(shareText);

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  paintChars();
}

function resetRound() {
  clearInterval(timerId);
  started = false;
  finished = false;
  lastTypedLength = 0;
  target = buildTarget();
  inputEl.value = "";
  inputEl.disabled = false;
  wrapEl.classList.remove("is-done");
  resultEl.hidden = true;
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  timeEl.textContent = duration;
  hintEl.textContent = "Klik kotak di atas, lalu mulai ngetik. Waktu jalan dari ketikan pertama. Tempel (paste) dimatikan biar jujur 😄";
  renderTarget();
  paintChars();
}

// Kalau teks hampir habis sebelum waktu selesai, sambung kalimat baru.
function maybeExtendTarget() {
  if (inputEl.value.length > target.length - 80) {
    const extra = " " + shuffledSentences().join(" ");
    const start = target.length;
    target += extra;
    for (let i = start; i < target.length; i++) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = target[i];
      typeTextEl.appendChild(span);
      charSpans.push(span);
    }
  }
}

inputEl.addEventListener("input", () => {
  if (finished) return;
  if (!started && inputEl.value.length > 0) startTimer();
  maybeExtendTarget();
  paintChars();
  updateLiveStats();
  lastTypedLength = inputEl.value.length;
});

// Paste dimatikan supaya skornya jujur.
inputEl.addEventListener("paste", (e) => e.preventDefault());

// Klik di area teks selalu mengembalikan fokus ke input.
wrapEl.addEventListener("click", () => {
  if (!finished) inputEl.focus();
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    duration = parseInt(btn.dataset.seconds, 10);
    resetRound();
    inputEl.focus();
  });
});

document.getElementById("reset-button").addEventListener("click", () => {
  resetRound();
  inputEl.focus();
});

document.getElementById("retry-button").addEventListener("click", () => {
  resetRound();
  inputEl.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Gambar kartu hasil 1080x1080 lalu unduh sebagai PNG.
document.getElementById("download-button").addEventListener("click", () => {
  if (!lastResult) return;
  const { wpm, acc, correct, wrong, verdict } = lastResult;
  const canvas = document.getElementById("card-canvas");
  const ctx = canvas.getContext("2d");
  const W = 1080;

  // Latar krem + bingkai tinta
  ctx.fillStyle = "#fff8ec";
  ctx.fillRect(0, 0, W, W);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 28, W - 56, W - 56);

  // Kartu kuning dengan bayangan keras
  ctx.fillStyle = "#111111";
  ctx.fillRect(110, 150, 860, 700);
  ctx.fillStyle = "#ffd23f";
  ctx.fillRect(88, 128, 860, 700);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 6;
  ctx.strokeRect(88, 128, 860, 700);

  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";

  ctx.font = "700 40px 'Space Mono', monospace";
  ctx.fillText("TES KECEPATAN NGETIK", W / 2, 235);

  ctx.font = "700 300px 'Space Grotesk', sans-serif";
  ctx.fillText(String(wpm), W / 2, 540);

  ctx.font = "700 54px 'Space Grotesk', sans-serif";
  ctx.fillText("WPM", W / 2, 615);

  ctx.font = "700 42px 'Space Mono', monospace";
  ctx.fillText(`Akurasi ${acc}% · Benar ${correct} · Salah ${wrong}`, W / 2, 715);

  ctx.font = "700 58px 'Space Grotesk', sans-serif";
  ctx.fillText(verdict.label.toUpperCase(), W / 2, 795);

  ctx.font = "600 44px 'Caveat', cursive";
  wrapText(ctx, verdict.text, W / 2, 905, 880, 52);

  ctx.font = "400 32px 'Space Mono', monospace";
  ctx.fillText("tes-kecepatan-ngetik · by Remike Dev", W / 2, 1015);

  const link = document.createElement("a");
  link.download = "tes-kecepatan-ngetik-hasil.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

resetRound();
