let lastDeletedTask = null; // For undo

// Load tasks when page loads
window.onload = function() {
  renderTasks();
};

// Add a new task
function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();

  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  const newTask = {
    text: taskText,
    completed: false
  };

  let tasks = getTasksFromStorage();
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  input.value = "";
  renderTasks();
}

// Display tasks
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const tasks = getTasksFromStorage();

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    li.className = task.completed ? "completed" : "";

    // Toggle completion
    li.onclick = () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasksToStorage(tasks);
      renderTasks();
    };

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation(); // prevent toggling when deleting
      lastDeletedTask = tasks[index]; // store for undo
      tasks.splice(index, 1);
      saveTasksToStorage(tasks);
      renderTasks();
    };

    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

// Undo the last delete
function undoDelete() {
  if (lastDeletedTask) {
    let tasks = getTasksFromStorage();
    tasks.push(lastDeletedTask);
    saveTasksToStorage(tasks);
    lastDeletedTask = null;
    renderTasks();
  } else {
    alert("No task to undo.");
  }
}

// Delete all tasks with confirmation
function deleteAllTasks() {
  const confirmDelete = confirm("Are you sure you want to delete ALL tasks?");
  if (confirmDelete) {
    localStorage.removeItem("tasks");
    lastDeletedTask = null;
    renderTasks();
  }
}

// Helpers
function getTasksFromStorage() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
