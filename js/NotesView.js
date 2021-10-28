const noteColors = ["rgba(0,0,0,.3)", "#ECA2C4", "#FFF9B2", "#A0D786"];

export default class NotesView {
  constructor(
    root,
    { onNoteAdd, onNoteEdit, onNoteDelete, onNoteDragEnd } = {}
  ) {
    this.root = root;
    this.onNoteAdd = onNoteAdd;
    this.onNoteEdit = onNoteEdit;
    this.onNoteDelete = onNoteDelete;
    this.onNoteDragEnd = onNoteDragEnd;
    console.log("root", this.root);

    this.root.innerHTML = `
      <div class="col-label">
        <button class="add-note" type="button">+</button>
        <span><h4>Desirability</h4></span>
        <h4>Feasibility</h4>
        <h4>Viability</h4>
      </div>

      <div class="board">
        <div class="addzone" data-zone-id="0"></div>
        <div class="desirability" data-zone-id="1"></div>
        <div class="feasibility" data-zone-id="2"></div>
        <div class="viability" data-zone-id="3"></div>
      </div>
    `;

    this.zones = this.root.querySelectorAll(".board > *");
    const btnAddNote = this.root.querySelector(".col-label > .add-note");
    const notesContainer = this.root.querySelector(".addzone");

    this.zoneWidth = this.zones[1].clientWidth;
    console.log("zoneWidth:", this.zoneWidth);

    document.documentElement.style.setProperty(
      "--note-x",
      `${(this.zoneWidth - 30) / 2}px`
    );

    btnAddNote.addEventListener("click", () => {
      this.onNoteAdd();
    });
  }

  _createNoteItemHTML(id, content, zone) {
    return `
      <div class="note" 
            draggable="true" 
            data-note-id="${id}" 
            contenteditable="true" 
            style="background-color: ${noteColors[zone]}; overflow-y: auto;">
            ${content}
      </div>
    `;
  }

  addNoteElement(note) {
    const noteObject = this._createNoteItemHTML(
      note.id,
      note.content,
      note.zone
    );
    this.zones[note.zone].insertAdjacentHTML("beforeend", noteObject);

    const noteElements = this.zones[note.zone].querySelectorAll(".note");
    console.log("noteElements:", noteElements);
    noteElements.forEach((element) => {
      if (element.dataset.noteId == note.id) {
        console.log(element.dataset.noteId);
        resizeText(element);
        /* respond to input in contenteditable */
        element.addEventListener("input", () => {
          resizeText(element);
          this.onNoteEdit(element);
        });
        /* scroll to top of note on blur event */
        element.addEventListener("blur", () => {
          element.scrollTop = 0;
        });

        /* Ask to delete note on double-click */
        element.addEventListener("dblclick", () => {
          const doDelete = confirm(
            "Are you srue you want to delete this sticky note?"
          );
          if (doDelete) {
            this.onNoteDelete(element);
            this._deleteNote(element);
          }
        });

        element.addEventListener("dragstart", () => {
          element.classList.add("dragging");
        });

        element.addEventListener("dragend", () => {
          element.classList.remove("dragging");
          this.onNoteDragEnd(element);
        });
      }
    });
  }

  _deleteNote(element) {
    element.parentNode.removeChild(element);
  }

  updateNotes(notes) {
    notes.forEach((note) => {
      this.addNoteElement(note);
    });
  }
}

const isOverflown = ({ clientHeight, scrollHeight }) =>
  scrollHeight > clientHeight;

function resizeText(element) {
  let i = 20;
  const minSize = 12;
  if (!isOverflown(element)) {
    element.style.fontSize = "20px";
  }
  while (isOverflown(element) && i > minSize) {
    i -= 0.25;
    element.style.fontSize = `${i}px`;
  }
}
