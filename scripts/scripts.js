/* Elements references */
/* Screen transition logic elements */
const loginForm = document.getElementById("login-form");
const userGreeting = document.getElementById("user-greeting");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginScreen = document.querySelector(".card");
const usernameInput = document.getElementById("username");
const logoutBtn = document.getElementById("logout-btn");

/* CRUD elements */
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const taskInput = document.getElementById("task-input");
const taskPriority = document.getElementById("task-priority");

/* Function to handle the View Switching logic */
function displayDashboard(name) {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  userGreeting.textContent = `Welcome, ${name}!`;
}

/* Check LocalStorage on page load */
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("taskflow_user");

  if (savedName) {
    displayDashboard(savedName);
  }
});

/* Screen transition logic */

/* Event listener for the login form */
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userName = usernameInput.value.trim();

  if (userName !== "") {
    /* Save name to LocalStorage */
    localStorage.setItem("taskflow_user", userName);

    /* Update UI */
    displayDashboard(userName);
  }
});
/* End of screen transition logic */

/* CRUD Logic */
/* Task State */
let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];

/* Function to render tasks in the UI */
function renderTasks() {
  taskList.innerHTML = "";

  /* Get values from the filter selects */
  const priorityFilter = document.getElementById("filter-priority").value;
  const sortOrder = document.getElementById("sort-order").value;

  /* Create a modified copy of the array */
  let displayTasks = [...tasks];

  /* Apply filters */
  if (priorityFilter === "completed") {
    displayTasks = displayTasks.filter((t) => t.completed);
  } else {
    displayTasks = displayTasks.filter((t) => !t.completed);

    if (priorityFilter !== "all") {
      displayTasks = displayTasks.filter((t) => t.priority === priorityFilter);
    }
  }

  /* Apply sorting */
  if (sortOrder === "newest") {
    displayTasks.reverse(); // Standard is oldest (index 0)
  } else if (sortOrder === "priority") {
    const weights = { high: 3, medium: 2, low: 1 };
    displayTasks.sort((a, b) => weights[b.priority] - weights[a.priority]);
  }

  /* Render the list */
  displayTasks.forEach((task) => {
    const originalIndex = tasks.indexOf(task);

    const li = document.createElement("li");
    li.setAttribute("id", `task-item-${originalIndex}`);
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
            <div class="task-info">
                <span class="priority-dot dot-${task.priority}"></span>
                <span>${task.text}</span>
            </div>
            <div class="actions">
                <button class="action-btn complete" onclick="toggleTask(${originalIndex})">✔</button>
                <button class="action-btn edit" onclick="editTask(${originalIndex})" title="Edit">✏️</button>
                <button class="action-btn delete" onclick="deleteTask(${originalIndex})">✖</button>
            </div>
        `;

    taskList.appendChild(li);
  });

  localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

/* Add Task */
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    text: taskInput.value,
    priority: taskPriority.value,
    completed: false,
  };

  tasks.push(newTask);
  taskInput.value = "";
  renderTasks();
});

/* Toggle Complete */
window.toggleTask = (index) => {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
};

/* Delete Task */
window.deleteTask = (index) => {
  tasks.splice(index, 1);
  renderTasks();
};

/* Update your existing DOMContentLoaded to also call renderTasks() */
window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("taskflow_user");
  if (savedName) {
    displayDashboard(savedName);
    renderTasks(); /* Render the list if user is logged in */
  }
});

/* Edit task logic */
window.editTask = (index) => {
  const li = document.getElementById(`task-item-${index}`);
  const task = tasks[index];

  li.innerHTML = `
        <div class="task-edit-container">
            <input type="text" id="edit-text-${index}" value="${task.text}" class="edit-input">
            <select id="edit-priority-${index}" class="edit-select">
                <option value="low" ${task.priority === "low" ? "selected" : ""}> Low</option>
                <option value="medium" ${task.priority === "medium" ? "selected" : ""}> Medium</option>
                <option value="high" ${task.priority === "high" ? "selected" : ""}> High</option>
            </select>
        </div>
        <div class="actions">
            <button class="action-btn save" onclick="saveTask(${index})">💾</button>
            <button class="action-btn" onclick="renderTasks()">✕</button>
        </div>
    `;
};

/* Save Edited Task */
window.saveTask = (index) => {
  const newText = document.getElementById(`edit-text-${index}`).value;
  const newPriority = document.getElementById(`edit-priority-${index}`).value;

  if (newText.trim() !== "") {
    tasks[index].text = newText;
    tasks[index].priority = newPriority;
    renderTasks(); // Refresh UI and Save to LocalStorage
  }
};
/* End of CRUD logic */

/* Logout logic */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("taskflow_user");

  window.location.reload();
});
/* End of logout loginc */
