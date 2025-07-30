const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const undoDiv = document.getElementById("undoDiv");
const modal = document.getElementById("confirmModal");

let lastDeletedTask = null;
let undoTimeout = null;

window.onload = () => {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task =>
    createTask(task.text, task.done, task.createdAt, task.completedAt)
  );
  if (localStorage.getItem("mode") === "light") {
    document.body.classList.add("light-mode");
  }
};

function addTask() {
  const taskText = taskInput.value.trim();
  if (!taskText) return alert("Please enter a task!");
  createTask(taskText);
  saveToLocalStorage();
  taskInput.value = "";
}

function createTask(text, done = false, createdAt = new Date().toISOString(), completedAt = "") {
  const li = document.createElement("li");
  if (done) li.classList.add("done");

  const formattedCreated = new Date(createdAt).toLocaleString();
  const formattedCompleted = completedAt ? `<br><small>✅ Completed: ${new Date(completedAt).toLocaleString()}</small>` : "";

  li.innerHTML = `
    <div>
      <span onclick="toggleDone(this)">${text}</span><br>
      <small>🕒 Created: ${formattedCreated}</small>
      ${formattedCompleted}
    </div>
    <button class="delete-btn" onclick="deleteTask(this)">Delete</button>
  `;
  li.setAttribute("data-created", createdAt);
  li.setAttribute("data-completed", completedAt || "");
  taskList.appendChild(li);
}

function toggleDone(el) {
  const li = el.closest("li");
  li.classList.toggle("done");

  const completedAt = li.classList.contains("done") ? new Date().toISOString() : "";
  li.setAttribute("data-completed", completedAt);

  const createdTime = new Date(li.getAttribute("data-created")).toLocaleString();
  const text = el.textContent;

  li.querySelector("div").innerHTML = `
    <span onclick="toggleDone(this)">${text}</span><br>
    <small>🕒 Created: ${createdTime}</small>
    ${completedAt ? `<br><small>✅ Completed: ${new Date(completedAt).toLocaleString()}</small>` : ""}
  `;

  saveToLocalStorage();
}

function deleteTask(btn) {
  const li = btn.parentElement;
  lastDeletedTask = {
    text: li.querySelector("span").textContent,
    done: li.classList.contains("done"),
    createdAt: li.getAttribute("data-created"),
    completedAt: li.getAttribute("data-completed")
  };
  li.remove();
  saveToLocalStorage();
  showUndoButton();
}

function saveToLocalStorage() {
  const tasks = [];
  taskList.querySelectorAll("li").forEach(li => {
    tasks.push({
      text: li.querySelector("span").textContent,
      done: li.classList.contains("done"),
      createdAt: li.getAttribute("data-created"),
      completedAt: li.getAttribute("data-completed")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showUndoButton() {
  undoDiv.innerHTML = `<button id="undoBtn">Undo Delete</button>`;
  document.getElementById("undoBtn").addEventListener("click", () => {
    if (lastDeletedTask) {
      createTask(
        lastDeletedTask.text,
        lastDeletedTask.done,
        lastDeletedTask.createdAt,
        lastDeletedTask.completedAt
      );
      saveToLocalStorage();
      lastDeletedTask = null;
    }
    undoDiv.innerHTML = "";
    clearTimeout(undoTimeout);
  });

  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => {
    undoDiv.innerHTML = "";
    lastDeletedTask = null;
  }, 5000);
}

function toggleMode() {
  document.body.classList.toggle("light-mode");
  const mode = document.body.classList.contains("light-mode") ? "light" : "dark";
  localStorage.setItem("mode", mode);
}

function filterTasks(type) {
  const allTasks = document.querySelectorAll("#taskList li");
  allTasks.forEach(task => {
    const isDone = task.classList.contains("done");
    task.style.display =
      type === "all" ||
      (type === "done" && isDone) ||
      (type === "pending" && !isDone)
        ? "flex"
        : "none";
  });
}

function showModal() {
  modal.style.display = "flex";
}

function hideModal() {
  modal.style.display = "none";
}

function deleteAllTasks() {
  taskList.innerHTML = "";
  localStorage.removeItem("tasks");
  undoDiv.innerHTML = "";
  modal.style.display = "none";
}

document.getElementById("taskInput").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addTask();
  }
});
