const container = document.getElementById("questions-box");
let maxInputAllowed = 15;
let questions_elements = [];
let questions = [];
//const myURL = "http://127.0.0.1:8050/admin-forms-microservice";
const myURL = "/admin-forms-microservice";

//load preloaded questions if this is the case
for (let i = 0; i < questions.length; i++) {
  loadQuestion(questions[i]);
}

function loadQuestion(text) {
  let input = document.createElement("input");
  input.value = text;

  input.classList.add(
    "question-input"
  );
  container.appendChild(input);
  questions_elements.push(input);
}

function addQuestion() {
  if (questions_elements.length >= maxInputAllowed) {
    alert("You can add maximum " + maxInputAllowed + " questions.");
    return;
  }

  let input = document.createElement("input");
  let label = document.createElement("label");

  label.textContent = String(questions_elements.length + 1) + ".";

  input.classList.add("add-question-input");
  label.classList.add("question-label");
  container.appendChild(label);
  container.appendChild(input);
  questions_elements.push(input);
}

function deleteQuestion() {
  if (questions_elements.length > 1) {
    let lastChild = container.lastChild;
    container.removeChild(lastChild);
    lastChild = container.lastChild;
    container.removeChild(lastChild);
    questions_elements.pop(lastChild);
  } else {
    alert("You should have at least one question.");
    return;
  }
}

function validateQuestion(text) {
  if (text == null) return "You can't have empty questions.";
  if (text.length > 1000)
    return "The questions should have a maximum of 1000 characters.";

  return true;
}

function validateName(name) {
  if (name == null) return "The title shouldn't be empty.";
  if (name.length < 4) return "The title should have at least 4 characters.";
  if (name.length > 100) return "The title shouldn't have more than 100 characters.";

  console.log(name);

  return true;
}

function validateDescription(text) {
  if (text == null) return "The description shouldn't be empty.";
  if (text.length > 1000)
    return "The description shouldn't have more than 1000 characters.";

  console.log(text);

  return true;
}

function validateEnding(text) {
  if (text == null) return "The ending message shouldn't be empty.";
  if (text.length > 100) return "The ending message shouldn't have more than 100 characters.";

  console.log(text);

  return true;
}

function validateTags(tagsList) {
	const pattern = /^[A-Za-z]+$/;

	for (let tag of tagsList) {
		if (!pattern.test(tag)) {
		return "Tags should contain only letters.";
		}
	}

	return true;
}
  
function convertImageToString(inputImage) {
	return new Promise((resolve, reject) => {
	  const file = inputImage.files[0];
  
	  if (!file) {
		reject("No file selected");
		return;
	  }
  
	  const reader = new FileReader();
  
	  reader.onload = function(e) {
		const imageString = reader.result;
		resolve(imageString);
	  };
  
	  reader.onerror = function(e) {
		reject("Error occurred while reading the file");
	  };
  
	  reader.readAsDataURL(file);
	});
}

function validateForm() {
	const image = document.getElementById("preview-image").src;

  const name = document.getElementById("form-name-input").value;
  if (validateName(name) !== true) {
    return validateName(name);
  }

  const description = document.getElementById("form-description-input").value;
  if (validateDescription(description) !== true) {
    return validateDescription(description);
  }

  const ending = document.getElementById("form-ending-input").value;
  if (validateEnding(ending) !== true) {
    return validateEnding(ending);
  }

  const unfiltrated_tags = document.getElementById("form-tags-input").value;
  const tagsArray = unfiltrated_tags.split(",");
  const tags= tagsArray.map((tag) => tag.trim()).filter((tag) => tag !== "");
  
  if (validateTags(tags) !== true) {
    return validateTags(tags);
  }

  for (let i = 0; i < questions_elements.length; i++) {
    const text = questions_elements[i].value;

    const result = validateQuestion(text);

    if (result !== true) {
      return result;
    }
  }

  let questionsDict = {};
  questions_elements.forEach((element, index) => {
    const key = (index + 1).toString(); // Construim cheia ca un șir
    questionsDict[key] = element.value; // Adăugăm cheia și valoarea în dicționar
  });

  let checkedQuestions = [];
  for (let i = 1; i <= 6; i++) {
    const checkbox = document
      .getElementById(`about-user-${i}`)
      .getElementsByTagName("input")[0];
    if (checkbox.checked) {
      const questionText = document
        .getElementById(`about-user-${i}`)
        .getElementsByTagName("label")[0].innerText;
      checkedQuestions.push(questionText);
    }
  }
  questionsDict["getUserInfoQuestions"] = checkedQuestions;

  const formData = {
    name: name,
    description: description,
    ending: ending,
    tags: tags,
    questions: questionsDict,
	  image: image
  };

  return formData;
}

function postFormData(formData) {
  const url = myURL + "/submit";

	fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		})
		.then(response => {
			if (response.ok) {
				alert('Form created successfully!');
				//window.location.href = 'http://127.0.0.1:8050/admin/';
        window.location.href = '/admin/';
			} else {
				throw new Error('Failed to submit form.');
			}
		})
		.catch(error => {
			alert('Error: ' + error.message);
		});
}

function create() {
  const result = validateForm();

  if (typeof result === "string") {
    alert("Error: " + result);
    return;
  }

  console.log(result);
  postFormData(result);
}

//Modifications
questions_elements.push(document.getElementById("first-question"));
document.getElementById("questions-container").style.display = "none";

const addQuestionsBtn = document.getElementById("add-questions-btn");
addQuestionsBtn.onclick = function (e) {
  e.preventDefault();
  document.getElementById("centered-box").style.display = "none";
  document.getElementById("questions-container").style.display = "block";
  window.scrollTo(0,0);
};

function back() {
  document.getElementById("centered-box").style.display = "flex";
  document.getElementById("questions-container").style.display = "none";
  window.scrollTo(0,0);
}

function previewImage(event) {
  const input = event.target;
  const preview = document.getElementById("preview-image");
  preview.style.display = "block";

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ["jpeg", "jpg", "png", "svg"];

    if (allowedExtensions.includes(extension)) {
      const reader = new FileReader();

      reader.onload = function (e) {
        preview.src = e.target.result;
      };

      reader.readAsDataURL(file);
      document.getElementById("remove-image").style.display = "block";
      document.getElementById("placeholder-text").style.display = "none";
    } else {
      alert("Invalid file type. Please select a JPEG, PNG, or SVG image.");
      input.value = '';
      removeImage();
    }
  }
}

function removeImage() {
  document.getElementById("preview-image").src = "";
  document.getElementById("image-upload-input").value = "";
  document.getElementById("remove-image").style.display = "none";
  document.getElementById("placeholder-text").style.display = "block";
  document.getElementById("preview-image").style.display = "none";
}
