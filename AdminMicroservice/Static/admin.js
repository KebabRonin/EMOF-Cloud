function escapeHtml(unsafe)
{
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function is_ok_image(img_str) {
  if(!img_str) {
    return false
  }
  if(img_str.startsWith("data:image/")) {
    return true
  }
  return false
}

async function fetchUserForms(query_string) {
    formList = document.getElementById("form-list-main")
    formList.innerText = '';
    await fetch(`/admin/admin-api/users/${encodeURIComponent('${{{user_id}}}')}/forms` + query_string).then(response => response.json()).then(data => {
        if(data.length > 0) {
          Array.prototype.forEach.call(data, form => displayForm(form));
        }
        else {
          formList.innerHTML = '<h1 class="no-content-text">No Forms Here</h1>';
        }
    }).catch(error => {
      console.log(error)
      formList.innerHTML = '<h1 class="no-content-text">No Forms Here</h1>';
    });
}

function displayForm(form) {
    let formList = document.getElementById("form-list-main");
    let thisForm = document.createElement("section");
    if(form.status == "draft") {
      thisForm.innerHTML = `
            <div class="form-info-pane">
              <div class="form-heading">
                <h1>
                ${(form.title)}
                </h1>
                <span class="form-item draft-form-bubble">
                  Draft
                </span>
              </div>
              <div class="form-info">
                <div class="form-info-text">
                  <p>
                    Description: ${(form.description)}
                  </p>
                  <p>
                    Questions: ${(form.nr_questions)}
                  </p>
                </div>
              </div>
            </div>
            <div class="form-admin-buttons">
            </div>
      `;

      const formHead = thisForm.getElementsByClassName("form-heading")[0]
      let pub = document.createElement("span");
      pub.setAttribute("class","form-item");
      pub.setAttribute("style","background-color:#9e13a3;");
      if(form.public) {
        pub.innerText = "Public"
      }
      else {
        pub.innerText = "Private"
      }
      formHead.appendChild(pub);

      if(is_ok_image(form.image)) {
        const info = thisForm.getElementsByClassName("form-info")[0]
        let img = document.createElement("img");
        img.setAttribute("src",form.image.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0'));
        img.setAttribute("width","300");
        img.setAttribute("height","300");
        img.setAttribute("overflow","hidden");
        img.classList.add("images");
        info.appendChild(img)
      }
      if(form.tags && form.tags.length > 0) {
        const info = thisForm.getElementsByClassName("form-info")[0].getElementsByClassName("form-info-text")[0]
        let tagsElem = document.createElement("p");
        let s = "<strong>Contains:</strong>"
        for (let tag in form.tags) {
          s += " <span class=\"form-item\">" + escapeHtml(form.tags[tag]) + "</span>"
        }
        tagsElem.innerHTML = s
        info.appendChild(tagsElem)
      }
      buttons = thisForm.getElementsByClassName("form-admin-buttons")[0];
      launchButton = document.createElement('a');
      launchButton.classList.add("emphasised-button")
      launchButton.classList.add("button")
      launchButton.innerText = "Launch";
      launchButton.addEventListener("click",((form_id) => function (){launchForm(form_id)})(form.id));
      buttons.appendChild(launchButton);

      editButton = document.createElement('a');
      editButton.classList.add("active-button")
      editButton.classList.add("button")
      editButton.innerText = "Edit";
      editButton.addEventListener("click",((form_id) => function (){editForm(form_id)})(form.id));
      buttons.appendChild(editButton);

      publicButton = document.createElement('a');
      publicButton.classList.add("active-button")
      publicButton.classList.add("button")
      if(form.public) {
        publicButton.innerText = "Make private";
      }
      else {
        publicButton.innerText = "Make public";
      }
      publicButton.addEventListener("click",((form_id, public_status) => function (){public_privateForm(form_id, public_status)})(form.id, !form.public));
      buttons.appendChild(publicButton);

      viewButton = document.createElement('a');
      viewButton.classList.add("unselectable-button")
      viewButton.classList.add("button")
      viewButton.innerText = "View Statistics";
      buttons.appendChild(viewButton);

      deleteButton = document.createElement('a');
      deleteButton.classList.add("delete-button")
      deleteButton.classList.add("button")
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click",((form_id) => function (){deleteForm(form_id)})(form.id));
      buttons.appendChild(deleteButton);
    }
    else if(form.status == "active") {
      thisForm.innerHTML = `
            <div class="form-info-pane">
              <div class="form-heading">
                <h1>
                ${(form.title)}
                </h1>
                <span class="form-item active-form-bubble">
                  Active Form
                </span>
              </div>
              <div class="form-info">
                <div class="form-info-text">
                  <p>
                    Description: ${(form.description)}
                  </p>
                  <p>
                    Published at: ${(form.published_at)}
                  </p>
                  <p>
                    Questions: ${(form.nr_questions)}
                  </p>
                  <p>
                    <strong>Responses: ${(form.nr_responses)}</strong>
                  </p>
                </div>
              </div>
            </div>
            <div class="form-admin-buttons">
            </div>
      `;

      const formHead = thisForm.getElementsByClassName("form-heading")[0]
      let pub = document.createElement("span");
      pub.setAttribute("class","form-item");
      pub.setAttribute("style","background-color:#9e13a3;");
      if(form.public) {
        pub.innerText = "Public"
      }
      else {
        pub.innerText = "Private"
      }
      formHead.appendChild(pub);

      if(is_ok_image(form.image)) {
        const info = thisForm.getElementsByClassName("form-info")[0]
        let img = document.createElement("img");
        img.setAttribute("src",form.image.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0'));
        img.setAttribute("width","300");
        img.setAttribute("height","300");
        img.setAttribute("overflow","hidden");
        img.classList.add("images");
        info.appendChild(img)
      }
      if(form.tags && form.tags.length > 0) {
        const info = thisForm.getElementsByClassName("form-info")[0].getElementsByClassName("form-info-text")[0]
        let tagsElem = document.createElement("p");
        let s = "<strong>Contains:</strong>"
        for (let tag in form.tags) {
          s += " <span class=\"form-item\">" + escapeHtml(form.tags[tag]) + "</span>"
        }
        tagsElem.innerHTML = s
        info.appendChild(tagsElem)
      }

      buttons = thisForm.getElementsByClassName("form-admin-buttons")[0];
      closeButton = document.createElement('a');
      closeButton.classList.add("emphasised-button")
      closeButton.classList.add("button")
      closeButton.innerText = "Close";
      closeButton.addEventListener("click",((form_id) => function (){closeForm(form_id)})(form.id));
      buttons.appendChild(closeButton);

      shareButton = document.createElement('a');
      shareButton.classList.add("active-button")
      shareButton.classList.add("button")
      shareButton.innerText = "Share";
      shareButton.addEventListener("click",((form_id) => function (){shareForm(form_id)})(form.id));
      buttons.appendChild(shareButton);

      publicButton = document.createElement('a');
      publicButton.classList.add("active-button")
      publicButton.classList.add("button")
      if(form.public) {
        publicButton.innerText = "Make private";
      }
      else {
        publicButton.innerText = "Make public";
      }
      publicButton.addEventListener("click",((form_id, public_status) => function (){public_privateForm(form_id, public_status)})(form.id, !form.public));
      buttons.appendChild(publicButton);

      viewButton = document.createElement('a');
      viewButton.classList.add("unselectable-button")
      viewButton.classList.add("button")
      viewButton.innerText = "View Statistics";
      buttons.appendChild(viewButton);

      deleteButton = document.createElement('a');
      deleteButton.classList.add("delete-button")
      deleteButton.classList.add("button")
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click",((form_id) => function (){deleteForm(form_id)})(form.id));
      buttons.appendChild(deleteButton);
    }
    else if(form.status == "closed") {
      thisForm.innerHTML = `
            <div class="form-info-pane">
              <div class="form-heading">
                <h1>
                  ${(form.title)}
                </h1>
                <span class="form-item closed-form-bubble">
                  Closed Form
                </span>
              </div>
              <div class="form-info">
                <div class="form-info-text">
                  <p>
                    Description: ${(form.description)}
                  </p>
                  <p>
                    Published at: ${(form.published_at)}
                  </p>
                  <p>
                    Closed at: ${(form.closed_at)}
                  </p>
                  <p>
                    Questions: ${(form.nr_questions)}
                  </p>
                  <p>
                    <strong>Responses: ${(form.nr_responses)}</strong>
                  </p>
                </div>
              </div>
            </div>
            <div class="form-admin-buttons">
            </div>
      `;

      const formHead = thisForm.getElementsByClassName("form-heading")[0]
      let pub = document.createElement("span");
      pub.setAttribute("class","form-item");
      pub.setAttribute("style","background-color:#9e13a3;");
      if(form.public) {
        pub.innerText = "Public"
      }
      else {
        pub.innerText = "Private"
      }
      formHead.appendChild(pub);

      if(is_ok_image(form.image)) {
        const info = thisForm.getElementsByClassName("form-info")[0]
        let img = document.createElement("img");
        img.setAttribute("src",form.image.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0'));
        img.setAttribute("width","300");
        img.setAttribute("height","300");
        img.setAttribute("overflow","hidden");
        img.classList.add("images");
        info.appendChild(img)
      }
      if(form.tags && form.tags.length > 0) {
        const info = thisForm.getElementsByClassName("form-info")[0].getElementsByClassName("form-info-text")[0]
        let tagsElem = document.createElement("p");
        let s = "<strong>Contains:</strong>"
        for (let tag in form.tags) {
          s += " <span class=\"form-item\">" + escapeHtml(form.tags[tag]) + "</span>"
        }
        tagsElem.innerHTML = s
        info.appendChild(tagsElem)
      }
      buttons = thisForm.getElementsByClassName("form-admin-buttons")[0];

      viewButton = document.createElement('a');
      viewButton.classList.add("emphasised-button")
      viewButton.classList.add("button")
      viewButton.innerText = "View Statistics";
      viewButton.addEventListener("click",((form_id) => function (){statsForm(form_id)})(form.id));
      buttons.appendChild(viewButton);

      deleteButton = document.createElement('a');
      deleteButton.classList.add("delete-button")
      deleteButton.classList.add("button")
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click",((form_id) => function (){deleteForm(form_id)})(form.id));
      buttons.appendChild(deleteButton);
    }

    formList.appendChild(thisForm);
}

function selectFormButton(id) {
  let buttons = document.getElementById("categories-button-wrapper");
  for(let i = 0; i < buttons.children.length; ++i){
    if(buttons.children[i].classList.contains("active-button")) {
      buttons.children[i].classList.remove("active-button");
    }
    if(buttons.children[i].classList.contains("inactive-button")) {
      buttons.children[i].classList.remove("inactive-button");
    }
    if(buttons.children[i].id === id) {
      buttons.children[i].classList.add("active-button");
    }
    else {
      buttons.children[i].classList.add("inactive-button");
    }
  }
}

function displayClosedForms() {
  selectFormButton("closed-forms-button");
  fetchUserForms('?filter=closed');
}
function displayDraftForms() {
  selectFormButton("drafts-button");
  fetchUserForms('?filter=draft');
}
function displayAllForms() {
  selectFormButton("all-forms-button");
  fetchUserForms('');
}
function displayActiveForms() {
  selectFormButton("active-forms-button");
  fetchUserForms('?filter=active');
}

function popup_confirm(str, callback) {
  el = document.getElementById("confirm-dialog");
  document.getElementById("title-confirm-dialog").innerText = str;
  btns = document.getElementById("confirm-dialog-buttons");
  oldYes = document.getElementById("yes-confirm-button")
  oldCancel = document.getElementById("cancel-confirm-button")

  yes = oldYes.cloneNode(true);
  cancel = oldCancel.cloneNode(true);
  yes.addEventListener("click", ((clbck) => function () {clbck(); document.getElementById("confirm-dialog").style.visibility = 'hidden'})(callback))
  cancel.addEventListener("click", (() => {document.getElementById("confirm-dialog").style.visibility = 'hidden'}))
  btns.replaceChild(yes,oldYes);
  btns.replaceChild(cancel,oldCancel);
  el.style.visibility = 'visible';
}

function refresh_selection() {
  let buttons = document.getElementById("categories-button-wrapper");
  for(let i = 0; i < buttons.children.length; ++i){
    if(buttons.children[i].classList.contains("active-button")) {
      buttons.children[i].click();
      return;
    }
  }
}

function deleteForm(form_id) {
  popup_confirm("Are you sure you want to delete the Form?", (
    (formId) => function() {
      fetch(`/admin/admin-api/forms/${encodeURIComponent(form_id)}`,{method:'DELETE'}).then(response => {
        if(response.status == 200) {
          refresh_selection();
        }
      }).catch(error => {
        console.log(error)
        alert("Error deleting "+form_id)
      });
    })(form_id));
}
function launchForm(form_id) {
  popup_confirm("Are you sure you want to launch the Form?", (
    (formId) => function() {
      fetch(`/admin/admin-api/forms/${encodeURIComponent(form_id)}`,{method:'PATCH', body:JSON.stringify({status:'active'})}).then(response => {
        if(response.status == 200) {
          refresh_selection();
        }
      }).catch(error => {
        console.log(error)
        alert("Error launching "+form_id)
      });
    })(form_id));
}
function closeForm(form_id) {
  popup_confirm("Are you sure you want to close the Form?", (
    (formId) => function() {
      fetch(`/admin/admin-api/forms/${encodeURIComponent(form_id)}`,{
              method:'PATCH',
              headers: {'Content-Type': 'application/json'},
              body:JSON.stringify({status:'closed'})}
      ).then(response => {
          if(response.status == 200) {
            refresh_selection();
          }
      }).catch(error => {
        console.log(error)
        alert("Error closing "+form_id)
      });
    })(form_id));
}

function public_privateForm(form_id, make_public) {
  if(make_public) {
    confirm_str = "Are you sure you want to make the form public?"
  }
  else {
    confirm_str = "Are you sure you want to make the form private?"
  }
  popup_confirm(confirm_str, (
    (formId, pub_status) => function() {
      fetch(`/admin/admin-api/forms/${encodeURIComponent(form_id)}`,{method:'PATCH', body:JSON.stringify({public:pub_status})}).then(response => {
        if(response.status == 200) {
          refresh_selection();
        }
      }).catch(error => {
        console.log(error)
        alert("Error changing public status "+form_id)
      });
    })(form_id,make_public));
}

function editForm(form_id) {
  window.location.href = `/admin-forms-microservice/update/${encodeURIComponent(form_id)}.html`;
}
function statsForm(form_id) {
  window.location.href = `/statistics/${encodeURIComponent(escapeHtml(form_id))}`;
}
async function shareForm(form_id) {
  //await navigator.clipboard.writeText("127.0.0.1:8050/forms-microservice/" + encodeURIComponent(escapeHtml(form_id)) + ".html");
  await navigator.clipboard.writeText("https://emof.azurewebsites.net/forms-microservice/" + encodeURIComponent(escapeHtml(form_id)) + ".html");
  alert("Copied link to clipboard!");
}
displayAllForms()