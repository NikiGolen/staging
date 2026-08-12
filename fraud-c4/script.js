const canvasWrapper = document.getElementById("canvasWrapper");
const canvas = document.getElementById("canvas");

const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");
const resetButton = document.getElementById("resetView");

const zoomLevel = document.getElementById("zoomLevel");

const infoPanel = document.getElementById("infoPanel");
const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");
const closePanel = document.getElementById("closePanel");


/* --------------------------------
   CANVAS STATE
-------------------------------- */

let scale = 1;

let offsetX = 0;
let offsetY = 0;

let isDragging = false;

let startX = 0;
let startY = 0;


/* --------------------------------
   UPDATE CANVAS
-------------------------------- */

function updateCanvas() {

  canvas.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

  zoomLevel.textContent =
    `${Math.round(scale * 100)}%`;
}


/* --------------------------------
   ZOOM
-------------------------------- */

function zoom(amount) {

  scale += amount;

  scale = Math.max(
    0.5,
    Math.min(2, scale)
  );

  updateCanvas();
}


zoomInButton.addEventListener(
  "click",
  () => zoom(0.1)
);


zoomOutButton.addEventListener(
  "click",
  () => zoom(-0.1)
);


/* --------------------------------
   RESET
-------------------------------- */

resetButton.addEventListener(
  "click",
  () => {

    scale = 1;

    offsetX = 0;
    offsetY = 0;

    updateCanvas();

  }
);


/* --------------------------------
   MOUSE WHEEL ZOOM
-------------------------------- */

canvasWrapper.addEventListener(
  "wheel",
  (event) => {

    event.preventDefault();

    if (event.deltaY < 0) {
      zoom(0.05);
    } else {
      zoom(-0.05);
    }

  },
  { passive: false }
);


/* --------------------------------
   PAN
-------------------------------- */

canvasWrapper.addEventListener(
  "mousedown",
  (event) => {

    // Don't pan when clicking a node
    if (event.target.closest(".node")) {
      return;
    }

    isDragging = true;

    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;

  }
);


window.addEventListener(
  "mousemove",
  (event) => {

    if (!isDragging) {
      return;
    }

    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;

    updateCanvas();

  }
);


window.addEventListener(
  "mouseup",
  () => {

    isDragging = false;

  }
);


/* --------------------------------
   NODE INFORMATION
-------------------------------- */

const nodes =
  document.querySelectorAll(".node");


nodes.forEach(node => {

  node.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      const title =
        node.dataset.title;

      const description =
        node.dataset.description;

      if (!title) {
        return;
      }

      panelTitle.textContent =
        title;

      panelDescription.textContent =
        description;

      infoPanel.classList.add(
        "visible"
      );

    }
  );

});


/* --------------------------------
   CLOSE INFO PANEL
-------------------------------- */

closePanel.addEventListener(
  "click",
  () => {

    infoPanel.classList.remove(
      "visible"
    );

  }
);


/* --------------------------------
   INITIALIZE
-------------------------------- */

updateCanvas();
