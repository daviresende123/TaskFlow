/* ===================================
   CONSTANTS & CONFIGURATION
   =================================== */
const CONFIG = {
  STORAGE_KEYS: {
    USER: "taskflow_user",
    TASKS: "taskflow_tasks",
  },
  VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 21,
    MAX_TASK_LENGTH: 50,
  },
  PRIORITY_WEIGHTS: {
    high: 3,
    medium: 2,
    low: 1,
  },
};

/* ===================================
   DOM ELEMENTS
   =================================== */
const DOM = {
  // Screen elements
  loginForm: document.getElementById("login-form"),
  loginScreen: document.querySelector(".card"),
  dashboardScreen: document.getElementById("dashboard-screen"),
  userGreeting: document.getElementById("user-greeting"),
  usernameInput: document.getElementById("username"),
  logoutBtn: document.getElementById("logout-btn"),

  // Task elements
  taskForm: document.getElementById("task-form"),
  taskList: document.getElementById("task-list"),
  taskInput: document.getElementById("task-input"),
  taskPriority: document.getElementById("task-priority"),
  filterPriority: document.getElementById("filter-priority"),
  sortOrder: document.getElementById("sort-order"),
};

/* ===================================
   STORAGE UTILITIES
   =================================== */
const Storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return key === CONFIG.STORAGE_KEYS.TASKS ? JSON.parse(item) || [] : item;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return key === CONFIG.STORAGE_KEYS.TASKS ? [] : null;
    }
  },

  set(key, value) {
    try {
      const data = typeof value === "object" ? JSON.stringify(value) : value;
      localStorage.setItem(key, data);
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },
};

/* ===================================
   INPUT VALIDATION UTILITIES
   =================================== */
const Validation = {
  sanitizeText(text, maxLength) {
    return text.replace(/\s\s+/g, " ").substring(0, maxLength);
  },

  sanitizeName(name) {
    return name
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
      .replace(/\s\s+/g, " ")
      .substring(0, CONFIG.VALIDATION.MAX_NAME_LENGTH);
  },

  isValidName(name) {
    return name.trim().length >= CONFIG.VALIDATION.MIN_NAME_LENGTH;
  },

  isValidTask(text) {
    return text.trim().length > 0;
  },
};

/* ===================================
   TASK STATE MANAGEMENT
   =================================== */
const TaskManager = {
  tasks: [],

  init() {
    this.tasks = Storage.get(CONFIG.STORAGE_KEYS.TASKS);
  },

  save() {
    Storage.set(CONFIG.STORAGE_KEYS.TASKS, this.tasks);
  },

  add(text, priority) {
    const newTask = {
      text: text.trim(),
      priority,
      completed: false,
    };
    this.tasks.push(newTask);
    this.save();
  },

  update(index, text, priority) {
    if (this.tasks[index]) {
      this.tasks[index].text = text.substring(
        0,
        CONFIG.VALIDATION.MAX_TASK_LENGTH,
      );
      this.tasks[index].priority = priority;
      this.save();
    }
  },

  toggle(index) {
    if (this.tasks[index]) {
      this.tasks[index].completed = !this.tasks[index].completed;
      this.save();
    }
  },

  delete(index) {
    this.tasks.splice(index, 1);
    this.save();
  },

  getFiltered(priorityFilter) {
    if (priorityFilter === "completed") {
      return this.tasks.filter((t) => t.completed);
    }

    let filtered = this.tasks.filter((t) => !t.completed);

    if (priorityFilter !== "all") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    return filtered;
  },

  getSorted(tasks, sortOrder) {
    const tasksCopy = [...tasks];

    switch (sortOrder) {
      case "newest":
        return tasksCopy.reverse();
      case "priority":
        return tasksCopy.sort(
          (a, b) =>
            CONFIG.PRIORITY_WEIGHTS[b.priority] -
            CONFIG.PRIORITY_WEIGHTS[a.priority],
        );
      default:
        return tasksCopy;
    }
  },
};

/* ===================================
   UI RENDERING
   =================================== */
const UI = {
  showDashboard(name) {
    DOM.loginScreen.classList.add("hidden");
    DOM.dashboardScreen.classList.remove("hidden");
    DOM.userGreeting.textContent = `Welcome, ${name}!`;
  },

  createTaskElement(task, originalIndex) {
    const li = document.createElement("li");
    li.setAttribute("id", `task-item-${originalIndex}`);
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
      <div class="task-info">
        <span class="priority-dot dot-${task.priority}"></span>
        <span>${task.text}</span>
      </div>
      <div class="actions">
        <button class="action-btn complete" onclick="TaskController.toggle(${originalIndex})" title="Complete">✔</button>
        <button class="action-btn edit" onclick="TaskController.startEdit(${originalIndex})" title="Edit">✏️</button>
        <button class="action-btn delete" onclick="TaskController.delete(${originalIndex})" title="Delete">✖</button>
      </div>
    `;

    return li;
  },

  createEditElement(task, index) {
    return `
      <div class="task-edit-container">
        <input type="text" id="edit-text-${index}" value="${task.text}" class="edit-input">
        <select id="edit-priority-${index}" class="edit-select">
          <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
          <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
          <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
        </select>
      </div>
      <div class="actions">
        <button class="action-btn save" onclick="TaskController.saveEdit(${index})" title="Save">💾</button>
        <button class="action-btn" onclick="TaskController.cancelEdit()" title="Cancel">✕</button>
      </div>
    `;
  },

  renderTasks() {
    DOM.taskList.innerHTML = "";

    const priorityFilter = DOM.filterPriority.value;
    const sortOrder = DOM.sortOrder.value;

    const filteredTasks = TaskManager.getFiltered(priorityFilter);
    const sortedTasks = TaskManager.getSorted(filteredTasks, sortOrder);

    sortedTasks.forEach((task) => {
      const originalIndex = TaskManager.tasks.indexOf(task);
      const taskElement = this.createTaskElement(task, originalIndex);
      DOM.taskList.appendChild(taskElement);
    });
  },

  clearTaskInput() {
    DOM.taskInput.value = "";
  },

  showAlert(message) {
    alert(message);
  },
};

/* ===================================
   CONTROLLERS
   =================================== */
const AuthController = {
  init() {
    const savedName = Storage.get(CONFIG.STORAGE_KEYS.USER);

    if (savedName) {
      this.login(savedName);
    }
  },

  login(name) {
    UI.showDashboard(name);
    TaskManager.init();
    UI.renderTasks();
  },

  handleLogin(event) {
    event.preventDefault();

    const userName = DOM.usernameInput.value.trim();

    if (Validation.isValidName(userName)) {
      Storage.set(CONFIG.STORAGE_KEYS.USER, userName);
      this.login(userName);
    } else {
      UI.showAlert(
        `Please enter a valid name. It must contain at least ${CONFIG.VALIDATION.MIN_NAME_LENGTH} letters.`,
      );
    }
  },

  logout() {
    Storage.remove(CONFIG.STORAGE_KEYS.USER);
    window.location.reload();
  },
};

const TaskController = {
  handleSubmit(event) {
    event.preventDefault();

    const cleanedText = DOM.taskInput.value.trim();

    if (!Validation.isValidTask(cleanedText)) {
      UI.showAlert("A tarefa não pode estar vazia!");
      return;
    }

    TaskManager.add(cleanedText, DOM.taskPriority.value);
    UI.clearTaskInput();
    UI.renderTasks();
  },

  toggle(index) {
    TaskManager.toggle(index);
    UI.renderTasks();
  },

  delete(index) {
    if (confirm("Do you really want to delete this task?")) {
      TaskManager.delete(index);
      UI.renderTasks();
    }
  },

  startEdit(index) {
    const li = document.getElementById(`task-item-${index}`);
    const task = TaskManager.tasks[index];

    if (li && task) {
      li.innerHTML = UI.createEditElement(task, index);
    }
  },

  saveEdit(index) {
    const editInput = document.getElementById(`edit-text-${index}`);
    const editPriority = document.getElementById(`edit-priority-${index}`);

    if (!editInput || !editPriority) return;

    const newText = Validation.sanitizeText(
      editInput.value,
      CONFIG.VALIDATION.MAX_TASK_LENGTH,
    );

    if (Validation.isValidTask(newText)) {
      TaskManager.update(index, newText, editPriority.value);
      UI.renderTasks();
    } else {
      UI.showAlert("O texto da tarefa não pode ser vazio.");
    }
  },

  cancelEdit() {
    UI.renderTasks();
  },
};

/* ===================================
   EVENT LISTENERS
   =================================== */
const EventListeners = {
  init() {
    // Username input validation
    DOM.usernameInput.addEventListener("input", function () {
      this.value = Validation.sanitizeName(this.value);
    });

    // Task input validation
    DOM.taskInput.addEventListener("input", function () {
      this.value = Validation.sanitizeText(
        this.value,
        CONFIG.VALIDATION.MAX_TASK_LENGTH,
      );
    });

    // Form submissions
    DOM.loginForm.addEventListener("submit", (e) =>
      AuthController.handleLogin(e),
    );
    DOM.taskForm.addEventListener("submit", (e) =>
      TaskController.handleSubmit(e),
    );

    // Logout
    DOM.logoutBtn.addEventListener("click", () => AuthController.logout());

    // Filter/Sort changes
    DOM.filterPriority?.addEventListener("change", () => UI.renderTasks());
    DOM.sortOrder?.addEventListener("change", () => UI.renderTasks());
  },
};

/* ===================================
   INITIALIZATION
   =================================== */
window.addEventListener("DOMContentLoaded", () => {
  TaskManager.init();
  EventListeners.init();
  AuthController.init();
});

// Expose controllers globally for inline onclick handlers
window.TaskController = TaskController;
