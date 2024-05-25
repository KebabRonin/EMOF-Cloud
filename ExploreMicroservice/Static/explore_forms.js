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

async function fetchCategory(category) {
    forms = []
    //await fetch('http://127.0.0.1:8050/explore/explore-api/' + encodeURIComponent(category)).then(response => response.json()).then(data => {
      await fetch('/explore/explore-api/' + encodeURIComponent(category)).then(response => response.json()).then(data => {
        if(data.length > 0) {
          forms = data
        }
    }).catch(error => {
      console.log(error)
      forms = []
    });
    return forms
}

function displayForm(container, form) {
    let thisForm = document.createElement("section");
    thisForm.innerHTML = `
        <div class="form-presentation">
          <h2>${(form.title)}</h2>
          <div class="form-presentation-info">
            <p><strong>Author: </strong> ${(form.author)}</p>
            <p><strong>Description:</strong> ${(form.description)}</p>
            <p><strong>Questions:</strong> ${(form.nr_questions)}</p>
            <p><strong>Responses:</strong> ${(form.nr_responses)}</p>
          </div>
        </div>
    `;
    if (is_ok_image(form.image)){
      let c=thisForm.getElementsByClassName("form-presentation-info")[0]
      let img = document.createElement("img");
        img.setAttribute("src",form.image.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0'));
        img.setAttribute("width","200");
        img.setAttribute("height","200");
        img.setAttribute("overflow","hidden");
      c.insertBefore(img, c.firstChild);
    }
    else {
      let c=thisForm.getElementsByClassName("form-presentation-info")[0]
      let img = document.createElement("img");
        img.setAttribute("src","/explore/pictures/icon.png");
        img.setAttribute("width","200");
        img.setAttribute("height","200");
        img.setAttribute("overflow","hidden");
      c.insertBefore(img, c.firstChild);
    }
    buttons = thisForm.getElementsByClassName("form-presentation")[0];

    viewButton = document.createElement('a');
    viewButton.innerText = "Take form"; 
    viewButton.addEventListener("click",((form_id) => function (){takeForm(form_id)})(form.id));
    buttons.appendChild(viewButton);

    container.appendChild(thisForm);
}

function takeForm(form_id) {
  //alert(form_id + " taken!")
  window.location.href = `/forms-microservice/${form_id}.html`;
}

async function displayCategory(category_endpoint, category_title) {
  parent_element = document.createElement("section")
  parent_element.innerHTML = `
    <div class="section-description">
      <h1>${(category_title)}</h1>
    </div>
    <div class="form-scroller">
      <div>
      </div>
    </div>
  `

  container = parent_element.getElementsByClassName("form-scroller")[0].children[0]

  forms = await fetchCategory(category_endpoint)
  populateContainer(container, forms);
  
  document.getElementById("section-list").appendChild(parent_element)
}

async function populateContainer(container, forms) {
  console.log(forms)
  if(forms.length > 0) {
    for (form in forms) {
      displayForm(container, forms[form])
    }
  }
  else {
    container.innerHTML = '<h1 class="no-content-text">No Forms Here</h1>';
  }
}
async function init() {
  document.getElementById("section-list").innerText = ''
  await displayCategory("popular", "Popular forms")
  await displayCategory("new", "New forms")
}

init()

