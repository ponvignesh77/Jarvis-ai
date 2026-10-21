(() => {
  const state = { lang: "en", listening: false, thinking: false, speaking: false, history: [] };
  const $ = (id) => document.getElementById(id);
  const log = $("log"), stateEl = $("state"), micBtn = $("micBtn"), form = $("form"), input = $("text");
  const speakToggle = $("speakToggle"), voiceEnabled = $("voiceEnabled");

  const STRINGS = {
    en: {
      idle: "say something or type below",
      listening: "Listening…",
      thinking: "Processing…",
      speaking: "Speaking…",
      greet: "Systems online. How can I help?",
      placeholder: "Ask JARVIS anything…",
      cleared: "New conversation started.",
      voiceOff: "Voice activation is turned off in settings.",
      noSpeech: "Speech recognition is not supported in this browser.",
      notice: "Preview mode: replies come from built-in demo logic. Phone actions only work in the Android app.",
      fallback: "I can help with questions, calculations, code, and quick device info here. Connect an AI provider in the Android app for full answers.",
      appNote: (app) => `On Android, JARVIS would launch ${app} if it is installed. This web preview cannot open apps.`,
      settingsNote: (what) => `On Android I would open ${what} so you can make the change yourself. Android does not let apps flip this switch silently.`,
      confirm: "Sending messages and placing calls need your confirmation first. Tell me who to message and what to say, and I will ask before sending.",
      timeNow: (d) => `It is ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} on ${d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}.`,
      battery: (p, c) => `Battery is at ${p}%${c ? ", charging" : ", not charging"}.`,
      batteryNA: "Battery status is not available in this browser. The Android app reads it directly.",
      calc: (expr, res) => `${expr} = ${res}`,
      calcErr: "I could not evaluate that expression.",
      ai: "Artificial intelligence is software that learns patterns from data to perform tasks that normally need human judgment, such as understanding language, recognising images, or making predictions. Modern assistants are built on large language models trained on huge amounts of text.",
    },
    ta: {
      idle: "கீழே பேசவும் அல்லது தட்டச்சு செய்யவும்",
      listening: "கேட்டுக்கொண்டிருக்கிறேன்…",
      thinking: "செயலாக்குகிறேன்…",
      speaking: "பேசுகிறேன்…",
      greet: "அமைப்பு தயாராக உள்ளது. நான் எப்படி உதவ முடியும்?",
      placeholder: "எதையும் கேளுங்கள்…",
      cleared: "புதிய உரையாடல் தொடங்கப்பட்டது.",
      voiceOff: "அமைப்புகளில் குரல் செயல்படுத்தல் நிறுத்தப்பட்டுள்ளது.",
      noSpeech: "இந்த உலாவியில் பேச்சு அறிதல் ஆதரிக்கப்படவில்லை.",
      notice: "முன்னோட்ட முறை: பதில்கள் உள்ளமைந்த டெமோ தர்க்கத்திலிருந்து வருகின்றன. தொலைபேசி செயல்கள் Android செயலியில் மட்டுமே வேலை செய்யும்.",
      fallback: "கேள்விகள், கணக்கீடுகள், குறியீடு மற்றும் சாதனத் தகவல்களில் உதவ முடியும். முழு பதில்களுக்கு Android செயலியில் AI வழங்குநரை இணைக்கவும்.",
      appNote: (app) => `Android இல் ${app} நிறுவப்பட்டிருந்தால் JARVIS அதைத் திறக்கும். இந்த இணைய முன்னோட்டத்தால் செயலிகளைத் திறக்க முடியாது.`,
      settingsNote: (what) => `Android இல் ${what} திறக்கப்படும், நீங்களே மாற்றம் செய்யலாம். இதை செயலிகள் அமைதியாக மாற்ற முடியாது.`,
      confirm: "செய்திகள் அனுப்பவும் அழைப்புகள் செய்யவும் முதலில் உங்கள் உறுதிப்படுத்தல் தேவை.",
      timeNow: (d) => `இப்போது ${d.toLocaleTimeString("ta-IN", { hour: "2-digit", minute: "2-digit" })}, ${d.toLocaleDateString("ta-IN", { weekday: "long", day: "numeric", month: "long" })}.`,
      battery: (p, c) => `பேட்டரி ${p}% உள்ளது${c ? ", சார்ஜ் ஆகிறது" : ", சார்ஜ் ஆகவில்லை"}.`,
      batteryNA: "இந்த உலாவியில் பேட்டரி நிலை கிடைக்கவில்லை. Android செயலி அதை நேரடியாகப் படிக்கும்.",
      calc: (expr, res) => `${expr} = ${res}`,
      calcErr: "அந்த வெளிப்பாட்டைக் கணக்கிட முடியவில்லை.",
      ai: "செயற்கை நுண்ணறிவு என்பது தரவிலிருந்து வடிவங்களைக் கற்று மொழி புரிதல், படம் அடையாளம் காணுதல் அல்லது முன்கணிப்பு போன்ற பணிகளைச் செய்யும் மென்பொருள் ஆகும்.",
    },
  };
  const t = () => STRINGS[state.lang];

  /* ---------- Particle sphere visualizer ---------- */
  const canvas = $("viz");
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let size = 360;
  function sizeCanvas() {
    size = canvas.clientWidth || 360;
    canvas.width = size * DPR;
    canvas.height = size * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  // Fibonacci sphere points, each with a random phase and spark timer
  const N = 520;
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push({
      x: Math.cos(th) * r, y, z: Math.sin(th) * r,
      phase: Math.random() * Math.PI * 2,
      spark: 0,
      sparkRate: Math.random(),
    });
  }

  let level = 0;
  let rot = 0;
  let last = performance.now();
  const palette = { hot: [255, 122, 26], amber: [255, 179, 71], bright: [255, 226, 160] };

  function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  function frame(now) {
    const dt = Math.min(64, now - last) / 16.67;
    last = now;

    const target = state.listening ? 0.75 : state.speaking ? 0.9 : state.thinking ? 0.5 : 0.18;
    level += (target - level) * 0.08;
    const spin = (state.thinking ? 0.02 : 0.006) * dt;
    rot += spin;

    ctx.clearRect(0, 0, size, size);
    const c = size / 2;
    const R = size * 0.34 * (1 + level * 0.06 + Math.sin(now * 0.002) * 0.015);
    const tilt = 0.35 + Math.sin(now * 0.0005) * 0.08;
    const cosY = Math.cos(rot), sinY = Math.sin(rot);
    const cosX = Math.cos(tilt), sinX = Math.sin(tilt);

    // Outer halo
    const halo = ctx.createRadialGradient(c, c, R * 0.2, c, c, R * 1.5);
    halo.addColorStop(0, rgba(palette.amber, 0.25 + level * 0.15));
    halo.addColorStop(0.6, rgba(palette.hot, 0.06));
    halo.addColorStop(1, rgba(palette.hot, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(c, c, R * 1.5, 0, Math.PI * 2); ctx.fill();

    // Orbit rings (dashed, counter-rotating)
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const rr = R * (1.22 + i * 0.16);
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(tilt * (i % 2 ? -1 : 1) + rot * (i % 2 ? -0.6 : 0.4) * (i + 1) * 0.5);
      ctx.scale(1, 0.28 + i * 0.12);
      ctx.setLineDash([3, 10 + i * 6]);
      ctx.lineDashOffset = -now * 0.02 * (i + 1);
      ctx.strokeStyle = rgba(palette.amber, 0.35 - i * 0.07);
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);

    // Tick ring
    ctx.strokeStyle = rgba(palette.amber, 0.28);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2 + rot * 0.2;
      const len = i % 6 === 0 ? 10 : 4;
      const r1 = R * 1.08, r2 = r1 + len;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      ctx.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2);
      ctx.stroke();
    }

    // Particles
    const projected = new Array(N);
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      // Sparks: a few points flare outward at random
      if (p.spark <= 0 && Math.random() < 0.004 * (1 + level * 4) * p.sparkRate) {
        p.spark = 1;
      }
      p.spark = Math.max(0, p.spark - 0.03 * dt);

      const wobble = 1 + Math.sin(now * 0.004 + p.phase) * 0.03 * (0.5 + level);
      const rad = R * wobble * (1 + p.spark * 0.18);

      // Rotate around Y then tilt around X
      let x = p.x * cosY - p.z * sinY;
      let z = p.x * sinY + p.z * cosY;
      let y = p.y;
      const y2 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;

      const persp = 2.2 / (2.2 - z2 * 0.5);
      const sx = c + x * rad * persp;
      const sy = c + y2 * rad * persp;
      const depth = (z2 + 1) / 2; // 0 back, 1 front
      projected[i] = { sx, sy, depth, spark: p.spark };
    }

    // Draw back-to-front
    projected.sort((a, b) => a.depth - b.depth);
    for (let i = 0; i < N; i++) {
      const q = projected[i];
      const flare = q.spark;
      const a = 0.12 + q.depth * 0.65 + flare * 0.35;
      const col = flare > 0.5 ? palette.bright : q.depth > 0.6 ? palette.amber : palette.hot;
      const s = 0.8 + q.depth * 1.3 + flare * 2.2;
      ctx.fillStyle = rgba(col, Math.min(1, a));
      ctx.fillRect(q.sx - s / 2, q.sy - s / 2, s, s);
    }

    // Short streaks on front particles for motion
    ctx.lineWidth = 1;
    for (let i = N - 60; i < N; i++) {
      const q = projected[i];
      ctx.strokeStyle = rgba(palette.bright, 0.35 * q.depth);
      ctx.beginPath();
      ctx.moveTo(q.sx, q.sy);
      ctx.lineTo(q.sx + (q.sx - c) * 0.06, q.sy + (q.sy - c) * 0.06);
      ctx.stroke();
    }

    // Core glow
    const core = ctx.createRadialGradient(c, c, 0, c, c, R * 0.42);
    core.addColorStop(0, rgba(palette.bright, 0.35 + level * 0.25));
    core.addColorStop(1, rgba(palette.hot, 0));
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(c, c, R * 0.42, 0, Math.PI * 2); ctx.fill();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Status ---------- */
  function setStatus(key) {
    const s = t();
    state.listening = key === "listening";
    state.thinking = key === "thinking";
    state.speaking = key === "speaking";
    const label = key === "idle" ? "Idle" : key === "listening" ? "Listening" : key === "thinking" ? "Processing" : "Speaking";
    stateEl.innerHTML = `<strong>${label}</strong> · ${key === "idle" ? s.idle : s[key]}`;
    micBtn.setAttribute("aria-pressed", String(state.listening));
  }

  /* ---------- Messages ---------- */
  function addMsg(role, text, extraClass = "") {
    const el = document.createElement("div");
    el.className = `msg ${role} ${extraClass}`.trim();
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  /* ---------- Speech output ---------- */
  function speak(text) {
    if (!speakToggle.checked || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = state.lang === "ta" ? "ta-IN" : "en-IN";
    u.rate = 1;
    u.onstart = () => setStatus("speaking");
    u.onend = () => setStatus("idle");
    u.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(u);
  }

  /* ---------- Local responder (demo logic) ---------- */
  async function respond(raw) {
    const s = t();
    const q = raw.trim();
    const lower = q.toLowerCase();

    if (/^(hi|hello|hey|vanakkam)\b/i.test(q) || /வணக்கம்/.test(q)) return s.greet;

    if (/\b(time|date|day is it)\b/.test(lower) || /நேரம்|தேதி/.test(q)) return s.timeNow(new Date());

    if (/\bbattery\b/.test(lower) || /பேட்டரி/.test(q)) {
      if (navigator.getBattery) {
        try {
          const b = await navigator.getBattery();
          return s.battery(Math.round(b.level * 100), b.charging);
        } catch (_) { /* fall through */ }
      }
      return s.batteryNA;
    }

    const openMatch = lower.match(/^(?:open|launch)\s+(.+)$/);
    if (openMatch) return s.appNote(openMatch[1].replace(/\b\w/g, (c) => c.toUpperCase()));

    const setting = lower.match(/brightness|bluetooth|wi-?fi|hotspot|volume|do not disturb|location/);
    if (setting) {
      const what = setting[0];
      return s.settingsNote(what === "brightness" ? "Display settings" : what === "volume" ? "Sound settings" : what + " settings");
    }

    if (/\b(send|message|call|text)\b/.test(lower)) return s.confirm;

    const mathLike = q.replace(/\s+/g, "");
    if (/^[\d+\-*/().%^]+$/.test(mathLike) && /\d/.test(mathLike)) {
      try {
        const expr = mathLike.replace(/\^/g, "**").replace(/%/g, "/100");
        const res = Function(`"use strict"; return (${expr});`)();
        if (typeof res === "number" && isFinite(res)) return s.calc(q, Number(res.toPrecision(12)));
      } catch (_) { return s.calcErr; }
      return s.calcErr;
    }

    if (/explain.*(artificial intelligence|\bai\b)|what is (artificial intelligence|\bai\b)/.test(lower) || /செயற்கை நுண்ணறிவு/.test(q)) return s.ai;

    return s.fallback;
  }

  /* ---------- Send flow ---------- */
  async function send(text) {
    const clean = text.trim();
    if (!clean || state.thinking) return;
    addMsg("user", clean);
    state.history.push({ role: "user", content: clean });
    setStatus("thinking");
    const reply = await respond(clean);
    setTimeout(() => {
      addMsg("ai", reply);
      state.history.push({ role: "assistant", content: reply });
      if (speakToggle.checked) speak(reply);
      else setStatus("idle");
    }, 350);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    send(v);
  });

  document.querySelectorAll("#quick button").forEach((b) => {
    b.addEventListener("click", () => send(b.dataset.cmd));
  });

  /* ---------- Voice input ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  if (SR) {
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (ev) => send(ev.results[0][0].transcript);
    recognition.onend = () => { if (state.listening) setStatus("idle"); };
    recognition.onerror = () => setStatus("idle");
  }

  micBtn.addEventListener("click", () => {
    if (!voiceEnabled.checked) return addMsg("system", t().voiceOff);
    if (!recognition) return addMsg("system", t().noSpeech, "warn");
    if (state.listening) { recognition.stop(); return; }
    recognition.lang = state.lang === "ta" ? "ta-IN" : "en-IN";
    try {
      recognition.start();
      setStatus("listening");
    } catch (_) {
      setStatus("idle");
    }
  });

  voiceEnabled.addEventListener("change", () => {
    micBtn.disabled = !voiceEnabled.checked;
  });

  /* ---------- Controls ---------- */
  function applyLang() {
    const s = t();
    document.documentElement.lang = state.lang === "ta" ? "ta" : "en";
    input.placeholder = s.placeholder;
    $("notice").textContent = s.notice;
    $("langBtn").textContent = state.lang === "ta" ? "English" : "தமிழ்";
    $("langBtn").setAttribute("aria-pressed", String(state.lang === "ta"));
    micBtn.setAttribute("aria-label", state.lang === "ta" ? "குரல் உள்ளீட்டைத் தொடங்கு" : "Start voice input");
    setStatus("idle");
  }

  $("langBtn").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "ta" : "en";
    applyLang();
  });

  $("themeBtn").addEventListener("click", () => {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    document.documentElement.setAttribute("data-theme", light ? "dark" : "light");
    $("themeBtn").textContent = light ? "Light" : "Dark";
    $("themeBtn").setAttribute("aria-pressed", String(!light));
  });

  $("clearBtn").addEventListener("click", () => {
    state.history = [];
    log.innerHTML = "";
    addMsg("system", t().cleared);
    addMsg("ai", t().greet);
    setStatus("idle");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  /* ---------- Zoom gestures ---------- */
  const wrap = document.querySelector(".sphere-wrap");
  let zoom = 1, pinchStart = 0, zoomAtPinch = 1;
  const clampZoom = (z) => Math.min(2.4, Math.max(0.6, z));
  function setZoom(z) {
    zoom = clampZoom(z);
    wrap.style.transform = `scale(${zoom})`;
  }
  const dist = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

  wrap.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) { pinchStart = dist(e.touches); zoomAtPinch = zoom; }
  }, { passive: true });
  wrap.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && pinchStart) {
      e.preventDefault();
      setZoom(zoomAtPinch * (dist(e.touches) / pinchStart));
    }
  }, { passive: false });
  wrap.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) pinchStart = 0;
  });
  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    setZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.92));
  }, { passive: false });
  wrap.addEventListener("dblclick", () => setZoom(1));

  /* ---------- Apps, revealed one by one ----------
     Demo list only. A browser cannot read installed apps; the Android app
     lists the apps the user allows it to see. */
  const DEMO_APPS = [
    ["YouTube", "#ff6b5a"], ["WhatsApp", "#5ef2b6"], ["Chrome", "#ffb347"],
    ["Maps", "#ffe2a0"], ["Camera", "#ff7a1a"], ["Gallery", "#ffd27a"],
    ["Settings", "#b8967a"], ["Calendar", "#ffb347"], ["Clock", "#ff7a1a"], ["Files", "#ffe2a0"],
  ];
  let revealTimer = null;

  function makeTile(name, color) {
    const b = document.createElement("button");
    b.className = "app-tile";
    b.innerHTML = `<span class="app-icon" style="background:${color}">${name[0]}</span><span>${name}</span>`;
    b.addEventListener("click", () => send(`Open ${name}`));
    return b;
  }

  function revealApps() {
    const grid = $("appGrid");
    clearTimeout(revealTimer);
    grid.innerHTML = "";
    let i = 0;
    const step = () => {
      if (i >= DEMO_APPS.length) return;
      const [name, color] = DEMO_APPS[i++];
      const tile = makeTile(name, color);
      grid.appendChild(tile);
      requestAnimationFrame(() => requestAnimationFrame(() => tile.classList.add("show")));
      revealTimer = setTimeout(step, 260);
    };
    step();
  }
  $("revealBtn").addEventListener("click", revealApps);

  /* ---------- Start ---------- */
  addMsg("ai", t().greet);
  applyLang();
  micBtn.disabled = !voiceEnabled.checked;
})();
