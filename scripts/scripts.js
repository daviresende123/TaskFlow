//Elements references
const loginForm = document.getElementById("login-form");
const userGreeting = document.getElementById("user-greeting");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginScreen = document.querySelector(".card");

//Event listener for the login form
loginForm.addEventListener("submit", (event) => {
  //Stop the page from reloading
  event.preventDefault();

  //Get the value from the input field
  const userName = document.getElementById("username").value;

  if (userName.trim() !== "") {
    //Perform the switch
    // Hide the Login Card
    loginScreen.classList.add("hidden");

    // Show the Dashboard
    dashboardScreen.classList.remove("hidden");

    // Update the greeting text
    userGreeting.textContent = `Welcome, ${userName}!`;
  }
});
