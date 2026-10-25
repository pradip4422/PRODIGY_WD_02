// ===== Get elements =====
const timeEl   = document.getElementById("time");
const msEl     = document.getElementById("ms");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const lapBtn   = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBtn = document.getElementById("clearBtn");
const lapBody  = document.getElementById("lapBody");
const emptyMsg = document.getElementById("emptyMsg");

// ===== State =====
let elapsedBefore = 0;   // time (ms) collected before the current run
let startTime = 0;       // timestamp when the current run began
let timerId = null;      // interval id (null = not running)
let lapCount = 0;        // number of laps recorded
let lastLapTotal = 0;    // total time at the previous lap

// ===== Helpers =====
const pad = (n, size = 2) => String(n).padStart(size, "0");

// Convert milliseconds to { main: "HH:MM:SS", ms: "mmm" }
function formatTime(total) {
  const hours   = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis  = Math.floor(total % 1000);
  return { main: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, ms: pad(millis, 3) };
}

// Elapsed time is calculated from real timestamps, so it stays accurate
// even if the browser slows down or the tab is in the background.
function getElapsed() {
  return timerId !== null ? elapsedBefore + (performance.now() - startTime) : elapsedBefore;
}

function updateDisplay() {
  const t = formatTime(getElapsed());
  timeEl.textContent = t.main;
  msEl.textContent = "." + t.ms;
}

// Enable/disable buttons depending on the current state
function updateButtons() {
  const running = timerId !== null;
  startBtn.disabled = running;
  pauseBtn.disabled = !running;
  lapBtn.disabled   = !running;
  resetBtn.disabled = !running && elapsedBefore === 0;
  clearBtn.disabled = lapCount === 0;
  startBtn.textContent = elapsedBefore > 0 ? "Resume" : "Start";
  emptyMsg.hidden = lapCount > 0;
}

// ===== Actions =====
function start() {
  if (timerId !== null) return;              // prevents duplicate timers
  startTime = performance.now();
  timerId = setInterval(updateDisplay, 10);
  updateButtons();
}

function pause() {
  if (timerId === null) return;
  elapsedBefore = getElapsed();              // save time so nothing is lost
  clearInterval(timerId);
  timerId = null;
  updateDisplay();
  updateButtons();
}

function lap() {
  if (timerId === null) return;
  const total = getElapsed();
  lapCount++;

  const row = document.createElement("tr");
  [String(lapCount), fmt(total - lastLapTotal), fmt(total)].forEach((text) => {
    const td = document.createElement("td");
    td.textContent = text;
    row.appendChild(td);
  });
  lapBody.prepend(row);                      // newest lap on top

  lastLapTotal = total;
  updateButtons();
}

// Full text such as "00:01:05.250"
function fmt(ms) {
  const t = formatTime(ms);
  return `${t.main}.${t.ms}`;
}

function clearLaps() {
  lapBody.innerHTML = "";
  lapCount = 0;
  lastLapTotal = getElapsed();               // next lap continues from now
  updateButtons();
}

function reset() {
  clearInterval(timerId);
  timerId = null;
  elapsedBefore = 0;
  lastLapTotal = 0;
  lapBody.innerHTML = "";
  lapCount = 0;
  updateDisplay();
  updateButtons();
}

// ===== Events =====
startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
lapBtn.addEventListener("click", lap);
resetBtn.addEventListener("click", reset);
clearBtn.addEventListener("click", clearLaps);

// Show the correct display and button states on page load
updateDisplay();
updateButtons();