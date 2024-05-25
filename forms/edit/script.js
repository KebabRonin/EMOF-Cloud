const container = document.getElementById('questions-container');
let maxInputAllowed = 15;
let questions_elements = [] 
let questions = [
	"Ce sentiment ti-a produs mancarea de la pranz ?", 
	"Razboiul dintre Ucraina si Rusia cum te face sa te simti ?",
	"Cum iti poti descrie copilaria in cateva emotii ?"];
	

for(let i = 0 ; i < questions.length ; i++){
	loadQuestion(questions[i]);
}

function loadQuestion(text){
	
	let input = document.createElement('input');
	input.value = text;
	
	input.classList.add("flex-container-centered","rounded-div","drop-shadow-effect","question-input")
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
	
	input.classList.add("flex-container-centered","rounded-div","drop-shadow-effect","question-input")
	container.appendChild(input);
	questions_elements.push(input);
}

function deleteQuestion() {
	if(questions_elements.length > 0) {
		
		let lastChild = container.lastChild; 
		container.removeChild(lastChild);
		questions_elements.pop(lastChild)

	}
	else{
		alert('You dont have any questions to delete');
		return;
	}
}

function validateQuestion(text){
	
	if(text == null) return "Weird error , text is null"
	if(text.length < 20) return "No question under 20 characters allowed"
	if(text.length > 1000) return "No question bigger than 1000 characters allowed"

	return true
}

function validateForm(){

	if(questions_elements.length == 0){
		return "You have no questions added"
	}

	for (let i = 0; i < questions_elements.length; i++) { 
		const text = questions_elements[i].value; 
		
		const result = validateQuestion(text)

		if(result !== true){
			return result;
		}
	}

	return true;
}


function create(){
	
	const result = validateForm();
	
	if(result !== true){
		alert("Error : " + result);
		return;
	}

	let questions = questions_elements.map((question,index) => (index + 1) + "."+ question.value)

	alert("Form edited !! These are your questions : " + questions);
	window.location.href = "../../admin/all_forms.html";


}