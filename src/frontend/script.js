document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("dynamicTable");
  const addRowButton = document.getElementById("addRow");
  const undoButton = document.getElementById("undo");
  const redoButton = document.getElementById("redo");

  class Command {
    redo() {}
    undo() {}
  }

  class AddRowCommand extends Command {
    constructor(table) {
      super();
      this.table = table;
      this.rowIndex = this.table.rows.length;
      this.row = this.createRow();
    }

    createRow() {
      const newRow = this.table.insertRow();
      for (let i = 0; i < 3; i++) {
        const cell = newRow.insertCell();
        const boxId = `box${this.rowIndex + 1}${i + 1}`;
        const boxValue = (this.rowIndex * 3 + i + 1) * 100;
        const box = createBox(boxId, boxValue);
        cell.appendChild(box);
      }
      return newRow;
    }

    redo() {
      this.table.appendChild(this.row);
    }

    undo() {
      this.table.deleteRow(this.rowIndex);
    }
  }

  class SwapBoxesCommand extends Command {
    constructor(sourceCell, targetCell) {
      super();
      this.sourceCell = sourceCell;
      this.targetCell = targetCell;
      this.sourceBox = sourceCell.firstElementChild;
      this.targetBox = targetCell.firstElementChild;
    }

    redo() {
      this.targetCell.appendChild(this.sourceBox);
      this.sourceCell.appendChild(this.targetBox);
    }

    undo() {
      this.sourceCell.appendChild(this.sourceBox);
      this.targetCell.appendChild(this.targetBox);
    }
  }

  const history = [];
  let future = [];

  function executeCommand(action) {
    action.redo();
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
    executeCommand(new AddRowCommand(table));
  });

  undoButton.addEventListener("click", undoAction);
  redoButton.addEventListener("click", redoAction);

  let draggedElement = null;

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
    if (!targetCell || targetCell === draggedElement.parentElement) return;

    executeCommand(new SwapBoxesCommand(draggedElement.parentElement, targetCell));
    draggedElement = null;
  });

  table.addEventListener("dragend", (e) => {
    if (e.target.className !== "box") return;
    e.target.style.opacity = 1;
    draggedElement = null;
  });

  table.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  }
});
