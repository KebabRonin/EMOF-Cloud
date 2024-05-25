const id = document.getElementById("ID").textContent;
//const API_URL = "http://127.0.0.1:8050/forms-microservice/";
const API_URL = "/forms-microservice/";

let formInfo = {};
let pageCounter = 0;
let numberOfPages = 2;
let userInfoResponses = [];
var first_time_draw = true;

const startTime = new Date();

async function fetchData() {
  try {
    const response = await fetch(API_URL + id + ".json");
    const data = await response.json();
    formInfo = data;
    
    if (formInfo.image == null || String(formInfo.image).startsWith("http")) {
      formInfo.image = "icon.png";
    }
    document.getElementById("form-image").src = formInfo.image;
    document.getElementById("create-title").textContent = formInfo.name;

    const userInfoQuestions = formInfo.questions.getUserInfoQuestions;
    delete formInfo.questions.getUserInfoQuestions;
    formInfo.userInfoQuestions = userInfoQuestions;
    numberOfPages = Object.keys(formInfo.questions).length + 2;

	setDefault();

    console.log(formInfo);
    updatePage();
  } catch (err) {
    console.log("error: " + err);
  }
}

fetchData();

let selectedEmotions = {};

function updateTagsContainer() {
  let tagsContainer = document.getElementById("howyoufeel-tags-container");

  while (tagsContainer.firstChild) {
    tagsContainer.removeChild(tagsContainer.firstChild);
  }

  (selectedEmotions[pageCounter] || []).forEach((emotion) => {
    let color = emotions_list
      .find((emotions) => emotions.find((e) => e.name == emotion))
      .find((e) => e.name == emotion).color;
    let tag = document.createElement("div");
    let text = document.createTextNode(emotion);

    tag.appendChild(text);
    tag.style.backgroundColor = color;
    tag.id = emotion + "-" + pageCounter;

    tagsContainer.appendChild(tag);
  });
}

function setDefault() {
  try {
    document.getElementById("back-explore-button").style.display = "none";
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("howyoufeel-header").style.display = "none";
    document.getElementById("answer-container").style.display = "none";
    document.getElementById("back-explore").style.display = "none";
    document.getElementById("question").style.display = "none";
    document.getElementById("next-button").style.display = "none";

	if(formInfo.userInfoQuestions == undefined || formInfo.userInfoQuestions == null){
		document.querySelector("legend").style.display = "none";
	}
  } catch (e) {
    console.log(e);
  }
}

function checkFormInput() {
  for (let i = 1; i < numberOfPages - 1; i++) {
    if (!selectedEmotions[i] || selectedEmotions[i].length === 0) {
      return i;
    }
  }

  return -1;
}

function sendData() {
  let incompletePageIndex = checkFormInput();
  if (incompletePageIndex !== -1) {
    alert("Trebuie sa selectezi cel putin un sentiment pentru fiecare pagina.");

    console.log("Nu trimitem data :((");
    console.log(selectedEmotions);

    pageCounter = incompletePageIndex;
    updatePage();
    return;
  }

  console.log("Trimitem data <3");

  const endTime = new Date();
  let timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds
  const seconds = Math.round(timeDiff);

  let dataToSend = selectedEmotions;
  dataToSend.duration = seconds + " seconds";

  userInfoResponses = getUserInfoResponses();
  dataToSend.userInfo = userInfoResponses;

  console.log(dataToSend);

  fetch(API_URL + "submit/" + id, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);

      pageCounter++;
      updatePage();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateDescriptionPage() {
  document.getElementById("description-box").style.display = "block";
  document.getElementById("description").innerText = formInfo.description;
  document.getElementById("next-btn").style.display = "block";
  document.getElementById("user-info-container").style.display = "flex";

  formInfo.userInfoQuestions.forEach((question) => {
    console.log(question);
    createUserInputQuestion(question);
  });
}

function updateFinalPage() {
  document.getElementById("question").innerText = formInfo.ending;
  document.getElementById("back-explore").style.display = "block";
  document.getElementById("back-explore-button").style.display = "block";
  document.getElementById("answer-container").style.display = "none";
  document.getElementById("next-button").style.display = "none";
  document.getElementById("back-btn").style.display = "none";
}

function updateQuestionPage() {
  if (pageCounter == numberOfPages - 2) {
    const button = document.getElementById("next-button");
    button.textContent = "Finish";
  } else {
    document.getElementById("next-button").textContent = "Next";
  }

  document.getElementById("question").textContent =
    Object.keys(formInfo.questions)[pageCounter - 1] +
    ". " +
    Object.values(formInfo.questions)[pageCounter - 1];
  console.log(Object.values(formInfo.questions)[pageCounter - 1]);
  if (pageCounter > 1) {
    document.getElementById("back-btn").style.visibility = "visible";
  }
  document.getElementById("answer-container").style.visibility = "visible";
  window.scrollTo(0, 0);
}

function updatePage() {
  if (pageCounter == 0) {
    updateDescriptionPage();
  } else if (pageCounter == numberOfPages - 1) {
    updateFinalPage();
  } else {
    updateQuestionPage();
  }
  updateTagsContainer();
}

function nextPage() {
  if (pageCounter == 0) userInfoResponses = getUserInfoResponses();
  if (!validateResponses()) {
    alert("Fiecare raspuns trebuie sa contina maximum un singur cuvant.");
    return;
  }

  if (pageCounter == numberOfPages - 2) {sendData(); return}
  const button = document.getElementById("next-button");
  if (button.textContent == "Finish") {
    document.getElementById("answer-container").style.display = "none";
  } else {
    pageCounter++;
    updatePage();
  }
}

function lastPage() {
  if (pageCounter <= 1) return;

  pageCounter--;
  updatePage();
}

function createUserInputQuestion(question) {
  const container = document.getElementById("user-info-container");

  const divElement = document.createElement("div");
  divElement.style.margin = "10px 0";
  divElement.style.display = "flex";
  divElement.style.flexDirection = "column";

  const labelElement = document.createElement("label");
  labelElement.innerHTML = question;
  labelElement.htmlFor = question.replace(/\s/g, "-");
  labelElement.classList.add("information-label");

  const selectElement = document.createElement("select");
  selectElement.id = question.replace(/\s/g, "-");
  selectElement.classList.add("select-input");

  if (selectElement.id == "Age") {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select your age";
    selectElement.appendChild(emptyOption);

    for (let age = 10; age <= 100; age++) {
      const optionElement = document.createElement("option");
      optionElement.value = age;
      optionElement.textContent = age;
      selectElement.appendChild(optionElement);
    }
  } else if (selectElement.id == "Sex") {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select your sex";
    selectElement.appendChild(emptyOption);

    const optionElement1 = document.createElement("option");
    optionElement1.value = "Masculine";
    optionElement1.textContent = "Masculine";
    selectElement.appendChild(optionElement1);

    const optionElement2 = document.createElement("option");
    optionElement2.value = "Feminine";
    optionElement2.textContent = "Feminine";
    selectElement.appendChild(optionElement2);
  } else if (selectElement.id == "Platform") {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent =
      "Select the platform from where you found the form";
    selectElement.appendChild(emptyOption);

    const optionElement0 = document.createElement("option");
    optionElement0.value = "EMOF";
    optionElement0.textContent = "EMOF";
    selectElement.appendChild(optionElement0);

    const optionElement1 = document.createElement("option");
    optionElement1.value = "Facebook";
    optionElement1.textContent = "Facebook";
    selectElement.appendChild(optionElement1);

    const optionElement2 = document.createElement("option");
    optionElement2.value = "Instagram";
    optionElement2.textContent = "Instagram";
    selectElement.appendChild(optionElement2);

    const optionElement3 = document.createElement("option");
    optionElement3.value = "Messenger";
    optionElement3.textContent = "Messenger";
    selectElement.appendChild(optionElement3);

    const optionElement4 = document.createElement("option");
    optionElement4.value = "WhatsApp";
    optionElement4.textContent = "WhatsApp";
    selectElement.appendChild(optionElement4);

    const optionElement5 = document.createElement("option");
    optionElement5.value = "Discord";
    optionElement5.textContent = "Discord";
    selectElement.appendChild(optionElement5);

    const optionElement6 = document.createElement("option");
    optionElement6.value = "Reddit";
    optionElement6.textContent = "Reddit";
    selectElement.appendChild(optionElement6);

    const optionElement7 = document.createElement("option");
    optionElement7.value = "Other";
    optionElement7.textContent = "Other";
    selectElement.appendChild(optionElement7);
  } else if (selectElement.id == "Occupation") {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select your occupation";
    selectElement.appendChild(emptyOption);

    const optionElement0 = document.createElement("option");
    optionElement0.value = "Child";
    optionElement0.textContent = "Child";
    selectElement.appendChild(optionElement0);

    const optionElement1 = document.createElement("option");
    optionElement1.value = "Student";
    optionElement1.textContent = "Student";
    selectElement.appendChild(optionElement1);

    const optionElement2 = document.createElement("option");
    optionElement2.value = "Employed";
    optionElement2.textContent = "Employed";
    selectElement.appendChild(optionElement2);

    const optionElement3 = document.createElement("option");
    optionElement3.value = "Unemployed";
    optionElement3.textContent = "Unemployed";
    selectElement.appendChild(optionElement3);

    const optionElement4 = document.createElement("option");
    optionElement4.value = "Self-Employed";
    optionElement4.textContent = "Self-Employed";
    selectElement.appendChild(optionElement4);

    const optionElement5 = document.createElement("option");
    optionElement5.value = "Freelancer";
    optionElement5.textContent = "Freelancer";
    selectElement.appendChild(optionElement5);

    const optionElement6 = document.createElement("option");
    optionElement6.value = "Entrepreneur";
    optionElement6.textContent = "Entrepreneur";
    selectElement.appendChild(optionElement6);

    const optionElement8 = document.createElement("option");
    optionElement8.value = "Homemaker";
    optionElement8.textContent = "Homemaker";
    selectElement.appendChild(optionElement8);

    const optionElement9 = document.createElement("option");
    optionElement9.value = "Retired";
    optionElement9.textContent = "Retired";
    selectElement.appendChild(optionElement9);

    const optionElement7 = document.createElement("option");
    optionElement7.value = "Other";
    optionElement7.textContent = "Other";
    selectElement.appendChild(optionElement7);
  } else if (selectElement.id == "Relationship-Status") {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select your relationship status";
    selectElement.appendChild(emptyOption);

    const optionElement0 = document.createElement("option");
    optionElement0.value = "Single";
    optionElement0.textContent = "Single";
    selectElement.appendChild(optionElement0);

    const optionElement1 = document.createElement("option");
    optionElement1.value = "In a relationship";
    optionElement1.textContent = "In a relationship";
    selectElement.appendChild(optionElement1);

    const optionElement2 = document.createElement("option");
    optionElement2.value = "Engaged";
    optionElement2.textContent = "Engaged";
    selectElement.appendChild(optionElement2);

    const optionElement3 = document.createElement("option");
    optionElement3.value = "Divorced";
    optionElement3.textContent = "Divorced";
    selectElement.appendChild(optionElement3);

    const optionElement4 = document.createElement("option");
    optionElement4.value = "In a polyamorous relationship";
    optionElement4.textContent = "In a polyamorous relationship";
    selectElement.appendChild(optionElement4);

    const optionElement7 = document.createElement("option");
    optionElement7.value = "Other";
    optionElement7.textContent = "Other";
    selectElement.appendChild(optionElement7);
  } else {
    const counties = [
      "Alba",
      "Arad",
      "Arges",
      "Bacau",
      "Bihor",
      "Bistrita-Nasaud",
      "Botosani",
      "Brasov",
      "Braila",
      "Buzau",
      "Caras-Severin",
      "Calarasi",
      "Cluj",
      "Constanta",
      "Covasna",
      "Dambovita",
      "Dolj",
      "Galati",
      "Giurgiu",
      "Gorj",
      "Harghita",
      "Hunedoara",
      "Ialomita",
      "Iasi",
      "Ilfov",
      "Maramures",
      "Mehedinti",
      "Mures",
      "Neamt",
      "Olt",
      "Prahova",
      "Satu Mare",
      "Salaj",
      "Sibiu",
      "Suceava",
      "Teleorman",
      "Timis",
      "Tulcea",
      "Valcea",
      "Vaslui",
      "Vrancea",
    ];

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select your location";
    selectElement.appendChild(emptyOption);

    for (let i = 0; i < counties.length; i++) {
      const optionElement = document.createElement("option");
      optionElement.value = counties[i];
      optionElement.textContent = counties[i];
      selectElement.appendChild(optionElement);
    }
  }

  divElement.appendChild(labelElement);
  divElement.appendChild(selectElement);

  container.appendChild(divElement);
}

function getUserInfoResponses() {
  const inputs = document
    .getElementById("user-info-container")
    .getElementsByTagName("select");

  let responses = [];

  for (let i = 0; i < inputs.length; i++) {
    console.log(inputs[i]);
    let input = inputs[i];
    let questionText = input.id.replace(/-/g, " ");
    let answer = input.value;
    responses.push({ question: questionText, answer: answer });
  }

  return responses;
}

function validateResponses() {
  let isValid = true;

  userInfoResponses.forEach((responseItem) => {
    let words = responseItem.answer.split(" ");
    if (words.length > 1) {
      isValid = false;
    }
  });

  return isValid;
}

const emotions_list = [
  [
    {
      color: "#ffffff",
      name: "",
    },
  ],
  [
    {
      color: "#2983c5",
      name: "Grief",
    },
    {
      color: "#8973b3",
      name: "Loathing",
    },
    {
      color: "#f05b61",
      name: "Rage",
    },
    {
      color: "#f6923d",
      name: "Vigilance",
    },
    {
      color: "#ffca05",
      name: "Ecstasy",
    },
    {
      color: "#8ac650",
      name: "Admiration",
    },
    {
      color: "#00a551",
      name: "Terror",
    },
    {
      color: "#0099cd",
      name: "Amazement",
    },
  ],
  [
    {
      color: "#74a8da",
      name: "Sadness",
    },
    {
      color: "#a390c4",
      name: "Disgust",
    },
    {
      color: "#f2736d",
      name: "Anger",
    },
    {
      color: "#f9ad66",
      name: "Anticipation",
    },
    {
      color: "#ffdc7b",
      name: "Joy",
    },
    {
      color: "#abd26a",
      name: "Trust",
    },
    {
      color: "#30b575",
      name: "Fear",
    },
    {
      color: "#36aed7",
      name: "Surprise",
    },
  ],
  [
    {
      color: "#a0c0e5",
      name: "Pensiveness",
    },
    {
      color: "#b9aad3",
      name: "Boredom",
    },
    {
      color: "#f48d80",
      name: "Annoyance",
    },
    {
      color: "#fcc487",
      name: "Interest",
    },
    {
      color: "#ffed9f",
      name: "Serenity",
    },
    {
      color: "#cadf8b",
      name: "Acceptance",
    },
    {
      color: "#7ac698",
      name: "Apprehension",
    },
    {
      color: "#89c7e4",
      name: "Distraction",
    },
  ],
  [
    {
      color: "#C9C8E4",
      name: "Remorse",
    },
    {
      color: "#EABBBF",
      name: "Contempt",
    },
    {
      color: "#FBC6B2",
      name: "Aggresiveness",
    },
    {
      color: "#FFF1CA",
      name: "Optimism",
    },
    {
      color: "#F2F5C9",
      name: "Love",
    },
    {
      color: "#B2DBB1",
      name: "Submission",
    },
    {
      color: "#A9D5C3",
      name: "Awe",
    },
    {
      color: "#C3DAEF",
      name: "Disapproval",
    },
  ],
];

function proceedToQuestions() {
  document.getElementById("image-container").style.display = "none";
  document.getElementById("create-title").style.display = "none";
  document.getElementById("description-box").style.display = "none";
  document.getElementById("user-info-container").style.display = "none";
  document.getElementById("next-btn").style.display = "none";

  document.getElementById("answer-container").style.display = "block";
  document.getElementById("back-btn").style.display = "block";
  document.getElementById("question").style.display = "block";
  document.getElementById("howyoufeel-header").style.display = "flex";
  document.getElementById("next-button").style.display = "block";
  pageCounter++;
  updatePage();
  console.log(pageCounter);

  const canvas = document.getElementById("wheel-canvas");
  canvas.width = document.getElementById("wheel-container").offsetWidth;
  canvas.height = document.getElementById("wheel-container").offsetHeight;
  const context = canvas.getContext("2d");

  for (let k = 4; k >= 0; k--) {
    let angle = (2 * Math.PI) / emotions_list[k].length;
    let ratio = (k + 1) / 5;
    let width = ratio * canvas.width;
    let height = ratio * canvas.height;
    let radius = Math.min(width, height) / 2;

    for (let i = 0; i < emotions_list[k].length; i++) {
      let startAngle = -Math.PI / 2 + i * angle;
      let endAngle = -Math.PI / 2 + (i + 1) * angle;

      if (k == 4) {
        startAngle = -Math.PI / 2 + i * angle + angle / 2;
        endAngle = -Math.PI / 2 + (i + 1) * angle + angle / 2;
      }

      context.beginPath();
      context.moveTo(canvas.width / 2, canvas.height / 2);
      context.arc(
        canvas.width / 2,
        canvas.height / 2,
        radius,
        startAngle,
        endAngle
      );
      context.closePath();

      context.fillStyle = emotions_list[k][i].color;
      context.fill();

      let x =
        canvas.width / 2 -
        (radius - 30) * Math.cos(Math.PI / 2 + i * angle + angle / 2);
      let y =
        canvas.height / 2 -
        (radius - 30) * Math.sin(Math.PI / 2 + i * angle + angle / 2);

      if (k == 4) {
        x =
          canvas.width / 2 -
          (radius - 30) * Math.cos(Math.PI / 2 + i * angle + angle);
        y =
          canvas.height / 2 -
          (radius - 30) * Math.sin(Math.PI / 2 + i * angle + angle);
      }

      context.save();
      context.textAlign = "center";

      context.strokeStyle = "black";
      context.lineWidth = 1;

      context.font = "11px Arial";
      context.fillStyle = "black";
      context.fillText(emotions_list[k][i].name, x, y);
      context.restore();

      const segment = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: radius,
        startAngle: startAngle,
        endAngle: endAngle,
      };
      if(first_time_draw) {
        canvas.addEventListener("click", function (event) {
          const rect = canvas.getBoundingClientRect();

          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          context.beginPath();

          context.arc(
            segment.x,
            segment.y,
            segment.radius,
            segment.startAngle,
            segment.endAngle
          );
          context.lineTo(segment.x, segment.y);
          context.closePath();

          if (context.isPointInPath(x, y)) {
            const a = x - canvas.width / 2;
            const b = y - canvas.height / 2;
            const distance = Math.sqrt(a * a + b * b);

            const h = (distance / (canvas.width / 2)) * 5;

            circle_number = parseInt(h, 10);

            if (circle_number == k && k != 0) {
              emotion = emotions_list[circle_number][i].name;
              color = emotions_list[circle_number][i].color;

              let tagsContainer = document.getElementById(
                "howyoufeel-tags-container"
              );

              if (!selectedEmotions[pageCounter]) {
                selectedEmotions[pageCounter] = [];
              }

              if (!selectedEmotions[pageCounter].includes(emotion)) {
                selectedEmotions[pageCounter].push(emotion);
              } else {
                const index = selectedEmotions[pageCounter].indexOf(emotion);
                if (index > -1) {
                  selectedEmotions[pageCounter].splice(index, 1);
                }
              }

              updateTagsContainer();
            }
          }
        });
      }
    }
  }
  first_time_draw = false;
}

function back() {
  if (pageCounter == 1) {
    document.getElementById("image-container").style.display = "block";
    document.getElementById("create-title").style.display = "block";
    document.getElementById("description-box").style.display = "block";
    document.getElementById("user-info-container").style.display = "flex";
    document.getElementById("next-btn").style.display = "block";

    document.getElementById("answer-container").style.display = "none";
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("question").style.display = "none";
    document.getElementById("howyoufeel-header").style.display = "none";
    document.getElementById("next-button").style.display = "none";

    pageCounter--;
  } else {
    pageCounter--;
    updatePage();
  }

  console.log(pageCounter);
}
