/* ============================================================
   DETAIL CONTENT
   Keyed by node id. Populates the right-hand drawer on click.
   ============================================================ */
const DETAILS = {
  // ---------- C1 System Context ----------
  "c1-customer": {
    kind: "Person",
    title: "Customer",
    summary: "The shopper placing an order on the ecommerce platform. Every fraud signal ultimately traces back to their session, device, and payment method.",
    points: [
      "Interacts only with the Ecommerce Platform — never touches Fraud Decisioning directly.",
      "Experience risk: any added friction (extra verification, holds) directly affects conversion.",
      "Source of the raw behavioral and device signals fed into scoring."
    ]
  },
  "c1-ecommerce": {
    kind: "Software System",
    title: "Ecommerce Platform",
    summary: "The storefront, cart, and checkout experience. Owns the customer relationship and calls Fraud Decisioning synchronously before confirming an order.",
    points: [
      "Sends order context (cart, device, session) to Fraud Decisioning at checkout.",
      "Must handle three outcomes: approve, silently review, or block.",
      "Latency budget here is tight — scoring has to return in the checkout critical path."
    ]
  },
  "c1-fraud": {
    kind: "Software System — in scope for this role",
    title: "Fraud Decisioning",
    summary: "Scores every order in real time and routes it to approve, review, or reject. This is the system a Digital Fraud PM would own end to end.",
    points: [
      "Balances two competing product goals: minimize fraud loss, minimize false declines.",
      "Consumes signals from the platform and payment provider; produces a decision and a reason.",
      "Feeds a human-in-the-loop review queue for ambiguous cases."
    ]
  },
  "c1-payment": {
    kind: "External System",
    title: "Payment Provider",
    summary: "Third-party processor handling authorization, AVS/CVV checks, and chargeback notifications.",
    points: [
      "Fraud Decisioning queries it for payment-specific risk signals.",
      "Chargeback data flowing back is a key label source for model retraining.",
      "Outside the team's build scope — integration only."
    ]
  },
  "c1-order": {
    kind: "Software System",
    title: "Order Management",
    summary: "Owns fulfillment and the order lifecycle once a decision has been made.",
    points: [
      "Receives the final decision and either releases or holds fulfillment.",
      "Reversing a decision after this point is expensive — a shipped order can't be un-shipped.",
      "A natural place to measure downstream cost of false positives."
    ]
  },
  "c1-analyst": {
    kind: "Person",
    title: "Fraud Ops Analyst",
    summary: "Internal team member who manually resolves orders the system can't confidently decide on its own.",
    points: [
      "Works the Case Queue through the Fraud Ops Console.",
      "Their overrides are valuable labeled data for improving the model.",
      "Review capacity is a hard constraint on how aggressive the 'review' threshold can be."
    ]
  },

  // ---------- C2 Container ----------
  "c2-signal": {
    kind: "Container",
    title: "Signal Collection",
    summary: "Ingests raw events from the platform — device, session, and behavioral data — as soon as checkout begins.",
    points: [
      "Needs to be low-latency and resilient; it's on the critical checkout path.",
      "Normalizes inconsistent event schemas from web and app clients.",
      "Feeds the Feature Store rather than scoring directly."
    ]
  },
  "c2-feature": {
    kind: "Container",
    title: "Feature Store",
    summary: "Combines real-time signals with historical account and device history into model-ready features.",
    points: [
      "Serves both real-time scoring and offline model training from one source of truth.",
      "Feature drift here is a common, quiet cause of model performance decay.",
      "A key place product would define what data is even allowed to be used."
    ]
  },
  "c2-scoring": {
    kind: "Container",
    title: "Risk Scoring Service",
    summary: "Runs the ML model that turns features into a single risk score per order.",
    points: [
      "Model output is a probability, not a decision — routing logic lives in the Decision Engine.",
      "Needs shadow-mode deployment support to test new model versions safely.",
      "Score calibration directly determines review queue volume."
    ]
  },
  "c2-decision": {
    kind: "Container — in scope",
    title: "Decision Engine",
    summary: "Applies rules and score thresholds to route each order to approve, review, or reject.",
    points: [
      "Where product-defined risk tolerance actually gets encoded.",
      "Thresholds should be tunable per segment (e.g. new accounts vs. returning customers).",
      "Every decision needs a reason code for audit and explainability."
    ]
  },
  "c2-queue": {
    kind: "Container",
    title: "Case Queue",
    summary: "Holds orders routed to manual review, prioritized by risk and order value.",
    points: [
      "Queue depth is a leading indicator of whether thresholds are too conservative.",
      "SLA on review time directly affects customer-perceived delivery speed.",
      "Prioritization logic is itself a product decision, not just an engineering one."
    ]
  },
  "c2-console": {
    kind: "Container",
    title: "Fraud Ops Console",
    summary: "The internal tool analysts use to investigate and resolve queued cases.",
    points: [
      "Surfaces reason codes and evidence so analysts can decide quickly and consistently.",
      "Analyst decisions loop back as training labels for the scoring model.",
      "Console usability directly drives review throughput and analyst headcount needs."
    ]
  },
  "c2-approve": {
    kind: "Outcome",
    title: "Approve",
    summary: "Low-risk orders proceed straight to Order Management with no added friction.",
    points: ["The default, high-volume path.", "Optimizing this path's precision protects conversion."]
  },
  "c2-review": {
    kind: "Outcome",
    title: "Review",
    summary: "Medium-risk orders are held and routed to the Case Queue for a human decision.",
    points: ["Volume here is capacity-constrained by analyst headcount.", "The main lever product has to trade fraud loss against operating cost."]
  },
  "c2-reject": {
    kind: "Outcome",
    title: "Reject",
    summary: "High-risk orders are blocked automatically before fulfillment.",
    points: ["False positives here are the most customer-visible failure mode.", "Should always emit a clear, appealable reason to the customer."]
  },

  // ---------- C3 Component (Decision Engine) ----------
  "c3-rules": {
    kind: "Component",
    title: "Rule Evaluator",
    summary: "Applies deterministic, human-written fraud rules ahead of or alongside the model score.",
    points: [
      "Good for known fraud patterns that don't need a model — e.g. hard blocklists.",
      "Rules need versioning and rollback since they ship faster than model updates.",
      "Over-reliance on rules is a common anti-pattern that hides in plain sight."
    ]
  },
  "c3-threshold": {
    kind: "Component",
    title: "Threshold Manager",
    summary: "Maps risk scores to approve/review/reject cutoffs, configurable by segment.",
    points: [
      "The most direct lever for product to tune fraud-vs-friction trade-offs.",
      "Should support experimentation — different thresholds for different cohorts.",
      "Changes here need a fast feedback loop to see downstream impact."
    ]
  },
  "c3-mladapter": {
    kind: "Component",
    title: "ML Score Adapter",
    summary: "Calls the Risk Scoring Service and normalizes its output for the rest of the engine.",
    points: [
      "Isolates the Decision Engine from model versioning and API changes.",
      "Handles fallback behavior if the scoring service is slow or unavailable.",
      "A clean seam for running shadow models without affecting live decisions."
    ]
  },
  "c3-explain": {
    kind: "Component",
    title: "Explainability Service",
    summary: "Generates human-readable reason codes for every decision the engine makes.",
    points: [
      "Powers both the analyst console and any customer-facing decline messaging.",
      "Often a compliance requirement, not just a UX nicety.",
      "A model that can't explain itself is hard to trust operationally."
    ]
  },
  "c3-audit": {
    kind: "Component",
    title: "Audit Logger",
    summary: "Writes an immutable record of every decision, score, and rule that fired.",
    points: [
      "Required for dispute resolution and regulatory review.",
      "Also the raw material for measuring model and policy performance over time.",
      "Should log the 'why', not just the 'what'."
    ]
  },

  // ---------- Process view ----------
  "p-place": { kind: "Process step", title: "Places order", summary: "Customer completes checkout on the ecommerce platform.", points: ["Trigger for the entire fraud decisioning flow."] },
  "p-submit": { kind: "Process step", title: "Submits order for scoring", summary: "The platform calls Fraud Decisioning synchronously before confirming the order.", points: ["This call sits in the checkout critical path — latency matters."] },
  "p-collect": { kind: "Process step", title: "Collects signals", summary: "Device, account, payment, and behavioral signals are gathered for this order.", points: ["Handled by the Signal Collection and Feature Store containers."] },
  "p-score": { kind: "Process step", title: "Scores risk", summary: "The Risk Scoring Service returns a probability of fraud for this order.", points: ["A score, not a decision — routing happens next."] },
  "p-route": { kind: "Process step", title: "Routes decision", summary: "The Decision Engine applies rules and thresholds to pick approve, review, or reject.", points: ["The single place product-defined risk tolerance is enforced."] },
  "p-approve": { kind: "Branch outcome", title: "Approve", summary: "Order proceeds to fulfillment with no added friction.", points: ["The majority of orders should land here."] },
  "p-review": { kind: "Branch outcome", title: "Review", summary: "Order is held and placed in the Case Queue for manual resolution.", points: ["Bounded by analyst capacity."] },
  "p-reject": { kind: "Branch outcome", title: "Reject", summary: "Order is blocked automatically before it reaches fulfillment.", points: ["Should come with a clear, appealable reason."] },
  "p-analyst": { kind: "Process step", title: "Resolves reviewed cases", summary: "An analyst investigates queued orders in the Fraud Ops Console and makes the final call.", points: ["Their decisions become training data for future model versions."] },
  "p-fulfill": { kind: "Process step", title: "Fulfills or cancels order", summary: "Order Management acts on the final decision.", points: ["The last point at which a wrong decision is still cheap to reverse."] }
};

/* ============================================================
   CONNECTOR DEFINITIONS
   Each frame lists edges between two node ids, with an
   optional label and side to leave/enter from.
   ============================================================ */
const CONNECTORS = {
  "conn-c1": [
    { from: "c1-customer",  to: "c1-ecommerce", fromSide: "top",   toSide: "left",  label: "places order" },
    { from: "c1-ecommerce", to: "c1-fraud",      fromSide: "bottom",toSide: "top",   label: "sends order for scoring" },
    { from: "c1-fraud",     to: "c1-payment",    fromSide: "top",   toSide: "bottom",label: "checks payment signals" },
    { from: "c1-fraud",     to: "c1-order",      fromSide: "right", toSide: "left",  label: "returns decision" },
    { from: "c1-analyst",   to: "c1-fraud",      fromSide: "left",  toSide: "right", label: "reviews queued cases" }
  ],
  "conn-c2": [
    { from: "c2-signal",  to: "c2-feature",  fromSide: "top",   toSide: "left",   label: "" },
    { from: "c2-signal",  to: "c2-scoring",  fromSide: "bottom",toSide: "left",   label: "" },
    { from: "c2-feature", to: "c2-decision", fromSide: "right", toSide: "top",    label: "features" },
    { from: "c2-scoring", to: "c2-decision", fromSide: "right", toSide: "bottom", label: "risk score" },
    { from: "c2-decision",to: "c2-approve",  fromSide: "right", toSide: "left",   label: "" },
    { from: "c2-decision",to: "c2-review",   fromSide: "right", toSide: "left",   label: "" },
    { from: "c2-decision",to: "c2-reject",   fromSide: "right", toSide: "left",   label: "" },
    { from: "c2-review",  to: "c2-queue",    fromSide: "right", toSide: "left",   label: "" },
    { from: "c2-queue",   to: "c2-console",  fromSide: "bottom",toSide: "top",    label: "" },
    { from: "c2-console", to: "c2-decision", fromSide: "left",  toSide: "bottom", label: "override / retrain", dashed: true }
  ],
  "conn-c3": [
    { from: "c3-rules",     to: "c3-threshold", fromSide: "right", toSide: "left", label: "" },
    { from: "c3-threshold", to: "c3-mladapter", fromSide: "right", toSide: "left", label: "" },
    { from: "c3-mladapter", to: "c3-explain",   fromSide: "right", toSide: "left", label: "" },
    { from: "c3-explain",   to: "c3-audit",     fromSide: "right", toSide: "left", label: "" }
  ]
};

/* ============================================================
   PAN / ZOOM
   ============================================================ */
const viewport   = document.getElementById("viewport");
const canvasGrid = document.getElementById("canvasGrid");
const canvasInner= document.getElementById("canvasInner");
const zoomLevelEl= document.getElementById("zoomLevel");

let scale = 1;
let tx = 0;
let ty = 0;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.6;

function applyTransform(){
  canvasInner.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  canvasGrid.style.backgroundPosition = `${tx}px ${ty}px`;
  zoomLevelEl.textContent = Math.round(scale * 100) + "%";
}

function setZoom(newScale, pivotX, pivotY){
  newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
  // keep the point under the cursor stable while zooming
  const rect = viewport.getBoundingClientRect();
  const px = pivotX !== undefined ? pivotX - rect.left : rect.width / 2;
  const py = pivotY !== undefined ? pivotY - rect.top : rect.height / 2;
  const worldX = (px - tx) / scale;
  const worldY = (py - ty) / scale;
  scale = newScale;
  tx = px - worldX * scale;
  ty = py - worldY * scale;
  applyTransform();
}

// mouse drag to pan
let isPanning = false;
let panStartX = 0, panStartY = 0, txStart = 0, tyStart = 0;

viewport.addEventListener("mousedown", (e) => {
  if (e.target.closest(".node, .step-card, .branch")) return;
  isPanning = true;
  viewport.classList.add("is-panning");
  panStartX = e.clientX; panStartY = e.clientY;
  txStart = tx; tyStart = ty;
});
window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  tx = txStart + (e.clientX - panStartX);
  ty = tyStart + (e.clientY - panStartY);
  applyTransform();
});
window.addEventListener("mouseup", () => {
  isPanning = false;
  viewport.classList.remove("is-panning");
});

// touch pan
let touchStartX = 0, touchStartY = 0;
viewport.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 1) return;
  if (e.target.closest(".node, .step-card, .branch")) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  txStart = tx; tyStart = ty;
}, { passive: true });
viewport.addEventListener("touchmove", (e) => {
  if (e.touches.length !== 1) return;
  tx = txStart + (e.touches[0].clientX - touchStartX);
  ty = tyStart + (e.touches[0].clientY - touchStartY);
  applyTransform();
}, { passive: true });

// wheel to zoom
viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = -e.deltaY * 0.0015;
  setZoom(scale * (1 + delta), e.clientX, e.clientY);
}, { passive: false });

// zoom buttons
document.getElementById("zoomIn").addEventListener("click", () => setZoom(scale * 1.2));
document.getElementById("zoomOut").addEventListener("click", () => setZoom(scale / 1.2));
document.getElementById("zoomReset").addEventListener("click", () => {
  scale = 1; tx = 0; ty = 0; applyTransform();
});

applyTransform();

/* ============================================================
   CONNECTOR DRAWING
   Coordinates are read from each node's inline left/top/width/
   height, which live in the same untransformed local space as
   the frame — so this works correctly at any zoom level.
   ============================================================ */
function anchorPoint(node, side){
  const left = node.offsetLeft;
  const top = node.offsetTop;
  const w = node.offsetWidth;
  const h = node.offsetHeight;
  switch (side){
    case "top":    return { x: left + w / 2, y: top };
    case "bottom": return { x: left + w / 2, y: top + h };
    case "left":   return { x: left,         y: top + h / 2 };
    case "right":  return { x: left + w,     y: top + h / 2 };
    default:       return { x: left + w / 2, y: top + h / 2 };
  }
}

function drawConnectors(frameId, edges){
  const frame = document.getElementById(frameId.replace("conn-", "frame-"));
  const svg = document.getElementById(frameId);
  if (!frame || !svg) return;
  svg.innerHTML = "";

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  marker.innerHTML = `
    <marker id="arrow-${frameId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L6,3 L0,6 Z" fill="#B7BEDB"></path>
    </marker>`;
  svg.appendChild(marker);

  edges.forEach((edge) => {
    const fromNode = document.getElementById(edge.from);
    const toNode = document.getElementById(edge.to);
    if (!fromNode || !toNode) return;

    const p1 = anchorPoint(fromNode, edge.fromSide);
    const p2 = anchorPoint(toNode, edge.toSide);

    // simple orthogonal-ish curve via a smooth cubic bezier
    const dx = Math.max(Math.abs(p2.x - p1.x) * 0.5, 30);
    const dy = Math.max(Math.abs(p2.y - p1.y) * 0.5, 30);
    let c1x = p1.x, c1y = p1.y, c2x = p2.x, c2y = p2.y;
    if (edge.fromSide === "left" || edge.fromSide === "right") c1x += (edge.fromSide === "right" ? dx : -dx);
    else c1y += (edge.fromSide === "bottom" ? dy : -dy);
    if (edge.toSide === "left" || edge.toSide === "right") c2x += (edge.toSide === "right" ? -dx : dx);
    else c2y += (edge.toSide === "bottom" ? -dy : dy);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
    path.setAttribute("marker-end", `url(#arrow-${frameId})`);
    if (edge.dashed) path.classList.add("dashed");
    svg.appendChild(path);

    if (edge.label){
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", midX);
      text.setAttribute("y", midY - 6);
      text.setAttribute("text-anchor", "middle");
      text.textContent = edge.label;
      svg.appendChild(text);
    }
  });
}

function drawAllConnectors(){
  Object.keys(CONNECTORS).forEach((frameId) => drawConnectors(frameId, CONNECTORS[frameId]));
}

// draw once layout has settled, and redraw on resize
window.addEventListener("load", drawAllConnectors);
window.addEventListener("resize", drawAllConnectors);
setTimeout(drawAllConnectors, 50);

/* ============================================================
   DETAIL PANEL
   ============================================================ */
const detailPanel   = document.getElementById("detailPanel");
const detailKind    = document.getElementById("detailKind");
const detailTitle   = document.getElementById("detailTitle");
const detailSummary = document.getElementById("detailSummary");
const detailList    = document.getElementById("detailList");

function openDetail(id){
  const data = DETAILS[id];
  if (!data) return;
  detailKind.textContent = data.kind.toUpperCase();
  detailTitle.textContent = data.title;
  detailSummary.textContent = data.summary;
  detailList.innerHTML = "";
  (data.points || []).forEach((pt) => {
    const li = document.createElement("li");
    li.textContent = pt;
    detailList.appendChild(li);
  });
  detailPanel.classList.add("is-open");
  detailPanel.setAttribute("aria-hidden", "false");
}

function closeDetail(){
  detailPanel.classList.remove("is-open");
  detailPanel.setAttribute("aria-hidden", "true");
}

document.getElementById("detailClose").addEventListener("click", closeDetail);

document.querySelectorAll("[id]").forEach((el) => {
  if (DETAILS[el.id] && (el.classList.contains("node") || el.classList.contains("step-card") || el.classList.contains("branch"))){
    el.addEventListener("click", () => openDetail(el.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openDetail(el.id);
      }
    });
  }
});

/* ============================================================
   SIDEBAR NAVIGATION — pan the canvas to a given frame
   ============================================================ */
const navButtons = document.querySelectorAll(".frame-nav-btn");

function goToFrame(frameId){
  const frame = document.getElementById(frameId);
  if (!frame) return;
  const rect = viewport.getBoundingClientRect();

  // frame position in canvasInner's local (unscaled) space
  const targetScale = Math.min(1, MAX_SCALE);
  const localLeft = frame.offsetLeft;
  const localTop = frame.offsetTop;
  const localW = frame.offsetWidth || 600;
  const localH = frame.offsetHeight || 400;

  scale = targetScale;
  tx = rect.width / 2 - (localLeft + localW / 2) * scale;
  ty = rect.height / 2 - (localTop + localH / 2) * scale;
  applyTransform();

  navButtons.forEach((b) => b.classList.remove("is-active"));
  const activeBtn = document.querySelector(`.frame-nav-btn[data-target="${frameId}"]`);
  if (activeBtn) activeBtn.classList.add("is-active");
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => goToFrame(btn.dataset.target));
});

// land on the System Context frame by default, once layout settles
setTimeout(() => goToFrame("frame-c1"), 60);

/* ============================================================
   LEGEND TOGGLE
   ============================================================ */
const legendToggle = document.getElementById("legendToggle");
const legendPanel = document.getElementById("legendPanel");

legendToggle.addEventListener("click", () => {
  const isOpen = legendPanel.classList.toggle("is-open");
  legendToggle.classList.toggle("is-active", isOpen);
  legendToggle.setAttribute("aria-expanded", String(isOpen));
  legendPanel.setAttribute("aria-hidden", String(!isOpen));
});

/* ============================================================
   ESC to close detail panel / legend
   ============================================================ */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape"){
    closeDetail();
    legendPanel.classList.remove("is-open");
    legendToggle.classList.remove("is-active");
    legendToggle.setAttribute("aria-expanded", "false");
  }
});
