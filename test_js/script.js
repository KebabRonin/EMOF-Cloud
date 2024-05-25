var signUpButton = document.querySelector("#login-submit-btn");

signUpButton.addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("login-submit-btn").submit();
  window.location.href = "admin/all_forms.html";

});

