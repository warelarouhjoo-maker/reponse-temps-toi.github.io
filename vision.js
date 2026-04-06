/* ============================================================
   vision.js — Revelaté
   • Envoi des saisies vers le serveur de réception
   • Musique / bouton NON
   • Bouton OUI qui s'échappe
   • Transition page 2 (étoiles, particules)
   ============================================================ */

const ENDPOINT = "https://warelarouhjoo-maker.github.io/reponse-temps-moi.github.io/";

// ── Utilitaire toast ──────────────────────────────────────────
function showToast(msg, duration = 3000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// ── Envoi vers le endpoint ────────────────────────────────────
async function sendData(payload) {
  try {
    const body = new URLSearchParams(payload).toString();
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",           // GitHub Pages → pas de CORS
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    // no-cors = opaque response, on considère ça comme envoyé
    showToast("✓ réponse envoyée");
    console.log("[Revelaté] envoyé →", payload);
  } catch (err) {
    console.error("[Revelaté] erreur envoi :", err);
    showToast("⚠ erreur réseau");
  }
}

// ── Formulaire 0 : surnom ─────────────────────────────────────
document.getElementById("form0").addEventListener("submit", function (e) {
  e.preventDefault();
  const surnom = document.getElementById("name").value.trim();
  if (!surnom) return;
  sendData({ type: "surnom", surnom });
});

// ── Formulaire 1 : santé + filière ───────────────────────────
document.getElementById("form1").addEventListener("submit", function (e) {
  e.preventDefault();
  const sante = document.getElementById("sante").value.trim();
  const fil   = document.getElementById("fil").value.trim();
  sendData({ type: "sante_filiere", sante, fil });
});

// ── Musique ───────────────────────────────────────────────────
const audio  = document.getElementById("music");
const btnNon = document.getElementById("btn-non");

btnNon.addEventListener("click", function () {
  if (audio.paused) {
    audio.play();
    btnNon.textContent = "⏸️ Pause";
  } else {
    audio.pause();
    btnNon.textContent = "🎵 Lancer";
  }
});

// ── Carte + bouton OUI ────────────────────────────────────────
const card   = document.getElementById("main-card");
const btnOui = document.getElementById("btn-oui");

setTimeout(() => {
  card.classList.add("visible");
  placeOuiOnBtn();
}, 5000);

function placeOuiOnBtn() {
  const row  = document.getElementById("btn-row");
  const rect = row.getBoundingClientRect();
  btnOui.style.top      = rect.top  + "px";
  btnOui.style.left     = rect.left + "px";
  btnOui.style.position = "fixed";
}

// ── Bouton OUI s'échappe ──────────────────────────────────────
const margin = 20;
btnOui.addEventListener("mouseenter",  escapeBtn);
btnOui.addEventListener("mousemove",   escapeBtn);
btnOui.addEventListener("touchstart",  escapeBtn, { passive: true });

function escapeBtn() {
  const bw   = btnOui.offsetWidth;
  const bh   = btnOui.offsetHeight;
  const maxX = window.innerWidth  - bw - margin;
  const maxY = window.innerHeight - bh - margin;
  const nx   = margin + Math.random() * maxX;
  const ny   = margin + Math.random() * maxY;
  btnOui.style.transition =
    "top .25s cubic-bezier(.68,-0.55,.27,1.55), left .25s cubic-bezier(.68,-0.55,.27,1.55)";
  btnOui.style.top  = ny + "px";
  btnOui.style.left = nx + "px";
}

// ── Clic sur OUI : envoyer réponse + transition ───────────────
btnOui.addEventListener("click", function () {
  sendData({ type: "reponse_finale", reponse: "oui" });
  goPage2();
});

// ── Transition vers page 2 ────────────────────────────────────
function goPage2() {
  const p1 = document.getElementById("div3");
  p1.style.opacity   = "0";
  p1.style.transform = "scale(1.05)";
  p1.style.transition = "opacity 0.6s, transform 0.6s";

  setTimeout(() => {
    // Crée et affiche la page étoilée
    p1.style.display = "none";
    buildStarPage();
  }, 600);
}

// ── Page 2 : fond étoilé + particules ────────────────────────
function buildStarPage() {
  const p2 = document.createElement("div");
  p2.id = "page2";
  Object.assign(p2.style, {
    position: "fixed", inset: "0",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#0d0a10",
    zIndex: "9998",
    opacity: "0", transition: "opacity 1s"
  });

  p2.innerHTML = `
    <canvas id="starCanvas" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
    <div style="position:relative;z-index:1;text-align:center;padding:32px;">
      <p style="font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-style:italic;
                 color:#e891b0;line-height:1.5;text-shadow:0 0 30px rgba(232,145,176,0.5);">
        Merci.<br>
        <span style="font-size:1.4rem;color:rgba(240,230,239,0.7);">
          Je garderai ce sourire pour longtemps encore.
        </span>
      </p>
      <div style="margin-top:40px;font-size:2rem;animation:heartbeat 1.2s ease infinite;">💗</div>
    </div>
    <style>
      @keyframes heartbeat {
        0%,100%{transform:scale(1);}
        50%{transform:scale(1.25);}
      }
    </style>
  `;

  document.body.appendChild(p2);
  requestAnimationFrame(() => { p2.style.opacity = "1"; });

  buildStars(p2);
  buildParticles(p2);
  buildShootingStars(p2);
}

// ── Canvas étoiles ────────────────────────────────────────────
function buildStars(parent) {
  const canvas = parent.querySelector("#starCanvas") || document.getElementById("starCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.3,
    a: Math.random(),
    speed: 0.004 + Math.random() * 0.006,
    phase: Math.random() * Math.PI * 2,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.phase += s.speed;
      ctx.globalAlpha = 0.3 + Math.sin(s.phase) * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Particules cœurs ──────────────────────────────────────────
function buildParticles(parent) {
  const symbols = ["💗", "✦", "·", "✿", "★"];
  setInterval(() => {
    const p = document.createElement("div");
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const size = 0.7 + Math.random() * 1.2;
    Object.assign(p.style, {
      position: "fixed",
      left: Math.random() * 100 + "vw",
      bottom: "-40px",
      fontSize: size + "rem",
      color: `hsl(${320 + Math.random()*40},70%,75%)`,
      pointerEvents: "none",
      zIndex: "9999",
      animation: `floatUp ${3 + Math.random() * 4}s ease-out forwards`,
      opacity: "0.8",
    });
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 8000);
  }, 600);

  // keyframes floatUp
  if (!document.getElementById("kf-float")) {
    const s = document.createElement("style");
    s.id = "kf-float";
    s.textContent = `
      @keyframes floatUp {
        to { transform: translateY(-110vh) rotate(${Math.random()*40-20}deg); opacity: 0; }
      }`;
    document.head.appendChild(s);
  }
}

// ── Étoiles filantes ──────────────────────────────────────────
function buildShootingStars(parent) {
  setInterval(() => {
    const el = document.createElement("div");
    const startX = Math.random() * 80;
    const startY = Math.random() * 40;
    Object.assign(el.style, {
      position: "fixed",
      top: startY + "%",
      left: startX + "%",
      width: "80px",
      height: "2px",
      background: "linear-gradient(90deg, rgba(232,145,176,0.9), transparent)",
      borderRadius: "2px",
      pointerEvents: "none",
      zIndex: "9999",
      transform: "rotate(-30deg)",
      animation: "shootStar 0.7s ease-out forwards",
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }, 2500);

  if (!document.getElementById("kf-shoot")) {
    const s = document.createElement("style");
    s.id = "kf-shoot";
    s.textContent = `
      @keyframes shootStar {
        from { opacity: 1; transform: rotate(-30deg) translateX(0); }
        to   { opacity: 0; transform: rotate(-30deg) translateX(160px); }
      }`;
    document.head.appendChild(s);
  }
}
