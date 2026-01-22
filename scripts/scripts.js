/* Elements references */
const loginForm = document.getElementById("login-form");
const userGreeting = document.getElementById("user-greeting");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginScreen = document.querySelector(".card");
const usernameInput = document.getElementById("username");

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
