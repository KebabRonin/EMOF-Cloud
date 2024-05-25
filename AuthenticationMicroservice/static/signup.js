//const myURL = "http://127.0.0.1:8050/authentication";
const myURL = "/authentication";
var submitButton = document.getElementById("login-submit-btn");
submitButton.disabled = true;

var emailUsernameInput = document.getElementById("username");
var passwordInput = document.getElementById("password");

function checkFormCompletion() {
  var email = document.getElementById("email").value;
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  submitButton.disabled = !(username && email && password);
}

function resetFields(){
  document.getElementById("email").value="";
  document.getElementById("username").value="";
  document.getElementById("password").value="";
}

function initializeHideButton(){
  const passwordInput = document.getElementById('password');
  const showPasswordButton = document.getElementById('show-password-btn');

  showPasswordButton.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  });
}

resetFields();
initializeHideButton();
document.getElementById("username").addEventListener("input",checkFormCompletion);
document.getElementById("email").addEventListener("input", checkFormCompletion);
document.getElementById("password").addEventListener("input", checkFormCompletion);


submitButton.addEventListener("click", function (event) {
  event.preventDefault();

  var emailInput = document.getElementById("email");
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");
  var email = emailInput.value;
  var username = usernameInput.value;
  var password = passwordInput.value;
  var emailErrorMessage = document.getElementById("email-error-message");
  var usernameErrorMessage = document.getElementById("username-error-message");
  var passwordErrorMessage = document.getElementById("password-error-message");

  emailErrorMessage.textContent = "";
  emailInput.classList.remove("kYUBna");
  usernameErrorMessage.textContent = "";
  usernameInput.classList.remove("kYUBna");
  passwordErrorMessage.textContent = "";
  passwordInput.classList.remove("kYUBna");

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailInput.classList.add("kYUBna");
    emailErrorMessage.textContent = "Invalid email.";
    emailErrorMessage.style.color = "rgb(226, 27, 60)";
  }

  if (username.length < 4) {
    usernameInput.classList.add("kYUBna");
    usernameErrorMessage.textContent =
      "Username should be at least 4 characters long.";
    usernameErrorMessage.style.color = "rgb(226, 27, 60)";
  }

  if (password.length < 6) {
    passwordInput.classList.add("kYUBna");
    passwordErrorMessage.textContent =
      "Password should be at least 6 characters long.";
    passwordErrorMessage.style.color = "rgb(226, 27, 60)";
  }

  if (
    emailRegex.test(email) &&
    username.length >= 4 &&
    password.length >= 6
  ) {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", myURL + "/signup");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        document.cookie = `sessionId=${response.sessionId}; path=/`;
        window.location.href = "/admin/";
      } else if (xhr.status === 400) {
        var errorMessage = xhr.responseText;
        if (errorMessage.includes("Email") || errorMessage.includes("email")) {
          emailInput.classList.add("kYUBna");
          emailErrorMessage.textContent = errorMessage;
          emailErrorMessage.style.color = "rgb(226, 27, 60)";
        } else if (errorMessage.includes("Username")) {
          usernameInput.classList.add("kYUBna");
          usernameErrorMessage.textContent = errorMessage;
          usernameErrorMessage.style.color = "rgb(226, 27, 60)";
        } else if (errorMessage.includes("password")) {
          passwordInput.classList.add("kYUBna");
          passwordErrorMessage.textContent = errorMessage;
          passwordErrorMessage.style.color = "rgb(226, 27, 60)";
        } else {
          console.log("Error:", errorMessage);
        }
      } else {
        console.log("Error:", xhr.responseText);
      }
    };
    xhr.onerror = function () {
      console.log("Request failed.");
    };
    const formData = {
      "email": email,
      "username": username,
      "password": password
    }
    const formDataString = JSON.stringify(formData);
    xhr.send(formDataString);
  }
});


