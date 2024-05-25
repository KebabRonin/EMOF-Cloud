//const myURL = "http://127.0.0.1:8050/authentication";
const myURL = "/authentication";
var loginButton = document.getElementById("login-submit-btn");
loginButton.disabled = true;

function checkFormCompletion() {
  var emailUsername = document.getElementById("username_or_email").value;
  var password = document.getElementById("password").value;

  loginButton.disabled = !(emailUsername && password);
}

function resetFields(){
  document.getElementById("username_or_email").value="";
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
document.getElementById("username_or_email").addEventListener("input",checkFormCompletion);
document.getElementById("password").addEventListener("input", checkFormCompletion);


loginButton.addEventListener("click", function (event) {
  event.preventDefault();
  var emailUsernameInput = document.getElementById("username_or_email");
  var passwordInput = document.getElementById("password");
  var emailUsername = emailUsernameInput.value;
  var password = passwordInput.value;
  var loginErrorMessage = document.getElementById("login-error-message");

  loginErrorMessage.textContent = "";
  emailUsernameInput.classList.remove("kYUBna");
  passwordInput.classList.remove("kYUBna");

  var xhr = new XMLHttpRequest();
  xhr.open("POST", myURL + "/login");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      document.cookie = `sessionId=${response.sessionId}; path=/`;
      window.location.href = "/admin/";
    } else if (xhr.status === 400) {
      var errorMessage = xhr.responseText;
      if (errorMessage.includes("email")) {
        emailUsernameInput.classList.add("kYUBna");
        passwordInput.classList.add("kYUBna");
        loginErrorMessage.textContent = errorMessage;
        loginErrorMessage.style.color = "rgb(226, 27, 60)";
      }
      else if (errorMessage.includes("password")) {
        passwordInput.classList.add("kYUBna");
        loginErrorMessage.textContent = errorMessage;
        loginErrorMessage.style.color = "rgb(226, 27, 60)";
      }
      else {
        console.log("Error:", errorMessage);
      }
    } else {
      console.log("Error:", xhr.responseText);
    }
  };
  xhr.onerror = function () {
    console.log("Request failed.");
  };

  // var formData = 
  //   "&emailUsername=" +
  //   encodeURIComponent(emailUsername) +
  //   "&password=" +
  //   encodeURIComponent(password);
  const formData = {
    "emailUsername": emailUsername,
    "password": password
  }
  const formDataString = JSON.stringify(formData);
  xhr.send(formDataString);
});
