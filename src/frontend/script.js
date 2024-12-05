document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("dynamicTable");
  const addRowButton = document.getElementById("addRow");
  const undoButton = document.getElementById("undo");
  const redoButton = document.getElementById("redo");

  const history = [];
  let future = [];

  function saveState(action) {
    history.push(action);
    future = [];
  }

  function undoAction() {
    if (!history.length) return;
    const lastAction = history.pop();
    lastAction.undo();
    future.push(lastAction);
  }

  function redoAction() {
    if (!future.length) return;
    const lastUndone = future.pop();
    lastUndone.redo();
    history.push(lastUndone);
  }

  (function () {
    const tbody = table.querySelector("tbody");
    for (let i = 1; i <= 3; i++) {
      const row = document.createElement("tr");
      for (let j = 1; j <= 3; j++) {
        const cell = document.createElement("td");
        const boxId = `box${i}${j}`;
        const boxValue = j * i * 100;
        const box = createBox(boxId, boxValue);
        cell.appendChild(box);
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
  })();

  function createBox(id, value) {
    const box = document.createElement("div");
    box.className = "box";
    box.draggable = true;
    box.id = id;
    box.dataset.id = value;
    box.style.backgroundColor = getRandomColor();
    box.textContent = value;
    return box;
  }

  addRowButton.addEventListener("click", () => {
    const rowCount = table.rows.length;
    const newRow = table.insertRow();
    for (let i = 0; i < 3; i++) {
      const cell = newRow.insertCell();
      const boxId = `box${rowCount + 1}${i + 1}`;
      const boxValue = (rowCount * 3 + i + 1) * 100;
      const box = createBox(boxId, boxValue);
      cell.appendChild(box);
    }
    saveState({
      undo: () => table.deleteRow(rowCount),
      redo: () => addRowButton.click(),
    });
  });

  undoButton.addEventListener("click", undoAction);
  redoButton.addEventListener("click", redoAction);

  table.addEventListener("dragstart", (e) => {
    if (e.target.className !== "box") return;
    draggedElement = e.target;
    e.dataTransfer.setData("text", e.target.id);
    setTimeout(() => (e.target.style.opacity = 0), 0);
  });

  table.addEventListener("drop", (e) => {
    e.preventDefault();

    if (!draggedElement) return;

    const targetCell = e.target.closest("td");
    if (!targetCell) return;

    const sourceCell = draggedElement.parentElement;
    if (sourceCell === targetCell) {
      draggedElement = null;
      return;
    }

    const destinationBox = targetCell.firstElementChild;

    const fragment = new DocumentFragment();
    fragment.appendChild(draggedElement);
    sourceCell.appendChild(destinationBox);
    targetCell.appendChild(fragment);

    const cachedSource = sourceCell;
    const cachedDest = targetCell;
    const cachedDraggedBox = draggedElement;
    const cachedDestBox = destinationBox;

    saveState({
      undo: () => {
        cachedSource.appendChild(cachedDraggedBox);
        cachedDest.appendChild(cachedDestBox);
      },
      redo: () => {
        cachedDest.appendChild(cachedDraggedBox);
        cachedSource.appendChild(cachedDestBox);
      },
    });

    draggedElement = null;
  });

  table.addEventListener("dragend", (e) => {
    if (e.target.className !== "box") return;
    e.target.style.opacity = 1;
    draggedElement = null;
  });

  let lastDragOverTarget = null;
  table.addEventListener("dragover", (e) => {
    e.preventDefault();

    const currentTarget = e.target.closest("td");
    if (currentTarget && currentTarget !== lastDragOverTarget) {
      lastDragOverTarget = currentTarget;
      e.dataTransfer.dropEffect = "move";
    }
  });

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  }

  initializeTable();
});
