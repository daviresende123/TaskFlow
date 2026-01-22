/* Elements references */
/* Screen transition logic elements */
const loginForm = document.getElementById("login-form");
const userGreeting = document.getElementById("user-greeting");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginScreen = document.querySelector(".card");
const usernameInput = document.getElementById("username");

/* CRUD elements */
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const taskInput = document.getElementById("task-input");
const taskPriority = document.getElementById("task-priority");

/* Function to handle the View Switching logic */
function displayDashboard(name) {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  userGreeting.textContent = `Welcome back, ${name}!`;
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

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
            <span>${task.text} <small>(${task.priority})</small></span>
            <div class="actions">
                <button onclick="toggleTask(${index})">✔</button>
                <button onclick="deleteTask(${index})" style="background: var(--status-high)">✖</button>
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
/* End of CRUD logic */
