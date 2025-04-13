/*****************
 * GLOBAL SETTINGS
 *****************/
let currentWheelDesign = "pastel";
let currentNeedleDesign = "knob";
let currentNeedleRotation = 0;
let highlightedIndex = null;

/*****************
 * SOUND SETUP
 *****************/
const tickSound = new Audio('tick.mp3');
tickSound.volume = 0.3;
let lastTickSegment = null;

/*****************
 * DRAG & INERTIA VARIABLES
 *****************/
let dragging = false;
let lastPointerAngle = 0;
let pointerVelocity = 0;
let lastPointerTime = 0;
let inertialAnimationFrame;
let lastInertialTime = null;

/*****************
 * DOM ELEMENTS
 *****************/
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const needle = document.getElementById('needle');
const spinButton = document.getElementById('spinButton');
const numPlayersInput = document.getElementById('numPlayers');
const plusButton = document.getElementById('plusButton');
const minusButton = document.getElementById('minusButton');
const openSettingsBtn = document.getElementById('openSettings');
const closeSettingsBtn = document.getElementById('closeSettings');
const settingsModal = document.getElementById('settingsModal');
const wheelContainer = document.querySelector('.wheel-container');

// Preview elements
const previewWheelPastel  = document.getElementById('previewWheelPastel');
const previewWheelClassic = document.getElementById('previewWheelClassic');
const previewWheelGalaxy  = document.getElementById('previewWheelGalaxy');
const previewWheelNature  = document.getElementById('previewWheelNature');
const previewWheelCandy   = document.getElementById('previewWheelCandy');
const previewWheelHolographic = document.getElementById('previewWheelHolographic');
const previewWheelJelly   = document.getElementById('previewWheelJelly');
const previewWheelMagnetic = document.getElementById('previewWheelMagnetic');
const previewWheelLayered = document.getElementById('previewWheelLayered');
const previewWheelNebula  = document.getElementById('previewWheelNebula');

const previewNeedleKnob    = document.getElementById('previewNeedleKnob');
const previewNeedleArrow   = document.getElementById('previewNeedleArrow');
const previewNeedleFeather = document.getElementById('previewNeedleFeather');
const previewNeedleLaser   = document.getElementById('previewNeedleLaser');
const previewNeedleTrident = document.getElementById('previewNeedleTrident');

/*****************
 * CANVAS SETUP
 *****************/
function setupCanvas() {
  canvas.style.width = "400px";
  canvas.style.height = "400px";
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 400 * dpr;
  canvas.height = 400 * dpr;
  ctx.scale(dpr, dpr);
}
setupCanvas();

/*****************
 * DRAWING THE WHEEL
 *****************/
function drawWheel(numPlayers, highlightIndex = null) {
  const centerX = 200, centerY = 200, radius = 190;
  const segAngle = (2 * Math.PI) / numPlayers;
  ctx.clearRect(0, 0, 400, 400);
  ctx.save();
  // Rotate so the first segment starts at the top
  ctx.translate(centerX, centerY);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-centerX, -centerY);
  for (let i = 0; i < numPlayers; i++) {
    const startAngle = i * segAngle;
    const endAngle = startAngle + segAngle;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    setSegmentFill(i, highlightIndex, centerX, centerY, radius);
    ctx.strokeStyle = "#e0e5ec";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawSegmentNumber(i, centerX, centerY, radius, startAngle, segAngle);
  }
  ctx.restore();
}

function setSegmentFill(i, highlightIndex, centerX, centerY, radius) {
  const highlight = (i === highlightIndex);
  if (currentWheelDesign === "pastel") {
    if (highlight) {
      ctx.fillStyle = "#ffd700";
    } else {
      const baseEven = { start: "#cfd8e3", end: "#e0e5ec" };
      const baseOdd = { start: "#dde3ec", end: "#e8eef3" };
      const base = (i % 2 === 0) ? baseEven : baseOdd;
      let grad = ctx.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, base.start);
      grad.addColorStop(1, base.end);
      ctx.fillStyle = grad;
    }
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 8;
  } else if (currentWheelDesign === "classic") {
    ctx.fillStyle = highlight ? "#ffd700" : (i % 2 === 0 ? "#d32f2f" : "#212121");
    ctx.shadowColor = "transparent";
  } else if (currentWheelDesign === "galaxy") {
    if (highlight) {
      ctx.fillStyle = "#ffe033";
    } else {
      let grad = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
      grad.addColorStop(0, i % 2 === 0 ? "#2f006d" : "#4b0082");
      grad.addColorStop(1, i % 2 === 0 ? "#1b003f" : "#2e004d");
      ctx.fillStyle = grad;
    }
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 6;
  } else if (currentWheelDesign === "nature") {
    ctx.fillStyle = highlight ? "#7fff00" : (i % 2 === 0 ? "#5f8c4f" : "#3e5a2f");
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 8;
  } else if (currentWheelDesign === "candy") {
    ctx.fillStyle = highlight ? "#ff69b4" : (i % 2 === 0 ? "#ffbff7" : "#8efff6");
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 5;
  } else if (currentWheelDesign === "holographic") {
    let grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, "#00d2ff");
    grad.addColorStop(0.5, "#3a7bd5");
    grad.addColorStop(1, "#b06ab3");
    ctx.fillStyle = highlight ? "#00ffff" : grad;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 10;
  } else if (currentWheelDesign === "jelly") {
    ctx.filter = "blur(1px)";
    let grad = ctx.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
    grad.addColorStop(0, "#ffd1dc");
    grad.addColorStop(1, highlight ? "#ff96c8" : "#ffe4e1");
    ctx.fillStyle = grad;
    ctx.filter = "none";
  } else if (currentWheelDesign === "magnetic") {
    ctx.fillStyle = highlight ? "#00ffff" : (i % 2 === 0 ? "#000428" : "#004e92");
    ctx.shadowColor = "rgba(0,255,255,0.4)";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 8;
  } else if (currentWheelDesign === "layered") {
    let grad = ctx.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
    grad.addColorStop(0, highlight ? "#ffec8b" : "#e0e5ec");
    grad.addColorStop(1, "#bbb");
    ctx.fillStyle = grad;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    ctx.shadowBlur = 12;
  } else if (currentWheelDesign === "nebula") {
    let grad = ctx.createLinearGradient(0, 0, 400, 0);
    grad.addColorStop(0, "rgba(255,255,255,0.2)");
    grad.addColorStop(0.33, "rgba(173,216,230,0.3)");
    grad.addColorStop(0.66, "rgba(221,160,221,0.3)");
    grad.addColorStop(1, "rgba(255,192,203,0.3)");
    ctx.fillStyle = highlight ? "#ffd700" : grad;
    ctx.shadowColor = "rgba(255,255,255,0.5)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 10;
  } else {
    ctx.fillStyle = highlight ? "#ffd700" : "#ccc";
  }
  ctx.fill();
  ctx.shadowColor = "transparent";
}

function drawSegmentNumber(i, centerX, centerY, radius, startAngle, segAngle) {
  const mid = startAngle + segAngle / 2;
  const textX = centerX + (radius * 0.65) * Math.cos(mid);
  const textY = centerY + (radius * 0.65) * Math.sin(mid);
  ctx.save();
  ctx.translate(textX, textY);
  ctx.rotate(mid + Math.PI / 2);
  let col = "#555";
  if (currentWheelDesign === "classic" || currentWheelDesign === "galaxy")
    col = "#fff";
  ctx.fillStyle = col;
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(i + 1, 0, 0);
  ctx.restore();
}

/*****************
 * SPIN ANIMATION (Spin Button)
 *****************/
function spinNeedle() {
  // Cancel any ongoing drag/inertial spin
  dragging = false;
  if (inertialAnimationFrame) {
    cancelAnimationFrame(inertialAnimationFrame);
    inertialAnimationFrame = null;
  }
  pointerVelocity = 0;
  lastTickSegment = null;
  const num = parseInt(numPlayersInput.value);
  drawWheel(num);
  const startRotation = currentNeedleRotation;
  const spins = 5;
  const extra = Math.floor(Math.random() * 360);
  const targetRotation = startRotation + spins * 360 + extra;
  const duration = 4000;
  let startTime = null;
  function animate(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easing = 1 - Math.pow(1 - t, 3);
    const currentRotation = startRotation + (targetRotation - startRotation) * easing;
    updateNeedleTransform(currentRotation);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      currentNeedleRotation = currentRotation % 360;
      determineWinner(currentNeedleRotation, num);
    }
  }
  requestAnimationFrame(animate);
}

function determineWinner(rot, num) {
  const segSize = 360 / num;
  const norm = ((rot % 360) + 360) % 360;
  highlightedIndex = Math.floor(norm / segSize);
  drawWheel(num, highlightedIndex);
}

/*****************
 * NEEDLE TRANSFORM & SOUND TICK
 *****************/
function updateNeedleTransform(rot) {
  if (currentNeedleDesign === "knob") {
    needle.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
  }
  else if (["arrow","feather","laser","dynamic","magnet","aurora","fluid","radar","cosmic","circuit"].includes(currentNeedleDesign)) {
    needle.style.transform = `translate(-50%, -100%) rotate(${rot}deg)`;
  }
  else if (currentNeedleDesign === "trident") {
    needle.style.transform = `translate(-50%, -95%) rotate(${rot}deg)`;
  }
  currentNeedleRotation = rot;
  checkTickSound();
}

function checkTickSound() {
  const num = parseInt(numPlayersInput.value);
  const segSize = 360 / num;
  let norm = ((currentNeedleRotation % 360) + 360) % 360;
  const currentSegment = Math.floor(norm / segSize);
  if (currentSegment !== lastTickSegment) {
    tickSound.currentTime = 0;
    tickSound.play();
    lastTickSegment = currentSegment;
  }
}

/*****************
 * NEEDLE DESIGN SETUP
 *****************/
function applyNeedleDesign() {
  needle.classList.remove("knob","arrow","feather","laser","trident","dynamic","magnet","aurora","fluid","radar","cosmic","circuit");
  needle.classList.add(currentNeedleDesign);
}

/*****************
 * SETTINGS MODAL & PREVIEW HANDLERS
 *****************/
openSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'block';
  updateWheelPreviews();
  updateSelectedPreviews();
});
closeSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
  drawWheel(parseInt(numPlayersInput.value));
});
window.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
    drawWheel(parseInt(numPlayersInput.value));
  }
});

// Wheel Design Preview Clicks
previewWheelPastel.addEventListener('click', () => { currentWheelDesign = "pastel"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelClassic.addEventListener('click', () => { currentWheelDesign = "classic"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelGalaxy.addEventListener('click', () => { currentWheelDesign = "galaxy"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelNature.addEventListener('click', () => { currentWheelDesign = "nature"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelCandy.addEventListener('click', () => { currentWheelDesign = "candy"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelHolographic.addEventListener('click', () => { currentWheelDesign = "holographic"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelJelly.addEventListener('click', () => { currentWheelDesign = "jelly"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelMagnetic.addEventListener('click', () => { currentWheelDesign = "magnetic"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelLayered.addEventListener('click', () => { currentWheelDesign = "layered"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelNebula.addEventListener('click', () => { currentWheelDesign = "nebula"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });

// Needle Design Preview Clicks
previewNeedleKnob.addEventListener('click', () => { currentNeedleDesign = "knob"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleArrow.addEventListener('click', () => { currentNeedleDesign = "arrow"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleFeather.addEventListener('click', () => { currentNeedleDesign = "feather"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleLaser.addEventListener('click', () => { currentNeedleDesign = "laser"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleTrident.addEventListener('click', () => { currentNeedleDesign = "trident"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });

function updateSelectedPreviews() {
  // Wheel Previews
  previewWheelPastel.classList.toggle("selected", currentWheelDesign === "pastel");
  previewWheelClassic.classList.toggle("selected", currentWheelDesign === "classic");
  previewWheelGalaxy.classList.toggle("selected", currentWheelDesign === "galaxy");
  previewWheelNature.classList.toggle("selected", currentWheelDesign === "nature");
  previewWheelCandy.classList.toggle("selected", currentWheelDesign === "candy");
  previewWheelHolographic.classList.toggle("selected", currentWheelDesign === "holographic");
  previewWheelJelly.classList.toggle("selected", currentWheelDesign === "jelly");
  previewWheelMagnetic.classList.toggle("selected", currentWheelDesign === "magnetic");
  previewWheelLayered.classList.toggle("selected", currentWheelDesign === "layered");
  previewWheelNebula.classList.toggle("selected", currentWheelDesign === "nebula");
  
  // Needle Previews
  previewNeedleKnob.classList.toggle("selected", currentNeedleDesign === "knob");
  previewNeedleArrow.classList.toggle("selected", currentNeedleDesign === "arrow");
  previewNeedleFeather.classList.toggle("selected", currentNeedleDesign === "feather");
  previewNeedleLaser.classList.toggle("selected", currentNeedleDesign === "laser");
  previewNeedleTrident.classList.toggle("selected", currentNeedleDesign === "trident");
}

function updateWheelPreviews() {
  drawWheelPreview(document.querySelector("#previewWheelPastel canvas"), "pastel");
  drawWheelPreview(document.querySelector("#previewWheelClassic canvas"), "classic");
  drawWheelPreview(document.querySelector("#previewWheelGalaxy canvas"), "galaxy");
  drawWheelPreview(document.querySelector("#previewWheelNature canvas"), "nature");
  drawWheelPreview(document.querySelector("#previewWheelCandy canvas"), "candy");
  drawWheelPreview(document.querySelector("#previewWheelHolographic canvas"), "holographic");
  drawWheelPreview(document.querySelector("#previewWheelJelly canvas"), "jelly");
  drawWheelPreview(document.querySelector("#previewWheelMagnetic canvas"), "magnetic");
  drawWheelPreview(document.querySelector("#previewWheelLayered canvas"), "layered");
  drawWheelPreview(document.querySelector("#previewWheelNebula canvas"), "nebula");
}

function drawWheelPreview(canvasElem, designType) {
  const ctxPrev = canvasElem.getContext("2d");
  ctxPrev.clearRect(0, 0, 100, 100);
  const centerX = 50, centerY = 50, radius = 48;
  const numSegments = 6;
  const segAngle = (2 * Math.PI) / numSegments;
  ctxPrev.save();
  ctxPrev.translate(centerX, centerY);
  ctxPrev.rotate(-Math.PI / 2);
  ctxPrev.translate(-centerX, -centerY);
  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * segAngle;
    const endAngle = startAngle + segAngle;
    ctxPrev.beginPath();
    ctxPrev.moveTo(centerX, centerY);
    ctxPrev.arc(centerX, centerY, radius, startAngle, endAngle);
    ctxPrev.closePath();
    
    let fillStyle = "#ccc";
    if (designType === "pastel") {
      const baseEven = { start: "#cfd8e3", end: "#e0e5ec" };
      const baseOdd  = { start: "#dde3ec", end: "#e8eef3" };
      const base = i % 2 === 0 ? baseEven : baseOdd;
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, base.start);
      grad.addColorStop(1, base.end);
      fillStyle = grad;
    } else if (designType === "classic") {
      fillStyle = i % 2 === 0 ? "#d32f2f" : "#212121";
    } else if (designType === "galaxy") {
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
      grad.addColorStop(0, i % 2 === 0 ? "#2f006d" : "#4b0082");
      grad.addColorStop(1, i % 2 === 0 ? "#1b003f" : "#2e004d");
      fillStyle = grad;
    } else if (designType === "nature") {
      fillStyle = i % 2 === 0 ? "#5f8c4f" : "#3e5a2f";
    } else if (designType === "candy") {
      fillStyle = i % 2 === 0 ? "#ffbff7" : "#8efff6";
    } else if (designType === "holographic") {
      let grad = ctxPrev.createLinearGradient(0, 0, 100, 100);
      grad.addColorStop(0, "#00d2ff");
      grad.addColorStop(0.5, "#3a7bd5");
      grad.addColorStop(1, "#b06ab3");
      fillStyle = grad;
    } else if (designType === "jelly") {
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, "#ffd1dc");
      grad.addColorStop(1, "#ffe4e1");
      fillStyle = grad;
    } else if (designType === "magnetic") {
      fillStyle = i % 2 === 0 ? "#000428" : "#004e92";
    } else if (designType === "layered") {
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, "#e0e5ec");
      grad.addColorStop(1, "#bbb");
      fillStyle = grad;
    } else if (designType === "nebula") {
      let grad = ctxPrev.createLinearGradient(0, 0, 100, 0);
      grad.addColorStop(0, "rgba(255,255,255,0.2)");
      grad.addColorStop(0.33, "rgba(173,216,230,0.3)");
      grad.addColorStop(0.66, "rgba(221,160,221,0.3)");
      grad.addColorStop(1, "rgba(255,192,203,0.3)");
      fillStyle = grad;
    }
    ctxPrev.fillStyle = fillStyle;
    ctxPrev.fill();
    ctxPrev.strokeStyle = "#e0e5ec";
    ctxPrev.lineWidth = 1;
    ctxPrev.stroke();
  }
  ctxPrev.restore();
}

/*****************
 * PLUS/MINUS BUTTONS
 *****************/
plusButton.addEventListener('click', () => {
  let current = parseInt(numPlayersInput.value);
  if (current < 20) {
    current++;
    numPlayersInput.value = current;
    drawWheel(current);
  }
});
minusButton.addEventListener('click', () => {
  let current = parseInt(numPlayersInput.value);
  if (current > 2) {
    current--;
    numPlayersInput.value = current;
    drawWheel(current);
  }
});

/*****************
 * DRAG & INERTIAL SPIN (Touch/Mouse)
 *****************/
wheelContainer.addEventListener("pointerdown", pointerDown);
wheelContainer.addEventListener("pointermove", pointerMove);
wheelContainer.addEventListener("pointerup", pointerUp);
wheelContainer.addEventListener("pointercancel", pointerUp);

function getPointerAngle(e) {
  const rect = wheelContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const x = e.clientX - centerX;
  const y = e.clientY - centerY;
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  return angle;
}

function pointerDown(e) {
  e.preventDefault();
  dragging = true;
  lastPointerAngle = getPointerAngle(e);
  lastPointerTime = performance.now();
  if (inertialAnimationFrame) {
    cancelAnimationFrame(inertialAnimationFrame);
    inertialAnimationFrame = null;
    lastInertialTime = null;
  }
}

function pointerMove(e) {
  if (!dragging) return;
  const currentAngle = getPointerAngle(e);
  let now = performance.now();
  let dt = now - lastPointerTime;
  let delta = currentAngle - lastPointerAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  currentNeedleRotation += delta;
  updateNeedleTransform(currentNeedleRotation);
  pointerVelocity = delta / dt;
  lastPointerAngle = currentAngle;
  lastPointerTime = now;
}

function pointerUp(e) {
  if (!dragging) return;
  dragging = false;
  lastInertialTime = null;
  inertialAnimationFrame = requestAnimationFrame(inertialSpin);
}

function inertialSpin(timestamp) {
  if (!lastInertialTime) lastInertialTime = timestamp;
  let dt = timestamp - lastInertialTime;
  lastInertialTime = timestamp;
  currentNeedleRotation += pointerVelocity * dt;
  updateNeedleTransform(currentNeedleRotation);
  pointerVelocity *= 0.95;
  if (Math.abs(pointerVelocity) > 0.01)
    inertialAnimationFrame = requestAnimationFrame(inertialSpin);
  else
    determineWinner(currentNeedleRotation, parseInt(numPlayersInput.value));
}

/*****************
 * INITIALIZE
 *****************/
drawWheel(parseInt(numPlayersInput.value));
applyNeedleDesign();
spinButton.addEventListener('click', spinNeedle);

/*****************
 * SPIN ANIMATION (Spin Button)
 *****************/
function spinNeedle() {
  // Cancel any ongoing drag/inertial spin
  dragging = false;
  if (inertialAnimationFrame) {
    cancelAnimationFrame(inertialAnimationFrame);
    inertialAnimationFrame = null;
  }
  pointerVelocity = 0;
  lastTickSegment = null;
  const num = parseInt(numPlayersInput.value);
  drawWheel(num);
  const startRotation = currentNeedleRotation;
  const spins = 5;
  const extra = Math.floor(Math.random() * 360);
  const targetRotation = startRotation + spins * 360 + extra;
  const duration = 4000;
  let startTime = null;
  function animate(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easing = 1 - Math.pow(1 - t, 3);
    const currentRotation = startRotation + (targetRotation - startRotation) * easing;
    updateNeedleTransform(currentRotation);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      currentNeedleRotation = currentRotation % 360;
      determineWinner(currentNeedleRotation, num);
    }
  }
  requestAnimationFrame(animate);
}

function determineWinner(rot, num) {
  const segSize = 360 / num;
  const norm = ((rot % 360) + 360) % 360;
  highlightedIndex = Math.floor(norm / segSize);
  drawWheel(num, highlightedIndex);
}

/*****************
 * NEEDLE TRANSFORM & SOUND TICK
 *****************/
function updateNeedleTransform(rot) {
  if (currentNeedleDesign === "knob") {
    needle.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
  } else if (["arrow","feather","laser","dynamic","magnet","aurora","fluid","radar","cosmic","circuit"].includes(currentNeedleDesign)) {
    needle.style.transform = `translate(-50%, -100%) rotate(${rot}deg)`;
  } else if (currentNeedleDesign === "trident") {
    needle.style.transform = `translate(-50%, -95%) rotate(${rot}deg)`;
  }
  currentNeedleRotation = rot;
  checkTickSound();
}

function checkTickSound() {
  const num = parseInt(numPlayersInput.value);
  const segSize = 360 / num;
  let norm = ((currentNeedleRotation % 360) + 360) % 360;
  const currentSegment = Math.floor(norm / segSize);
  if (currentSegment !== lastTickSegment) {
    tickSound.currentTime = 0;
    tickSound.play();
    lastTickSegment = currentSegment;
  }
}

/*****************
 * NEEDLE DESIGN SETUP
 *****************/
function applyNeedleDesign() {
  needle.classList.remove("knob","arrow","feather","laser","trident","dynamic","magnet","aurora","fluid","radar","cosmic","circuit");
  needle.classList.add(currentNeedleDesign);
}

/*****************
 * SETTINGS MODAL & PREVIEW HANDLERS
 *****************/
openSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'block';
  updateWheelPreviews();
  updateSelectedPreviews();
});
closeSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
  drawWheel(parseInt(numPlayersInput.value));
});
window.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
    drawWheel(parseInt(numPlayersInput.value));
  }
});

// Wheel Design Preview Clicks
previewWheelPastel.addEventListener('click', () => { currentWheelDesign = "pastel"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelClassic.addEventListener('click', () => { currentWheelDesign = "classic"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelGalaxy.addEventListener('click', () => { currentWheelDesign = "galaxy"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelNature.addEventListener('click', () => { currentWheelDesign = "nature"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelCandy.addEventListener('click', () => { currentWheelDesign = "candy"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelHolographic.addEventListener('click', () => { currentWheelDesign = "holographic"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelJelly.addEventListener('click', () => { currentWheelDesign = "jelly"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelMagnetic.addEventListener('click', () => { currentWheelDesign = "magnetic"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelLayered.addEventListener('click', () => { currentWheelDesign = "layered"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });
previewWheelNebula.addEventListener('click', () => { currentWheelDesign = "nebula"; updateSelectedPreviews(); drawWheel(parseInt(numPlayersInput.value)); });

// Needle Design Preview Clicks
previewNeedleKnob.addEventListener('click', () => { currentNeedleDesign = "knob"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleArrow.addEventListener('click', () => { currentNeedleDesign = "arrow"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleFeather.addEventListener('click', () => { currentNeedleDesign = "feather"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleLaser.addEventListener('click', () => { currentNeedleDesign = "laser"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });
previewNeedleTrident.addEventListener('click', () => { currentNeedleDesign = "trident"; updateSelectedPreviews(); applyNeedleDesign(); updateNeedleTransform(currentNeedleRotation); });

function updateSelectedPreviews() {
  // Wheel Previews
  previewWheelPastel.classList.toggle("selected", currentWheelDesign === "pastel");
  previewWheelClassic.classList.toggle("selected", currentWheelDesign === "classic");
  previewWheelGalaxy.classList.toggle("selected", currentWheelDesign === "galaxy");
  previewWheelNature.classList.toggle("selected", currentWheelDesign === "nature");
  previewWheelCandy.classList.toggle("selected", currentWheelDesign === "candy");
  previewWheelHolographic.classList.toggle("selected", currentWheelDesign === "holographic");
  previewWheelJelly.classList.toggle("selected", currentWheelDesign === "jelly");
  previewWheelMagnetic.classList.toggle("selected", currentWheelDesign === "magnetic");
  previewWheelLayered.classList.toggle("selected", currentWheelDesign === "layered");
  previewWheelNebula.classList.toggle("selected", currentWheelDesign === "nebula");
  
  // Needle Previews
  previewNeedleKnob.classList.toggle("selected", currentNeedleDesign === "knob");
  previewNeedleArrow.classList.toggle("selected", currentNeedleDesign === "arrow");
  previewNeedleFeather.classList.toggle("selected", currentNeedleDesign === "feather");
  previewNeedleLaser.classList.toggle("selected", currentNeedleDesign === "laser");
  previewNeedleTrident.classList.toggle("selected", currentNeedleDesign === "trident");
}

function updateWheelPreviews() {
  drawWheelPreview(document.querySelector("#previewWheelPastel canvas"), "pastel");
  drawWheelPreview(document.querySelector("#previewWheelClassic canvas"), "classic");
  drawWheelPreview(document.querySelector("#previewWheelGalaxy canvas"), "galaxy");
  drawWheelPreview(document.querySelector("#previewWheelNature canvas"), "nature");
  drawWheelPreview(document.querySelector("#previewWheelCandy canvas"), "candy");
  drawWheelPreview(document.querySelector("#previewWheelHolographic canvas"), "holographic");
  drawWheelPreview(document.querySelector("#previewWheelJelly canvas"), "jelly");
  drawWheelPreview(document.querySelector("#previewWheelMagnetic canvas"), "magnetic");
  drawWheelPreview(document.querySelector("#previewWheelLayered canvas"), "layered");
  drawWheelPreview(document.querySelector("#previewWheelNebula canvas"), "nebula");
}

function drawWheelPreview(canvasElem, designType) {
  const ctxPrev = canvasElem.getContext("2d");
  ctxPrev.clearRect(0, 0, 100, 100);
  const centerX = 50, centerY = 50, radius = 48;
  const numSegments = 6, segAngle = (2 * Math.PI) / numSegments;
  ctxPrev.save();
  ctxPrev.translate(centerX, centerY);
  ctxPrev.rotate(-Math.PI / 2);
  ctxPrev.translate(-centerX, -centerY);
  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * segAngle;
    const endAngle = startAngle + segAngle;
    ctxPrev.beginPath();
    ctxPrev.moveTo(centerX, centerY);
    ctxPrev.arc(centerX, centerY, radius, startAngle, endAngle);
    ctxPrev.closePath();
    
    let fillStyle = "#ccc";
    if (designType === "pastel") {
      const baseEven = { start: "#cfd8e3", end: "#e0e5ec" };
      const baseOdd  = { start: "#dde3ec", end: "#e8eef3" };
      const base = i % 2 === 0 ? baseEven : baseOdd;
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, base.start);
      grad.addColorStop(1, base.end);
      fillStyle = grad;
    } else if (designType === "classic") {
      fillStyle = i % 2 === 0 ? "#d32f2f" : "#212121";
    } else if (designType === "galaxy") {
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
      grad.addColorStop(0, i % 2 === 0 ? "#2f006d" : "#4b0082");
      grad.addColorStop(1, i % 2 === 0 ? "#1b003f" : "#2e004d");
      fillStyle = grad;
    } else if (designType === "nature") {
      fillStyle = i % 2 === 0 ? "#5f8c4f" : "#3e5a2f";
    } else if (designType === "candy") {
      fillStyle = i % 2 === 0 ? "#ffbff7" : "#8efff6";
    } else if (designType === "holographic") {
      let grad = ctxPrev.createLinearGradient(0, 0, 100, 100);
      grad.addColorStop(0, "#00d2ff");
      grad.addColorStop(0.5, "#3a7bd5");
      grad.addColorStop(1, "#b06ab3");
      fillStyle = grad;
    } else if (designType === "jelly") {
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, "#ffd1dc");
      grad.addColorStop(1, "#ffe4e1");
      fillStyle = grad;
    } else if (designType === "magnetic") {
      fillStyle = i % 2 === 0 ? "#000428" : "#004e92";
    } else if (designType === "layered") {
      let grad = ctxPrev.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
      grad.addColorStop(0, "#e0e5ec");
      grad.addColorStop(1, "#bbb");
      fillStyle = grad;
    } else if (designType === "nebula") {
      let grad = ctxPrev.createLinearGradient(0, 0, 100, 0);
      grad.addColorStop(0, "rgba(255,255,255,0.2)");
      grad.addColorStop(0.33, "rgba(173,216,230,0.3)");
      grad.addColorStop(0.66, "rgba(221,160,221,0.3)");
      grad.addColorStop(1, "rgba(255,192,203,0.3)");
      fillStyle = grad;
    }
    ctxPrev.fillStyle = fillStyle;
    ctxPrev.fill();
    ctxPrev.strokeStyle = "#e0e5ec";
    ctxPrev.lineWidth = 1;
    ctxPrev.stroke();
  }
  ctxPrev.restore();
}
