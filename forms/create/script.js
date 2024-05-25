const container = document.getElementById('questions-container');
let maxInputAllowed = 15;
let questions_elements = []
let questions = [];

//load preloaded questions if this is the case
for (let i = 0; i < questions.length; i++) {
	loadQuestion(questions[i]);
}

function loadQuestion(text) {

	let input = document.createElement('input');
	input.value = text;

	input.classList.add("flex-container-centered", "rounded-div", "drop-shadow-effect", "question-input")
	container.appendChild(input);
	questions_elements.push(input);
}

function addQuestion() {
	if (questions_elements.length >= maxInputAllowed) {
		alert('You can add maximum ' + maxInputAllowed + ' questions.');
		return;
	}

	let input = document.createElement('input');

	input.placeholder = 'Type something';

	input.classList.add("flex-container-centered", "rounded-div", "drop-shadow-effect", "question-input")
	container.appendChild(input);
	questions_elements.push(input);
}

function deleteQuestion() {
	if (questions_elements.length > 0) {

		let lastChild = container.lastChild;
		container.removeChild(lastChild);
		questions_elements.pop(lastChild)

	} else {
		alert('You dont have any questions to delete');
		return;
	}
}

function validateQuestion(text) {

	if (text == null) return "Weird error , text is null"
	if (text.length < 20) return "No question under 20 characters allowed"
	if (text.length > 1000) return "No question bigger than 1000 characters allowed"

	return true
}

function validateName(name) {
	if (name == null) return "Name is null"
	if (name.length < 6) return "No name under 6 characters allowed"
	if (name.length > 100) return "No name bigger than 100 characters allowed"

	console.log(name);

	return true
}

function validateDescription(text) {
	if (text == null) return "Description is null"
	if (text.length < 20) return "No description under 20 characters allowed"
	if (text.length > 1000) return "No description bigger than 1000 characters allowed"

	console.log(text);

	return true
}

function validateEnding(text) {
	if (text == null) return "Ending is null"
	if (text.length < 10) return "No ending under 10 characters allowed"
	if (text.length > 100) return "No ending bigger than 100 characters allowed"

	console.log(text);

	return true
}

function validateTags(tagsList) {

	// To be done 
	console.log(tagsList)

	return true
}

function validateForm() {

	const name = document.getElementById('form-name-input').value;
	if (validateName(name) !== true) {
		return validateName(name)
	}

	const description = document.getElementById('form-description-input').value;
	if (validateDescription(description) !== true) {
		return validateDescription(description)
	}

	const ending = document.getElementById('form-ending-input').value;
	if (validateEnding(ending) !== true) {
		return validateEnding(ending)
	}

	const unfiltrated_tags = document.getElementById('form-tags-input').value.split(" ");
	const tags = unfiltrated_tags.filter(token => {
		return !(/\s|\.|,/.test(token));
	});

	if (validateTags(tags) !== true) {
		return validateTags(tags)
	}

	if (questions_elements.length == 0) {
		return "You have no questions added"
	}

	for (let i = 0; i < questions_elements.length; i++) {
		const text = questions_elements[i].value;

		const result = validateQuestion(text)

		if (result !== true) {
			return result;
		}
	}
	/*
	make a json from values above and return it
	*/
	const formData = {
		name: name,
		description: description,
		ending: ending,
		tags: tags,
		questions: questions_elements
	};

	return formData;
}

function postFormData(formData) {
	const url = 'https://exemplu.com/api/form';

	fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		})
		.then(response => {
			if (response.ok) {
				alert('Form submitted successfully!');
				window.location.href = '../../admin/all_forms.html';
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

	if (typeof result === 'string') {
		alert("Error: " + result);
		return;
	}

	console.log(result)
	postFormData(result);
}