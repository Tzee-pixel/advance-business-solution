/* Advance Business Solution landing — hero system diagram, reveals, problem selector, enquiry form. No dependencies. */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopQ = matchMedia("(min-width: 901px)");
  if (!reduced) document.documentElement.classList.add("js-motion");
  else document.documentElement.classList.add("no-motion");

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3); // close to power2/3.out
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ================= Hero system diagram ================= */
  const svg = document.getElementById("system");
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.appendChild(n);
    return n;
  };

  // Business entities: where they start (fragmented), where they sit in the architecture map,
  // and which navigation slot they become in the finished application.
  const ENTITIES = [
    { id: "customers", label: "CUSTOMERS", meta: "Excel sheet",       A: [36, 46, -5],   B: [30, 80] },
    { id: "orders",    label: "ORDERS",    meta: "WhatsApp + email",  A: [318, 26, 4],   B: [245, 80] },
    { id: "inventory", label: "INVENTORY", meta: "Godown register",   A: [454, 176, -3], B: [460, 80] },
    { id: "employees", label: "EMPLOYEES", meta: "HR files",          A: [50, 236, 5],   B: [30, 370] },
    { id: "approvals", label: "APPROVALS", meta: "Email chains",      A: [240, 330, -4], B: [245, 370] },
    { id: "reports",   label: "REPORTS",   meta: "Month-end Excel",   A: [430, 420, 3],  B: [460, 370] },
  ];
  const NW = 150, NH = 52;
  const HUB = { x: 245, y: 224, w: 150, h: 56 };
  const EDGES = [
    [0, "hub"], [1, "hub"], [2, "hub"], [3, "hub"], [4, "hub"], [5, "hub"],
    [0, 1], [1, 2], [3, 4], [4, 5],
  ];

  // --- Layers (drawn bottom to top)
  const gGuides = el("g");
  el("line", { x1: 20, y1: 64, x2: 620, y2: 64, class: "grid-guide" }, gGuides);
  el("line", { x1: 20, y1: 354, x2: 620, y2: 354, class: "grid-guide" }, gGuides);
  el("text", { x: 30, y: 58, class: "layer-t" }, gGuides).textContent = "ENTITIES";
  el("text", { x: 30, y: 348, class: "layer-t" }, gGuides).textContent = "PROCESSES";
  el("text", { x: 404, y: 256, class: "layer-t" }, gGuides).textContent = "← YOUR RULES";

  const gApp = el("g");
  el("rect", { x: 20, y: 20, width: 600, height: 520, class: "app-frame" }, gApp);
  el("rect", { x: 20.6, y: 20.6, width: 598.8, height: 30, class: "app-bar" }, gApp);
  [36, 50, 64].forEach((cx) => el("circle", { cx, cy: 35.6, r: 4, class: "app-dot" }, gApp));
  el("text", { x: 88, y: 39.5, class: "app-url" }, gApp).textContent = "ops.yourcompany.in / dashboard";
  el("line", { x1: 184, y1: 51, x2: 184, y2: 540, class: "ui-row" }, gApp);

  // KPI cards
  const KPI = [
    { k: "OPEN ORDERS", v: "128", v2: "128" },
    { k: "PENDING APPROVALS", v: "14", v2: "13" },
    { k: "LOW STOCK ITEMS", v: "6", v2: "6" },
  ];
  const kpiVals = KPI.map((d, i) => {
    const x = 196 + i * 140;
    el("rect", { x, y: 66, width: 128, height: 78, class: "ui-card" }, gApp);
    el("text", { x: x + 12, y: 86, class: "ui-k" }, gApp).textContent = d.k;
    const t = el("text", { x: x + 12, y: 126, class: "ui-v" }, gApp);
    t.textContent = d.v;
    return t;
  });

  // Chart
  el("rect", { x: 196, y: 156, width: 408, height: 190, class: "ui-card" }, gApp);
  el("text", { x: 208, y: 176, class: "ui-k" }, gApp).textContent = "ORDERS · LAST 12 WEEKS";
  const BARS = [0.42, 0.5, 0.46, 0.58, 0.55, 0.62, 0.6, 0.7, 0.66, 0.78, 0.82, 0.9];
  const barEls = BARS.map((h, i) =>
    el("rect", { x: 212 + i * 32, y: 330, width: 18, height: 0, class: i === BARS.length - 1 ? "ui-bar" : "ui-bar soft" }, gApp)
  );
  el("line", { x1: 208, y1: 330.5, x2: 592, y2: 330.5, class: "ui-row" }, gApp);

  // Table
  const ROWS = [
    ["PO-2041", "Purchase approval", "PENDING", "APPROVED"],
    ["INV-1187", "Invoice", "SYNCED TO TALLY", "SYNCED TO TALLY"],
    ["SO-3302", "Sales order", "DISPATCHED", "DISPATCHED"],
  ];
  const rowChips = ROWS.map((r, i) => {
    const y = 362 + i * 38;
    el("rect", { x: 196, y, width: 408, height: 38, class: "ui-row" }, gApp);
    el("text", { x: 208, y: y + 23, class: "ui-cell" }, gApp).textContent = r[0];
    el("text", { x: 280, y: y + 23, class: "ui-cell" }, gApp).textContent = r[1];
    el("rect", { x: 470, y: y + 10, width: 122, height: 18, class: "chip" }, gApp);
    const t = el("text", { x: 478, y: y + 22.5, class: "chip-t" }, gApp);
    t.textContent = r[2];
    return { t, a: r[2], b: r[3] };
  });

  const gEdges = el("g");
  const edgeEls = EDGES.map(() => el("line", { class: "edge" }, gEdges));
  const gPulses = el("g");
  const pulseEls = EDGES.map(() => el("circle", { r: 3, class: "pulse" }, gPulses));

  const gHub = el("g");
  el("rect", { x: HUB.x, y: HUB.y, width: HUB.w, height: HUB.h, class: "hub" }, gHub);
  el("text", { x: HUB.x + HUB.w / 2, y: HUB.y + 33, "text-anchor": "middle", class: "hub-label" }, gHub).textContent = "BUSINESS RULES";

  const nodeEls = ENTITIES.map((d) => {
    const g = el("g");
    const box = el("rect", { width: NW, height: NH, class: "n-box dashed" }, g);
    const dot = el("rect", { x: 12, width: 6, height: 6, class: "n-dot" }, g);
    const label = el("text", { x: 28, class: "n-label" }, g);
    label.textContent = d.label;
    const meta = el("text", { x: 28, class: "n-meta" }, g);
    meta.textContent = d.meta;
    return { g, box, dot, label, meta, off: [0, 0], vel: [0, 0] };
  });

  const gToast = el("g");
  el("rect", { x: 340, y: 488, width: 264, height: 36, class: "toast" }, gToast);
  el("circle", { cx: 358, cy: 506, r: 5, class: "toast-ok" }, gToast);
  el("text", { x: 372, y: 510, class: "toast-t" }, gToast).textContent = "PO-2041 approved · synced to Tally";

  // Cursor influence (desktop only, fades out once the system is structured)
  const mouse = { x: -999, y: -999 };
  svg.addEventListener("pointermove", (e) => {
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    mouse.x = p.x; mouse.y = p.y;
  });
  svg.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });

  const stageItems = [...document.querySelectorAll(".stages li")];
  const stageName = document.getElementById("stage-name");
  const stageCount = document.getElementById("stage-count");
  const STAGE_NAMES = ["BUSINESS LOGIC", "ARCHITECTURE", "APPLICATION", "OUTCOME"];
  let lastStage = -1;

  function render(p, time) {
    const t1 = smooth(clamp(p / 0.32));
    const t2 = smooth(clamp((p - 0.4) / 0.3));
    const t3 = smooth(clamp((p - 0.8) / 0.18));
    const arch = t1 * (1 - t2);
    const centers = [];

    nodeEls.forEach((n, i) => {
      const d = ENTITIES[i];
      // Cursor repel with a light spring
      let tx = 0, ty = 0;
      const influence = 1 - t2;
      if (influence > 0 && mouse.x > -900) {
        const cx = d.A[0] + NW / 2, cy = d.A[1] + NH / 2;
        const dx = cx - mouse.x, dy = cy - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const f = clamp((140 - dist) / 140) * 16 * influence;
        tx = (dx / dist) * f; ty = (dy / dist) * f;
      }
      n.vel[0] = (n.vel[0] + (tx - n.off[0]) * 0.08) * 0.82;
      n.vel[1] = (n.vel[1] + (ty - n.off[1]) * 0.08) * 0.82;
      n.off[0] += n.vel[0]; n.off[1] += n.vel[1];

      const C = [36, 66 + i * 42, 0];
      let x = lerp(lerp(d.A[0], d.B[0], t1), C[0], t2) + n.off[0];
      let y = lerp(lerp(d.A[1], d.B[1], t1), C[1], t2) + n.off[1];
      const r = lerp(d.A[2], 0, t1);
      const w = lerp(NW, 136, t2), h = lerp(NH, 32, t2);
      n.g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)} ${w / 2} ${h / 2})`);
      n.box.setAttribute("width", w.toFixed(2));
      n.box.setAttribute("height", h.toFixed(2));
      n.box.classList.toggle("dashed", t1 < 0.5);
      const active = i === 4 && t3 > 0.5;
      n.box.style.fill = active ? "var(--brand)" : "";
      n.label.style.fill = active ? "var(--paper)" : "";
      n.dot.style.fill = active ? "var(--accent)" : "";
      const labelY = lerp(22, h / 2 + 4, t2);
      n.label.setAttribute("y", labelY.toFixed(2));
      n.dot.setAttribute("y", (labelY - 8).toFixed(2));
      n.meta.setAttribute("y", 39);
      n.meta.style.opacity = (1 - t1).toFixed(3);
      centers.push([x + w / 2, y + h / 2]);
    });
    const hubC = [HUB.x + HUB.w / 2, HUB.y + HUB.h / 2];

    EDGES.forEach((e, i) => {
      const a = centers[e[0]];
      const b = e[1] === "hub" ? hubC : centers[e[1]];
      const line = edgeEls[i];
      line.setAttribute("x1", a[0]); line.setAttribute("y1", a[1]);
      line.setAttribute("x2", b[0]); line.setAttribute("y2", b[1]);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      // Connections form one after another
      const k = clamp((t1 - i * 0.05) / 0.5);
      line.setAttribute("stroke-dasharray", `${len} ${len}`);
      line.setAttribute("stroke-dashoffset", (len * (1 - ease(k))).toFixed(2));
      line.style.opacity = (1 - t2).toFixed(3);

      const pulse = pulseEls[i];
      const s = ((time / 1800) + i * 0.27) % 1;
      const dir = i % 2 ? s : 1 - s;
      pulse.setAttribute("cx", lerp(a[0], b[0], dir).toFixed(2));
      pulse.setAttribute("cy", lerp(a[1], b[1], dir).toFixed(2));
      pulse.style.opacity = (k >= 1 ? arch : 0).toFixed(3);
    });

    gHub.style.opacity = arch.toFixed(3);
    gGuides.style.opacity = arch.toFixed(3);
    gApp.style.opacity = t2.toFixed(3);
    barEls.forEach((b, i) => {
      const hgt = BARS[i] * 140 * (0.55 * t2 + 0.45 * t3);
      b.setAttribute("y", (330 - hgt).toFixed(2));
      b.setAttribute("height", hgt.toFixed(2));
    });
    kpiVals.forEach((t, i) => { t.textContent = t3 > 0.5 ? KPI[i].v2 : KPI[i].v; });
    rowChips.forEach((c) => { c.t.textContent = t3 > 0.5 ? c.b : c.a; });
    gToast.style.opacity = t3.toFixed(3);
    gToast.setAttribute("transform", `translate(0 ${(8 * (1 - t3)).toFixed(2)})`);

    const stage = p < 0.22 ? 0 : p < 0.56 ? 1 : p < 0.86 ? 2 : 3;
    if (stage !== lastStage) {
      lastStage = stage;
      stageItems.forEach((li, i) => li.classList.toggle("is-active", i === stage));
      stageName.textContent = STAGE_NAMES[stage];
      stageCount.textContent = `0${stage + 1} / 04`;
    }
  }

  // Entrance: fragments appear one by one (skipped for reduced motion)
  nodeEls.forEach((n, i) => {
    if (reduced) return;
    n.g.style.opacity = 0;
    n.g.style.transition = `opacity 660ms cubic-bezier(0.215,0.61,0.355,1) ${200 + i * 90}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => { n.g.style.opacity = 1; }));
  });

  const hero = document.querySelector(".hero");
  const replayBtn = document.getElementById("replay");
  let shown = 0;          // smoothed progress
  let autoStart = null;   // mobile autoplay start time
  let autoDone = false;

  // Mobile: plays once through the four stages with pauses, then offers a replay.
  const AUTO = [[0, 900, 0, 0], [900, 2300, 0, 0.36], [2300, 3500, 0.36, 0.36], [3500, 4900, 0.36, 0.74], [4900, 5900, 0.74, 0.74], [5900, 7000, 0.74, 1]];
  function autoProgress(ms) {
    for (const [s, e, a, b] of AUTO) if (ms < e) return lerp(a, b, smooth(clamp((ms - s) / (e - s))));
    return 1;
  }

  const frame = document.querySelector(".system-frame");
  let frameVisible = true;
  new IntersectionObserver(([e]) => { frameVisible = e.isIntersecting; }).observe(frame);

  replayBtn.addEventListener("click", () => { autoStart = performance.now(); autoDone = false; replayBtn.hidden = true; });

  function tick(time) {
    let target;
    if (reduced) target = 1;
    else if (desktopQ.matches) {
      const r = hero.getBoundingClientRect();
      const span = r.height - (innerHeight - 64);
      target = clamp(-r.top / (span || 1));
      replayBtn.hidden = true;
    } else {
      if (frameVisible && autoStart === null) autoStart = time;
      const ms = autoStart === null ? 0 : time - autoStart;
      target = autoProgress(ms);
      if (target >= 1 && !autoDone) { autoDone = true; replayBtn.hidden = false; }
    }
    shown += (target - shown) * (reduced ? 1 : 0.12);
    if (Math.abs(target - shown) < 0.0005) shown = target;
    render(shown, time);
    if (!reduced) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ================= Reveals + heading draw-in ================= */
  if (!reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll(".draw, .reveal").forEach((n, i) => {
      if (n.classList.contains("reveal")) n.style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(n);
    });
  }

  /* ================= Service rows: code scramble on hover (after Signal-A) ================= */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#";
  document.querySelectorAll(".svc").forEach((row) => {
    const code = row.querySelector(".svc-code");
    const final = code.dataset.text;
    let raf = 0;
    const run = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      const start = performance.now();
      const step = (now) => {
        const k = clamp((now - start) / 420);
        const fixed = Math.floor(k * final.length);
        code.textContent = final.split("").map((ch, i) =>
          i < fixed || ch === " " || ch === "/" ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        ).join("");
        if (k < 1) raf = requestAnimationFrame(step); else code.textContent = final;
      };
      raf = requestAnimationFrame(step);
    };
    row.addEventListener("mouseenter", run);
    row.addEventListener("focus", run);
  });

  /* ================= Statement: words ink in as you scroll ================= */
  const statement = document.querySelector("[data-words]");
  const words = [];
  if (statement) {
    const text = statement.textContent.trim();
    statement.textContent = "";
    text.split(/\s+/).forEach((w, i, arr) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      statement.appendChild(s);
      if (i < arr.length - 1) statement.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }
  function statementUpdate() {
    if (!words.length) return;
    if (reduced) return;
    const r = statement.getBoundingClientRect();
    const p = clamp((innerHeight * 0.88 - r.top) / (innerHeight * 0.55));
    const lit = p * words.length;
    words.forEach((w, i) => {
      const k = clamp(lit - i);
      w.style.opacity = (0.16 + 0.84 * k).toFixed(3);
      w.style.color = i >= words.length - 6 && k > 0.5 ? "var(--accent)" : "";
    });
  }

  /* ================= Case studies: stacking cards (after 1minus1) ================= */
  const cards = [...document.querySelectorAll(".scard")];
  function cardsUpdate() {
    if (reduced || !desktopQ.matches) { cards.forEach((c) => { c.style.transform = ""; c.style.filter = ""; }); return; }
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) { c.style.transform = ""; return; }
      const cr = c.getBoundingClientRect();
      const nr = next.getBoundingClientRect();
      // 0 when the next card is a full card-height below, 1 when it has covered this one
      const k = clamp(1 - (nr.top - cr.top) / cr.height);
      c.style.transform = `scale(${(1 - 0.05 * k).toFixed(4)})`;
      c.style.filter = `brightness(${(1 - 0.35 * k).toFixed(3)})`;
    });
  }

  /* ================= Process: pinned horizontal track ================= */
  const hpin = document.querySelector(".hpin");
  const htrack = document.getElementById("htrack");
  const hsteps = [...htrack.querySelectorAll(".hstep")];
  const railFill = document.getElementById("rail-fill");
  const hNow = document.getElementById("hstep-now");
  let hTravel = 0;
  function hpinLayout() {
    if (reduced || !desktopQ.matches) { hpin.style.height = ""; htrack.style.transform = ""; hTravel = 0; return; }
    hTravel = Math.max(0, htrack.scrollWidth - innerWidth);
    hpin.style.height = `${innerHeight - 64 + hTravel}px`;
  }
  function hpinUpdate() {
    if (reduced || !desktopQ.matches) { hsteps.forEach((s) => s.classList.add("is-on")); return; }
    const r = hpin.getBoundingClientRect();
    const p = clamp(-(r.top - 64) / (hTravel || 1));
    htrack.style.transform = `translate3d(${(-p * hTravel).toFixed(1)}px,0,0)`;
    railFill.style.width = `${(p * 100).toFixed(2)}%`;
    const now = Math.min(hsteps.length - 1, Math.floor(p * hsteps.length * 0.999));
    hsteps.forEach((s, i) => { s.classList.toggle("is-on", i <= now); s.classList.toggle("is-now", i === now); });
    hNow.textContent = String(now + 1).padStart(2, "0");
  }

  let scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; statementUpdate(); cardsUpdate(); hpinUpdate(); });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { hpinLayout(); onScroll(); });
  hpinLayout(); onScroll();
  document.fonts && document.fonts.ready.then(() => { hpinLayout(); onScroll(); });

  /* ================= Find your problem ================= */
  const PROBLEMS = [
    {
      tag: "Order & inventory management",
      title: "Move daily operations out of spreadsheets, with Tally kept in sync.",
      body: "We build an order and inventory system around your existing process, then integrate it with Tally so accounts stay accurate without re-entry.",
      build: "Order management · Inventory · Tally integration",
      work: "Neptune Marketing inventory & order management · Building Material Supply",
      need: "build",
      before: ["Excel order sheets", "WhatsApp orders", "Tally, typed by hand"],
      hub: "ORDER SYSTEM",
      after: ["Orders", "Live stock", "Tally sync"],
    },
    {
      tag: "Systems integration",
      title: "Connect the tools you already run so data moves on its own.",
      body: "We map where information is re-typed between systems, then connect them through integrations with Tally, SAP and your existing applications.",
      build: "Tally integration · SAP integration · Shared data layer",
      work: "Tally and SAP integration projects",
      need: "integrate",
      before: ["SAP", "Tally", "Custom app"],
      hub: "INTEGRATION",
      after: ["One customer record", "Synced invoices", "Shared reports"],
    },
    {
      tag: "Custom business systems",
      title: "Software that follows your process, instead of the other way round.",
      body: "When packaged software forces workarounds, we design a system around your rules, roles and approvals, built to grow with the business.",
      build: "Custom web application · Workflow · Dashboards",
      work: "Birla Task Management · Patient Token Management · RERA Document Management",
      need: "build",
      before: ["Packaged tool", "Workarounds", "Side spreadsheets"],
      hub: "YOUR RULES",
      after: ["Your workflow", "Role permissions", "Dashboards"],
    },
    {
      tag: "Modernisation",
      title: "Bring an ageing application onto a supported, modern platform.",
      body: "We assess what the current system does, keep the business rules that matter, and rebuild it on .NET with a clear migration plan.",
      build: "Assessment · .NET rebuild · Data migration",
      work: "Product enhancement and support engagements",
      need: "modernise",
      before: ["Legacy app", "Old database", "Few who know it"],
      hub: ".NET REBUILD",
      after: ["Supported platform", "Migrated data", "Documented rules"],
    },
  ];

  // Before → system → after diagram, drawn to match the hero's visual language
  const ppSvg = document.getElementById("pp-diagram");
  let ppRaf = 0;
  function drawDiagram(d) {
    cancelAnimationFrame(ppRaf);
    ppSvg.innerHTML = "";
    const add = (tag, attrs, parent = ppSvg) => el(tag, attrs, parent);
    add("text", { x: 20, y: 24, class: "col-t" }).textContent = "BEFORE";
    add("text", { x: 620, y: 24, "text-anchor": "end", class: "col-t" }).textContent = "AFTER";
    const ys = [52, 104, 156];
    const hub = { x: 252, y: 86, w: 136, h: 46 };
    const wires = [];
    ys.forEach((y, i) => {
      const p1 = add("path", { d: `M190 ${y + 16} C 225 ${y + 16}, 220 ${hub.y + 23}, ${hub.x} ${hub.y + 23}`, class: "wire in" });
      const p2 = add("path", { d: `M${hub.x + hub.w} ${hub.y + 23} C 420 ${hub.y + 23}, 415 ${y + 16}, 450 ${y + 16}`, class: "wire" });
      wires.push(p1, p2);
    });
    ys.forEach((y, i) => {
      add("rect", { x: 20, y, width: 170, height: 32, class: "b-box" });
      add("text", { x: 32, y: y + 20.5, class: "b-t" }).textContent = d.before[i];
      add("rect", { x: 450, y, width: 170, height: 32, class: "a-box" });
      add("rect", { x: 460, y: y + 13, width: 6, height: 6, class: "hub" });
      add("text", { x: 474, y: y + 20.5, class: "a-t" }).textContent = d.after[i];
    });
    add("rect", { x: hub.x, y: hub.y, width: hub.w, height: hub.h, class: "hub" });
    add("text", { x: hub.x + hub.w / 2, y: hub.y + 27.5, "text-anchor": "middle", class: "hub-t" }).textContent = d.hub;
    const dots = [0, 1, 2].map(() => add("circle", { r: 3, class: "dot" }));
    const outWires = wires.filter((_, i) => i % 2 === 1);
    const lens = wires.map((w) => w.getTotalLength());
    if (reduced) return;
    wires.forEach((w, i) => { w.style.strokeDasharray = w.classList.contains("in") ? "3 4" : `${lens[i]} ${lens[i]}`; if (!w.classList.contains("in")) w.style.strokeDashoffset = lens[i]; });
    const start = performance.now();
    const tickD = (now) => {
      const t = now - start;
      outWires.forEach((w, i) => {
        const k = ease(clamp((t - 200 - i * 120) / 600));
        w.style.strokeDashoffset = (lens[i * 2 + 1] * (1 - k)).toFixed(1);
      });
      dots.forEach((dot, i) => {
        const w = outWires[i];
        const s = ((t / 1600) + i * 0.33) % 1;
        const pt = w.getPointAtLength(lens[i * 2 + 1] * s);
        dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
        dot.style.opacity = t > 900 ? 1 : 0;
      });
      ppRaf = requestAnimationFrame(tickD);
    };
    ppRaf = requestAnimationFrame(tickD);
  }

  const tabs = [...document.querySelectorAll(".problem-tabs [role=tab]")];
  const panel = document.getElementById("panel-problem");
  const ppCta = document.getElementById("pp-cta");
  function selectTab(i, focus) {
    tabs.forEach((t, j) => {
      t.setAttribute("aria-selected", String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    const d = PROBLEMS[i];
    panel.setAttribute("aria-labelledby", tabs[i].id);
    document.getElementById("pp-tag").textContent = d.tag;
    document.getElementById("pp-title").textContent = d.title;
    document.getElementById("pp-body").textContent = d.body;
    document.getElementById("pp-build").textContent = d.build;
    document.getElementById("pp-work").textContent = d.work;
    ppSvg.setAttribute("aria-label", `Before: ${d.before.join(", ")}. After: ${d.after.join(", ")}.`);
    ppCta.dataset.need = d.need;
    drawDiagram(d);
    panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); selectTab((i + tabs.length - 1) % tabs.length, true); }
    });
  });
  drawDiagram(PROBLEMS[0]);
  ppCta.addEventListener("click", () => {
    const r = document.querySelector(`input[name=need][value="${ppCta.dataset.need}"]`);
    if (r) r.checked = true;
  });


  /* ================= Solutions index filter ================= */
  const solBtns = [...document.querySelectorAll(".chip-btn[data-filter]")];
  const sols = [...document.querySelectorAll(".sol")];
  solBtns.forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.filter;
    solBtns.forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", String(on)); });
    sols.forEach((s) => s.classList.toggle("is-dim", f !== "all" && s.dataset.sector !== f));
  }));

  /* ================= Enquiry form ================= */
  const form = document.getElementById("enquiry");
  const fsteps = [...form.querySelectorAll(".fstep")];
  const back = document.getElementById("f-back");
  const next = document.getElementById("f-next");
  const err = document.getElementById("form-error");
  const bar = document.getElementById("form-bar");
  const count = document.getElementById("step-count");
  let step = 0;

  function showStep(i) {
    step = i;
    fsteps.forEach((f, j) => f.classList.toggle("is-active", j === i));
    back.disabled = i === 0;
    next.innerHTML = i === fsteps.length - 1 ? "Send enquiry <span aria-hidden=\"true\">→</span>" : "Continue <span aria-hidden=\"true\">→</span>";
    bar.style.width = `${((i + 1) / fsteps.length) * 100}%`;
    count.textContent = `Step ${i + 1} / ${fsteps.length}`;
    err.textContent = "";
  }
  function validate(i) {
    const f = fsteps[i];
    if (i === 0 && !f.querySelector("input:checked")) return "Choose what you need to continue.";
    if (i === 2 && !f.querySelector("input[name=when]:checked")) return "Choose a rough start time to continue.";
    if (i === 3) {
      for (const id of ["f-name", "f-company", "f-email"]) {
        const inp = document.getElementById(id);
        if (!inp.value.trim()) { inp.focus(); return `Add your ${inp.closest("label").querySelector(".mono").textContent.toLowerCase()} to send the enquiry.`; }
      }
      const email = document.getElementById("f-email");
      if (!email.checkValidity()) { email.focus(); return "Enter a valid email address, like name@company.com."; }
    }
    return "";
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = validate(step);
    if (msg) { err.textContent = msg; return; }
    if (step < fsteps.length - 1) { showStep(step + 1); return; }
    fsteps.forEach((f) => f.classList.remove("is-active"));
    document.getElementById("form-nav").hidden = true;
    document.getElementById("form-done").hidden = false;
    bar.style.width = "100%";
    count.textContent = "Sent";
  });
  back.addEventListener("click", () => step > 0 && showStep(step - 1));

  document.getElementById("year").textContent = new Date().getFullYear();
})();
