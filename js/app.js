import NotesView from "./NotesView.js";
import NotesAPI from "./NotesAPI.js";

const noteColors = ["rgba(0,0,0,.3)", "#ECA2C4", "#FFF9B2", "#A0D786"];

export default class App {
  constructor(root) {
    console.log("Starting App...");
    this.notes = [];
    this.view = new NotesView(root, this._handlers());
    this._refreshNotes();

    this.view.zones.forEach((container, index) => {
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY, e);
        // console.log("after:", afterElement);
        const draggable = document.querySelector(".dragging");
        draggable.style.backgroundColor = noteColors[index];
        // console.log("dragging: ", draggable);
        // const updatedNote = {
        //   id: draggable.id,
        //   content: draggable.innerText,
        //   zone: index,
        // };
        // NotesAPI.saveNote(updatedNote);
        // updateNote(draggable.id, draggable.innerText, index);
        // console.log(index);
        if (afterElement == null) {
          container.appendChild(draggable);
        } else {
          container.insertBefore(draggable, afterElement);
        }
      });
    });
  }

  _refreshNotes() {
    const notes = NotesAPI.getAllNotes();
    console.log(notes);

    this._setNotes(notes);
  }

  _setNotes(notes) {
    this.notes = notes;
    this.view.updateNotes(notes);
  }

  _handlers() {
    return {
      onNoteAdd: () => {
        console.log("Add note");
        const newNote = {
          id: Math.floor(Math.random() * 1000000),
          content: "",
          zone: 0,
        };
        NotesAPI.saveNote(newNote);
        this.view.addNoteElement(newNote);
        // this._refreshNotes();
      },
      onNoteEdit: (element) => {
        // resizeText(element);
        const notes = NotesAPI.getAllNotes();
        const targetNote = notes.filter(
          (note) => note.id == element.dataset.noteId
        )[0];
        targetNote.content = element.innerText;
        NotesAPI.saveNote(targetNote);
      },
      onNoteDelete: (element) => {
        NotesAPI.deleteNote(element.dataset.noteId);
        // this.view.deleteNote(element);
      },
      onNoteDragEnd: (element) => {
        console.log("End of Drag");
        console.log(element.dataset.noteId, element.parentNode);
        console.log(element.innerText);
        const updatedNote = {
          id: element.dataset.noteId,
          content: element.innerText,
          zone: element.parentNode.dataset.zoneId,
        };
        NotesAPI.saveNote(updatedNote);
      },
    };
  }
}

function getDragAfterElement(container, y, e) {
  // const draggableElements = [
  //   ...container.querySelectorAll(".draggable:not(.dragging)"),
  // ];
  const draggableElements = [...container.querySelectorAll(":not(.dragging)")];
  // console.log("e", e);
  // console.log("container", container.querySelectorAll(":not(.dragging)"));
  // console.log("draggableElements:", draggableElements);
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      console.log("offset:", offset, "y:", y);
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
