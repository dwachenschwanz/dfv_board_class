// console.log("In script.js");
const noteColors = ["rgba(0,0,0,.3)", "#ECA2C4", "#A0D786", "#FFF9B2"];

const zones = document.querySelectorAll(".board > *");
const addNoteButton = document.querySelector(".col-label > .add-note");
const notesContainer = document.querySelector(".addzone");

const zoneWidth = zones[1].clientWidth;

console.log(zoneWidth);

let root = document.documentElement;

root.style.setProperty("--note-x", `${(zoneWidth - 30) / 2}px`);

addNoteButton.addEventListener("click", () => addNote());

function createNoteElement(id, content, zone) {
  //   const element = document.createElement("textarea");
  const element = document.createElement("div");

  element.classList.add("note");
  //   element.setAttribute(‘id’,‘myNote’);
  // element.setAttribute('id',"test")
  element.setAttribute("draggable", "true");
  element.id = id;

  element.innerText = content;
  // element.value = content;
  // element.placeholder = "Empty Sticky Note";
  element.contentEditable = true;
  // element.style.backgroundColor = "#f33c61";
  element.style.backgroundColor = "rgba(0,0,0,.3)";
  element.style.overflowY = "auto";

  element.addEventListener("input", function () {
    // console.log(element.innerText);
    resizeText(element);
    updateNote(id, element.innerText, zone);
  });()()

  element.addEventListener("blur", () => {
    console.log("blur");
    element.scrollTop = 0;
  });

  element.addEventListener("change", () => {
    // updateNote(id, element.value);
    // console.log(id, element.value);
    element.scrollTop = 0;
  });

  element.addEventListener("dblclick", () => {
    const doDelete = confirm(
      "Are you sure you wish to delete this sticky note?"
    );

    if (doDelete) {
      console.log(id, element.innerText);
      deleteNote(id, element);
    }
  });

  element.addEventListener("dragstart", () => {
    element.classList.add("dragging");
  });

  element.addEventListener("dragend", () => {
    element.classList.remove("dragging");
  });

  return element;
}

// getNotes().forEach((note) => {
//   const noteElement = createNoteElement(note.id, note.content);
//   console.log(noteElement);
// });

function getNotes() {
  return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}

getNotes().forEach((note) => {
  console.log(note.id, note.content);
  const noteElement = createNoteElement(note.id, note.content, note.zone);
  notesContainer.appendChild(noteElement);
});

function saveNotes(notes) {
  localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

function addNote() {
  console.log("Add note pushed");
  const notes = getNotes();
  const noteObject = {
    id: Math.floor(Math.random() * 100000),
    content: "",
    zone: 0,
  };
  const noteElement = createNoteElement(
    noteObject.id,
    noteObject.content,
    noteObject.zone
  );
  notesContainer.appendChild(noteElement);
  notes.push(noteObject);
  saveNotes(notes);
}

function updateNote(id, newContent, zone) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id == id)[0];

  targetNote.content = newContent;
  targetNote.zone = zone;
  saveNotes(notes);
}

function deleteNote(id, element) {
  const selectedNote = getNotes().filter((note) => note.id == id);
  const notes = getNotes().filter((note) => note.id != id);

  console.log("selectedNote", selectedNote);
  console.log("element", element.parentNode);

  saveNotes(notes);
  element.parentNode.removeChild(element);
  // console.log(element);
  // zones[selectedNote.zone].removeChild(element);
  // notesContainer.removeChild(element);
}

const isOverflown = ({ clientHeight, scrollHeight }) =>
  scrollHeight > clientHeight;

function resizeText(element) {
  let i = 20;
  const minSize = 12;
  if (!isOverflown(element)) {
    element.style.fontSize = "20px";
  }
  // element.style.fontSize = `${i}px;
  while (isOverflown(element) && i > minSize) {
    i -= 0.25;
    element.style.fontSize = `${i}px`;
  }
}

zones.forEach((container, index) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    draggable.style.backgroundColor = noteColors[index];
    updateNote(draggable.id, draggable.innerText, index);
    console.log(index);
    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
