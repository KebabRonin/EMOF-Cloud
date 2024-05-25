var formName;
var requested;
var fetchedData;
var barChartArray;

function fetchData(id_form) {
  fetch( `/statistics/data/${id_form}`)
    .then((response) => response.json())
    .then((data) => {
      window.scrollTo(0, 0);
      console.log(data);
      fetchedData = data;
      formName = data.form_name;
      requested = data.requested;
      document.getElementById("form-name").textContent = formName;
      createCanvasElements(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
// fetchData(id_form);

function createCanvasElements(data) {
  if(data.answers.length == 0){
    return;
  }
  const container = document.getElementById("container");
  container.innerHTML = "";
  const platform = findWordPosition(data.requested, "Platform");
  const location1 = findWordPosition(data.requested, "Location");
  const age = findWordPosition(data.requested, "Age");
  const occupation = findWordPosition(data.requested, "Occupation");
  const sex = findWordPosition(data.requested, "Sex");
  const relationship = findWordPosition(data.requested, "Relationship Status");

  createPieChart(data.answers);
  console.log()
  if(Object.keys(data.questions).length > 2){
    createRadarChartQuestions(data);
  }
  createBarChartTop3(data);

  createLineChartSubmitTime(data);
  createBubbleChart(data.answers);
  if (age >= 0) {
    createBarChartAge(data.answers);
  }
  if (sex >= 0) {
    createPieChartSex(data.answers);
  }
  if (location1 >= 0) {
    createPolarChartLocation(data.answers);
  }
  if (platform >= 0) {
    createDoughnutChartPlatform(data.answers);
  }
  if (relationship >= 0) {
    createDoughnutChartRelationshipStatus(data.answers);
  }
  if (occupation >= 0) {
    createPolarChartOccupation(data.answers);
  }

  setTimeout(() => {
    const subtitle = document.createElement("h2");
    subtitle.id = "emotionsPerQuestions";
    subtitle.textContent = "Emotions for each Question:";
    container.appendChild(subtitle);
  }, 0);

  setTimeout(() => {
    Object.keys(data.questions).forEach((questionKey, index) => {
      const question = data.questions[questionKey];
      const answers = data.answers.map(
        (answer) => answer.response[questionKey]
      );
      const canvas = document.createElement("canvas");
      canvas.id = `${data.form_name}Question${questionKey}`;
      container.appendChild(canvas);
      createBarChart(canvas.id, question, answers);
    });
  }, 0);
}

function generateOccupationColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = i * (360 / count);
    const color = hslToRgb(hue, 70, 50);
    colors.push(color);
  }
  return colors;
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function formatDateTime(date) {
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function calculateStepSize(counts) {
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  const range = maxCount - minCount;

  if (range <= 5) {
    return 1; // Small range, use a step size of 1
  } else if (range <= 20) {
    return 2; // Medium range, use a step size of 2
  } else {
    return Math.ceil(range / 10); // Large range, use a step size of 1/10th of the range
  }
}

function generateRandomColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const color = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ];
    colors.push(color);
  }
  return colors;
}

function calculateDurationInSeconds(duration) {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

function calculateBubbleSize(emotions, duration) {
  const complexity = emotions * duration;
  const scalingFactor = 0.05;
  const bubbleSize = complexity * scalingFactor;
  return bubbleSize;
}

function extractNumberFromCanvasId(canvasId) {
  const regex = /(\d+)$/;
  const matches = canvasId.match(regex);
  if (matches && matches.length > 1) {
    return parseInt(matches[1]);
  }
  return null;
}

function findWordPosition(array, word) {
  var position = array.indexOf(word);
  return position;
}

function capitalizeWord(word) {
  if (typeof word !== "string") {
    return "";
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getDataFromCanvasElements() {
  const canvasElements = document.querySelectorAll("canvas");
  const data = [];

  canvasElements.forEach((canvas) => {
    const question = canvas.getAttribute("data-question");
    const answers = canvas.getAttribute("data-answers").split(",");

    const Answers = {};
    answers.forEach((answer) => {
      const trimmedAnswer = answer.trim();
      if (Answers.hasOwnProperty(trimmedAnswer)) {
        Answers[trimmedAnswer]++;
      } else {
        Answers[trimmedAnswer] = 1;
      }
    });

    data.push({ question, Answers });
  });

  return data;
}

function excludeElements(htmlContent) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlContent, "text/html");

  var elementsToExclude = [
    doc.getElementById("downloadButton"),
    doc.getElementById("download"),
    doc.querySelector("div.landing-section-header"),
    doc.querySelector('script[src="StatisticsMicroservice\\statistics.js"]'),
    doc.querySelector('script[src="https://cdn.jsdelivr.net/npm/chart.js"]'),
    doc.querySelector(
      'script[src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"]'
    ),
    doc.querySelector('link[rel="icon"]'),
  ];
  elementsToExclude.forEach(function (element) {
    if (element) {
      element.parentNode.removeChild(element);
    }
  });

  const scriptElements = doc.querySelectorAll("script");
  scriptElements.forEach((script) => script.remove());

  const canvasElements = doc.querySelectorAll("canvas");
  canvasElements.forEach((canvas) => {
    const imageBase64 = canvas.getAttribute("data-chart-image");
    const imgElement = doc.createElement("img");
    imgElement.src = imageBase64;
    canvas.parentNode.replaceChild(imgElement, canvas);
  });

  var bodyElement = doc.querySelector("body");
  bodyElement.style.backgroundImage = "none";
  bodyElement.style.backgroundColor = "rgb(62, 163, 194)";

  var titleElement = doc.querySelector("title");
  titleElement.textContent = formName;

  var styleElements = doc.querySelectorAll('link[rel="stylesheet"]');
  styleElements.forEach(function (styleElement) {
    var cssContent = "";
    var href = styleElement.getAttribute("href");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", href, false);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        cssContent = xhr.responseText;
      }
    };
    xhr.send();

    var style = doc.createElement("style");
    style.innerHTML = cssContent;
    styleElement.parentNode.replaceChild(style, styleElement);
  });

  return doc.documentElement.outerHTML;
}

function exportChartDataCSV() {
  const container = document.getElementById("container");
  const canvasElements = container.getElementsByTagName("canvas");
  const chartIds = Array.from(canvasElements).map((canvas) => canvas.id);

  const csvData = [];

  chartIds.forEach((chartId) => {
    const chartCanvas = document.getElementById(chartId);
    const chartInstance = Chart.getChart(chartCanvas);

    const datasets = chartInstance.data.datasets;
    const title = chartInstance.options.plugins.title.text;

    let chartCsvContent = "";

    if (chartId === `${formName}BubbleChart`) {
      chartCsvContent += `${title}\nAverage Duration,Min Duration,Max Duration,Average # Emotions,Min # Emotions,Max # emotions,Average Complexity\n`;

      const data = datasets[0].data;

      const durations = data.map((item) => item.y);
      const emotions = data.map((item) => item.x);
      const complexities = data.map((item) => item.r);
      const averageDuration = (
        durations.reduce((sum, value) => sum + value, 0) / durations.length
      ).toFixed(2);
      const smallestDuration = Math.min(...durations);
      const biggestDuration = Math.max(...durations);
      const averageEmotions = (
        emotions.reduce((sum, value) => sum + value, 0) / emotions.length
      ).toFixed(2);
      const smallestEmotions = Math.min(...emotions);
      const biggestEmotions = Math.max(...emotions);
      const averageComplexity = (
        complexities.reduce((sum, value) => sum + value, 0) /
        complexities.length
      ).toFixed(2);

      chartCsvContent += `${averageDuration}s,${smallestDuration}s,${biggestDuration}s,${averageEmotions},${smallestEmotions},${biggestEmotions},${averageComplexity}\n`;
    } else if (chartId === "lineChartSubmitTime") {
      chartCsvContent += `${title}\n`;
      chartCsvContent += `"Label",Value,Percentage\n`;

      const labels = chartInstance.data.labels;
      const data = datasets[0].data;

      const total = data.reduce((sum, value) => sum + value, 0);
      const percentages = data.map((value) =>
        ((value / total) * 100).toFixed(2)
      );

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const value = data[i];
        const percentage = percentages[i];

        chartCsvContent += `"${label}",${value},${percentage}%\n`;
      }
    } else if (chartId === "radarChart") {
      const labels = chartInstance.data.labels;
      chartCsvContent += `${title}\nLabel,Positivity,Negativity,Neutrality\n`;

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const positivity = datasets[0].data[i];
        const negativity = datasets[1].data[i];
        const neutrality = datasets[2].data[i];

        chartCsvContent += `${label},${positivity},${negativity},${neutrality}\n`;
      }
    } else {
      chartCsvContent += `${title}\nLabel,Value,Percentage\n`;

      const data = datasets[0].data;
      const labels = chartInstance.data.labels;

      const total = data.reduce((sum, value) => sum + value, 0);
      const percentages = data.map((value) =>
        ((value / total) * 100).toFixed(2)
      );

      for (let i = 0; i < data.length; i++) {
        const label = labels[i];
        const value = data[i];
        const percentage = percentages[i];

        chartCsvContent += `${label},${value},${percentage}%\n`;
      }
    }

    csvData.push(chartCsvContent);
  });

  const combinedCsvContent = csvData.join("\n");

  const filename = formName + ".csv";
  const csvBlob = new Blob([combinedCsvContent], { type: "text/csv" });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(csvBlob, filename);
  } else {
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function exportChartDataJSON() {
  const container = document.getElementById("container");
  const canvasElements = container.getElementsByTagName("canvas");
  const chartIds = Array.from(canvasElements).map((canvas) => canvas.id);

  const jsonData = [];

  chartIds.forEach((chartId) => {
    const chartCanvas = document.getElementById(chartId);
    const chartInstance = Chart.getChart(chartCanvas);

    const datasets = chartInstance.data.datasets;
    const title = chartInstance.options.plugins.title.text;

    let chartJsonContent = {};

    if (chartId === `${formName}BubbleChart`) {
      chartJsonContent.title = title;

      const data = datasets[0].data;

      const durations = data.map((item) => item.y);
      const emotions = data.map((item) => item.x);
      const complexities = data.map((item) => item.r);
      const averageDuration = (
        durations.reduce((sum, value) => sum + value, 0) / durations.length
      ).toFixed(2);
      const smallestDuration = Math.min(...durations);
      const biggestDuration = Math.max(...durations);
      const averageEmotions = (
        emotions.reduce((sum, value) => sum + value, 0) / emotions.length
      ).toFixed(2);
      const smallestEmotions = Math.min(...emotions);
      const biggestEmotions = Math.max(...emotions);
      const averageComplexity = (
        complexities.reduce((sum, value) => sum + value, 0) /
        complexities.length
      ).toFixed(2);

      chartJsonContent.averageDuration = averageDuration;
      chartJsonContent.smallestDuration = smallestDuration;
      chartJsonContent.biggestDuration = biggestDuration;
      chartJsonContent.averageEmotions = averageEmotions;
      chartJsonContent.smallestEmotions = smallestEmotions;
      chartJsonContent.biggestEmotions = biggestEmotions;
      chartJsonContent.averageComplexity = averageComplexity;
    } else if (chartId === "lineChartSubmitTime") {
      chartJsonContent.title = title;
      chartJsonContent.data = [];

      const labels = chartInstance.data.labels;
      const data = datasets[0].data;

      const total = data.reduce((sum, value) => sum + value, 0);
      const percentages = data.map((value) =>
        ((value / total) * 100).toFixed(2)
      );

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const value = data[i];
        const percentage = percentages[i];

        chartJsonContent.data.push({ label, value, percentage });
      }
    } else if (chartId === "radarChart") {
      chartJsonContent.title = title;
      chartJsonContent.data = [];

      const labels = chartInstance.data.labels;

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const positivity = datasets[0].data[i];
        const negativity = datasets[1].data[i];
        const neutrality = datasets[2].data[i];

        chartJsonContent.data.push({ label, positivity, negativity, neutrality });
      }
    } else {
      chartJsonContent.title = title;
      chartJsonContent.data = [];

      const data = datasets[0].data;
      const labels = chartInstance.data.labels;

      const total = data.reduce((sum, value) => sum + value, 0);
      const percentages = data.map((value) =>
        ((value / total) * 100).toFixed(2)
      );

      for (let i = 0; i < data.length; i++) {
        const label = labels[i];
        const value = data[i];
        const percentage = percentages[i];

        chartJsonContent.data.push({ label, value, percentage });
      }
    }

    jsonData.push(chartJsonContent);
  });

  const jsonString = JSON.stringify(jsonData, null, 2);
  const filename = formName + ".json";
  const jsonBlob = new Blob([jsonString], { type: "application/json" });

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(jsonBlob, filename);
  } else {
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


document
  .getElementById("downloadHTMLButton")
  .addEventListener("click", function () {
    const htmlContent = document.documentElement.outerHTML;
    const modifiedHTML = excludeElements(htmlContent);

    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedHTML, "text/html");

    const container = doc.getElementById("container");
    container.innerHTML = ``;

    const canvases = Array.from(document.querySelectorAll("canvas"));

    const imagePromises = canvases.map((canvas) => {
      return new Promise((resolve) => {
        const tempImage = new Image();
        tempImage.onload = () => {
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          const rectWidth = canvas.width + 60;
          const rectHeight = canvas.height + 60;
          tempCanvas.width = rectWidth;
          tempCanvas.height = rectHeight;
          tempCtx.fillStyle = "#ffffff";
          tempCtx.fillRect(0, 0, rectWidth, rectHeight);

          const offsetX = (rectWidth - canvas.width) / 2;
          const offsetY = (rectHeight - canvas.height) / 2;

          tempCtx.drawImage(tempImage, offsetX, offsetY);

          const imageBase64 = tempCanvas.toDataURL();
          const imageElement = document.createElement("img");
          imageElement.src = imageBase64;
          container.appendChild(imageElement);
          resolve();
        };
        tempImage.src = canvas.toDataURL();
      });
    });

    Promise.all(imagePromises).then(() => {
      const serializer = new XMLSerializer();
      const modifiedHTMLString = serializer.serializeToString(doc);
      const blob = new Blob([modifiedHTMLString], { type: "text/html" });
      const fileName = formName + ".html";
      saveAs(blob, fileName);
    });
  });

document
  .getElementById("downloadCSVButton")
  .addEventListener("click", exportChartDataCSV);

document
  .getElementById("downloadJSONButton")
  .addEventListener("click", exportChartDataJSON);

const colorMapping = {
  Grief: [41, 131, 197],
  Sadness: [116, 168, 218],
  Pensiveness: [160, 192, 229],
  Loathing: [137, 115, 179],
  Disgust: [163, 144, 196],
  Boredom: [185, 170, 211],
  Rage: [240, 91, 97],
  Anger: [242, 115, 109],
  Annoyance: [244, 141, 128],
  Vigilance: [246, 146, 61],
  Anticipation: [249, 173, 102],
  Interest: [252, 196, 135],
  Ecstasy: [255, 202, 5],
  Joy: [255, 220, 123],
  Serenity: [255, 237, 159],
  Admiration: [138, 198, 80],
  Trust: [171, 210, 106],
  Acceptance: [202, 223, 139],
  Terror: [0, 165, 81],
  Fear: [48, 181, 117],
  Apprehension: [122, 198, 152],
  Amazement: [0, 153, 205],
  Surprise: [54, 174, 215],
  Distraction: [137, 199, 228],
  Disapproval: [195, 218, 239],
  Remorse: [201, 200, 228],
  Contempt: [234, 187, 191],
  Aggresiveness: [251, 198, 178],
  Optimism: [255, 241, 202],
  Love: [242, 245, 201],
  Submission: [178, 219, 177],
  Awe: [169, 213, 195],
};

const colorMappingCategories = {
  positive: [0, 255, 0],
  negative: [255, 0, 0],
  neutral: [0, 0, 255],
};

const platformColorMapping = {
  Facebook: [66, 103, 178],
  Instagram: [225, 48, 108],
  EMOF: [255, 255, 84],
  Messenger: [0, 178, 255],
  WhatsApp: [37, 211, 102],
  Discord: [114, 137, 218],
  Reddit: [255, 86, 0, 1],
  Other: [20, 179, 51],
  "Not mentioned": [211, 211, 211],
};

const positiveEmotions = [
  "Joy",
  "Admiration",
  "Trust",
  "Interest",
  "Serenity",
  "Optimism",
  "Love",
  "Awe",
];
const negativeEmotions = [
  "Grief",
  "Sadness",
  "Loathing",
  "Disgust",
  "Boredom",
  "Rage",
  "Anger",
  "Annoyance",
  "Remorse",
  "Contempt",
  "Aggressiveness",
  "Terror",
  "Fear",
  "Apprehension",
];
const neutralEmotions = [
  "Pensiveness",
  "Vigilance",
  "Anticipation",
  "Distraction",
  "Acceptance",
  "Amazement",
  "Surprise",
  "Submission",
];

const colorAgeCategories = {
  "<14": [0, 255, 0],
  "15-18": [255, 0, 0],
  "18-24": [0, 0, 255],
  "25-29": [255, 255, 0],
  "30-39": [0, 255, 255],
  "40-49": [255, 0, 255],
  "50-59": [255, 165, 0],
  "60+": [128, 128, 128],
  "Not mentioned": [211, 211, 211],
};

function createBarChart(canvasId, question, answers) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  let totalCount = 0;

  let Answers = {};

  answers.forEach((emotionArray) => {
    totalCount += emotionArray.length;

    emotionArray.forEach((emotion) => {
      const trimmedEmotion = capitalizeWord(emotion.trim());
      if (Answers.hasOwnProperty(trimmedEmotion)) {
        Answers[trimmedEmotion]++;
      } else {
        Answers[trimmedEmotion] = 1;
      }
    });
  });

  const sortedAnswers = Object.keys(Answers).sort(
    (a, b) => Answers[b] - Answers[a]
  );

  const labels = sortedAnswers.map((answer) => {
    const count = Answers[answer];
    const percentage = ((count / totalCount) * 100).toFixed(2) + "%";
    return answer;
  });

  const data = sortedAnswers.map((answer) => Answers[answer]);
  const colors = sortedAnswers.map((answer) => {
    const rgb = colorMapping[answer];
    return `rgb(${rgb.join(", ")})`;
  });

  canvas.setAttribute("data-question", question);
  canvas.setAttribute(
    "data-answers",
    answers.map((answer) => JSON.stringify(answer)).join(",")
  );

  const maxCount = Math.max(...data);
  const maxCountWithBuffer = Math.ceil(maxCount * 1.1); 

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "",
          data: data,
          borderWidth: 1,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: extractNumberFromCanvasId(canvasId) + ". " + question,
          font: {
            size: 30,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const dataIndex = context.dataIndex;
              const count = data[dataIndex];
              const percentage = ((count / totalCount) * 100).toFixed(2) + "%";
              return (
                sortedAnswers[dataIndex] +
                ": " +
                count +
                " Answers (" +
                percentage +
                ")"
              );
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxCountWithBuffer,
          stepSize: 1,
          ticks: {
            precision: 0,
            callback: function (value) {
              if (value % 1 === 0) {
                return value;
              }
              return null;
            },
          },
        },
      },
    },
  });
}

function createBubbleChart(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const bubbleCanvas = document.createElement("canvas");
  bubbleCanvas.id = `${formName}BubbleChart`;
  document.getElementById("container").appendChild(bubbleCanvas);
  const ctx = bubbleCanvas.getContext("2d");

  const chartData = data.map((item) => {
    const answerCounts = Object.values(item.response).reduce(
      (counts, emotionsArray) => {
        emotionsArray.forEach((emotion) => {
          const trimmedEmotion = capitalizeWord(emotion.trim());
          counts[trimmedEmotion] = (counts[trimmedEmotion] || 0) + 1;
        });
        return counts;
      },
      {}
    );

    const maxCount = Math.max(...Object.values(answerCounts));
    const mostUsedAnswer = Object.keys(answerCounts).find(
      (answer) => answerCounts[answer] === maxCount
    );
    const color = colorMapping[mostUsedAnswer];
    const backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;

    const numEmotions = Object.values(item.response).flat().length;
    const duration = calculateDurationInSeconds(item.duration);

    return {
      x: numEmotions,
      y: duration,
      r: calculateBubbleSize(numEmotions, duration),
      backgroundColor: backgroundColor,
    };
  });

  const maxEmotions = Math.max(...chartData.map((item) => item.x));
  const maxDuration = Math.max(...chartData.map((item) => item.y));
  const roundedMaxDuration = Math.ceil(maxDuration / 60) * 60;

  new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [
        {
          data: chartData,
          backgroundColor: chartData.map((data) => data.backgroundColor),
        },
      ],
    },
    options: {
      aspectRatio: 2,
      plugins: {
        title: {
          display: true,
          text: "Form Difficulty",
          font: {
            size: 30,
          },
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const dataIndex = context.dataIndex;
              const item = chartData[dataIndex];
              const duration = item.y;
              const numEmotions = item.x;
              const difficulty = item.r;

              let durationLabel;
              if (duration >= 60) {
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                if (seconds == 0) {
                  durationLabel = `${minutes} min`;
                } else {
                  durationLabel = `${minutes} min ${seconds} s`;
                }
              } else {
                durationLabel = `${duration} s`;
              }

              return `Duration: ${durationLabel}, Emotions: ${numEmotions}, Difficulty: ${difficulty}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Duration to Complete",
          },
          ticks: {
            callback: (value) => {
              if (value >= 60) {
                const minutes = Math.floor(value / 60);
                const seconds = value % 60;
                if (seconds == 0) {
                  return `${minutes} min`;
                }
                return `${minutes} min ${seconds} s`;
              }
              return `${value} s`;
            },
          },
          max: roundedMaxDuration,
        },
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Distinct Emotions",
          },
          max: maxEmotions + 2,
        },
      },
    },
  });
}

function createPieChart(data) {
  const pieCanvas = document.createElement("canvas");
  pieCanvas.id = "pieChart";
  document.getElementById("container").appendChild(pieCanvas);

  const pieCtx = pieCanvas.getContext("2d");

  const emotionCounts = {
    Positive: 0,
    Negative: 0,
    Neutral: 0,
  };

  data.forEach((item) => {
    const response = item.response;
    Object.values(response).forEach((emotions) => {
      console.log(emotions);
      emotions.forEach((emotion) => {
        const trimmedEmotion = emotion.trim();
        if (positiveEmotions.includes(trimmedEmotion)) {
          emotionCounts.Positive++;
        } else if (negativeEmotions.includes(trimmedEmotion)) {
          emotionCounts.Negative++;
        } else if (neutralEmotions.includes(trimmedEmotion)) {
          emotionCounts.Neutral++;
        }
      });
    });
  });

  const labels = ["Positivity", "Negativity", "Neutrality"];
  const counts = [
    emotionCounts.Positive,
    emotionCounts.Negative,
    emotionCounts.Neutral,
  ];
  const colors = ["rgb(2, 191, 5)", "rgb(191, 2, 2)", "rgb(2, 103, 191)"];

  const chartTitle = "Overall Emotion Distribution";

  const pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      aspectRatio: 2,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            font: {
              size: 16,
            },
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map(function (label, index) {
                  const value = data.datasets[0].data[index];
                  const total = data.datasets[0].data.reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(2);
                  return {
                    text: `${label}`,
                    fillStyle: data.datasets[0].backgroundColor[index],
                    hidden: chart.getDatasetMeta(0).data[index].hidden,
                    lineCap: "round",
                    lineDash: [],
                    lineDashOffset: 0,
                    lineJoin: "round",
                    lineWidth: 1,
                    strokeStyle: data.datasets[0].backgroundColor[index],
                    pointStyle: "circle",
                    rotation: 0,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.formattedValue || "";
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
          afterLabel: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(2);
            return `Percentage: ${percentage}%`;
          },
        },
      },
    },
  });

  return { chart: pieChart, labels: labels, counts: counts, title: chartTitle };
}

function createDoughnutChartPlatform(data) {
  const canvas = document.createElement("canvas");
  canvas.id = "doughnutChartPlatform";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const platformCounts = {};

  data.forEach((item) => {
    const userInfo = item.user_info;
    const platformQuestion = "Platform";
  
    const platformInfo = userInfo.find((info) => info.question === platformQuestion);
  
    if (platformInfo) {
      var received = platformInfo.answer;
      if(received == ""){
        received = "Not mentioned";
      }
      if (platformCounts.hasOwnProperty(received)) {
        platformCounts[received]++;
      } else {
        platformCounts[received] = 1;
      }
    }
  });  

  const labels = Object.keys(platformCounts);
  const counts = Object.values(platformCounts);
  const colors = labels.map((platform) => platformColorMapping[platform]);

  const total = counts.reduce((sum, count) => sum + count, 0);
  const percentages = counts.map(
    (count) => ((count / total) * 100).toFixed(2) + "%"
  );

  const doughnutData = {
    labels: labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors.map((color) => `rgba(${color.join(",")}, 1)`),
      },
    ],
  };

  chartTitle = "Platform Distribution";

  const doughnutChart = new Chart(canvas, {
    type: "doughnut",
    data: doughnutData,
    options: {
      aspectRatio: 2,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label;
              const count = counts[context.dataIndex];
              const percentage = percentages[context.dataIndex];
              return `${label}: ${count} Users (${percentage})`;
            },
          },
        },
      },
    },
  });

  return {
    chart: doughnutChart,
    labels: labels,
    counts: counts,
    title: chartTitle,
  };
}

function createPolarChartLocation(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "polarChartLocation";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const locationCounts = {};

  data.forEach((item) => {
    const userInfo = item.user_info;
    const locationQuestion = "Location";
  
    const locationInfo = userInfo.find((info) => info.question === locationQuestion);
  
    if (locationInfo) {
      var received = locationInfo.answer;
      if(received == ""){
        received = "Not mentioned";
      }
      if (locationCounts.hasOwnProperty(received)) {
        locationCounts[received]++;
      } else {
        locationCounts[received] = 1;
      }
    }
  });
  

  const labels = Object.keys(locationCounts);
  const counts = Object.values(locationCounts);

  const colors = generateRandomColors(labels.length);

  const maxCount = Math.max(...counts);
  const maxCountAdjusted = Math.ceil(maxCount * 1.1);

  const polarData = {
    labels: labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors.map((color) => `rgba(${color.join(",")}, 1)`),
      },
    ],
  };

  chartTitle = "Location Distribution";

  new Chart(canvas, {
    type: "polarArea",
    data: polarData,
    options: {
      aspectRatio: 2,
      plugins: {
        legend: {
          position: "right",
        },
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label;
              const count = counts[context.dataIndex];
              const percentage =
                ((count / maxCountAdjusted) * 100).toFixed(2) + "%";
              return `${label}: ${count} Users (${percentage})`;
            },
          },
        },
      },
      scales: {
        r: {
          suggestedMax: maxCountAdjusted,
          ticks: {
            precision: 0,
            stepSize: calculateStepSize(counts),
          },
        },
      },
    },
  });

  return {
    chart: canvas,
    labels: labels,
    counts: counts,
    title: chartTitle,
  };
}

function createLineChartSubmitTime(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "lineChartSubmitTime";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const publishedAt = new Date(data.published_at);
  const closedAt = new Date(data.closed_at);

  const durationInMinutes = Math.round((closedAt - publishedAt) / (1000 * 60));

  let groupingInterval = 1;

  if (durationInMinutes >= 60) {
    groupingInterval = 20;
  } else if (durationInMinutes >= 1440) {
    groupingInterval = 720;
  } else if (durationInMinutes >= 10) {
    groupingInterval = 5;
  }

  const timePeriods = [];
  for (let i = 0; i <= durationInMinutes; i += groupingInterval) {
    const currentTime = new Date(publishedAt.getTime() + i * 60 * 1000);
    timePeriods.push(currentTime);
  }
  const labels = timePeriods.map((time) => formatDateTime(time));

  const responseCountByTime = {};

  data.answers.forEach((answer) => {
    const submittedAt = new Date(answer.submitted_at);
    const timePeriod = timePeriods.find(
      (time) =>
        time <= submittedAt &&
        submittedAt < new Date(time.getTime() + groupingInterval * 60 * 1000)
    );

    if (timePeriod) {
      responseCountByTime[timePeriod] =
        (responseCountByTime[timePeriod] || 0) + 1;
    }
  });

  const totalFormsSubmitted = data.answers.length;

  const dataPoints = timePeriods.map((time) => {
    const count = responseCountByTime[time] || 0;
    const percentage = ((count / totalFormsSubmitted) * 100).toFixed(2);
    return { count, percentage };
  });

  const lineData = {
    labels: labels,
    datasets: [
      {
        label: "Form Submissions",
        data: dataPoints.map((point) => point.count),
        fill: false,
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    aspectRatio: 2,
    elements: {
      line: {
        tension: 0.3,
      },
    },
    plugins: {
      legend: {
        display: true,
        labes: {
          font: {
            size: 30,
          },
        },
      },
      title: {
        display: true,
        text: "Form Submissions over Time",
        font: {
          size: 30,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const point = dataPoints[index];
            return `${context.dataset.label}: ${point.count} (${point.percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 1,
        },
        suggestedMax: totalFormsSubmitted,
      },
    },
  };

  new Chart(canvas, {
    type: "line",
    data: lineData,
    options: lineOptions,
  });
}

function createRadarChartQuestions(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "radarChart";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const questions = Object.values(data.questions).map(
    (question, index) => `${index + 1}. ${question}`
  );

  const datasets = [
    {
      label: "Positivity",
      data: [],
      backgroundColor: "rgba(2, 191, 5, 0.4)",
      borderColor: "rgba(2, 191, 5, 1)",
      borderWidth: 2,
    },
    {
      label: "Negativity",
      data: [],
      backgroundColor: "rgba(191, 2, 2, 0.4)",
      borderColor: "rgba(191, 2, 2, 1)",
      borderWidth: 2,
    },
    {
      label: "Neutrality",
      data: [],
      backgroundColor: "rgba(2, 103, 191, 0.4)",
      borderColor: "rgba(2, 103, 191, 1)",
      borderWidth: 2,
    },
  ];

  questions.forEach((question) => {
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    data.answers.forEach((answer) => {
      const response = answer.response;
      const emotions = response[questions.indexOf(question) + 1] || [];

      emotions.forEach((emotion) => {
        if (positiveEmotions.includes(emotion)) {
          positiveCount++;
        } else if (negativeEmotions.includes(emotion)) {
          negativeCount++;
        } else if (neutralEmotions.includes(emotion)) {
          neutralCount++;
        }
      });
    });

    const totalEmotions = positiveCount + negativeCount + neutralCount;
    const positivityPercentage = (positiveCount / totalEmotions) * 100;
    const negativityPercentage = (negativeCount / totalEmotions) * 100;
    const neutralityPercentage = (neutralCount / totalEmotions) * 100;

    datasets[0].data.push(positivityPercentage.toFixed(2));
    datasets[1].data.push(negativityPercentage.toFixed(2));
    datasets[2].data.push(neutralityPercentage.toFixed(2));
  });

  const radarData = {
    labels: questions,
    datasets: datasets,
  };

  new Chart(canvas, {
    type: "radar",
    data: radarData,
    options: {
      aspectRatio: 2,
      scale: {
        pointLabels: {
          font: {
            size: 40,
          },
        },
        ticks: {
          beginAtZero: true,
          max: 100,
          stepSize: 10,
          callback: function (value) {
            return value + "%";
          },
          font: {
            size: 16,
          },
        },
        suggestedMax: 100,
      },
      plugins: {
        title: {
          display: true,
          text: "Question Reactions",
          font: {
            size: 30,
            weight: "bold",
          },
        },
        legend: {
          display: true,
          labels: {
            font: {
              size: 16,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const datasetLabel = context.dataset.label || "";
              const value = context.formattedValue || "";
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(2);
              return `${datasetLabel}: ${value}%`;
            },
          },
        },
      },
    },
  });
}

function createPolarChartOccupation(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "polarChartOccupation";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const occupationCounts = {};

  data.forEach((item) => {
    const userInfo = item.user_info;
    const occupationQuestion = "Occupation";
  
    const occupationInfo = userInfo.find((info) => info.question === occupationQuestion);
  
    if (occupationInfo) {
      var occupation = occupationInfo.answer;
      if(occupation == ""){
        occupation = "Not mentioned";
      }
      if (occupationCounts.hasOwnProperty(occupation)) {
        occupationCounts[occupation]++;
      } else {
        occupationCounts[occupation] = 1;
      }
    }
  });
  

  const labels = Object.keys(occupationCounts);
  const counts = Object.values(occupationCounts);

  const colors = generateOccupationColors(labels.length);

  const maxCount = Math.max(...counts);
  const maxCountAdjusted = Math.ceil(maxCount * 1.1);

  const polarData = {
    labels: labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors.map((color) => `rgba(${color.join(",")}, 1)`),
      },
    ],
  };

  chartTitle = "Occupation Distribution";

  new Chart(canvas, {
    type: "polarArea",
    data: polarData,
    options: {
      aspectRatio: 2,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label;
              const count = counts[context.dataIndex];
              const percentage =
                ((count / maxCountAdjusted) * 100).toFixed(2) + "%";
              return `${label}: ${count} Users (${percentage})`;
            },
          },
        },
        legend: {
          display: true,
        },
        centeredLabel: {
          display: true,
          fontColor: "#000",
          fontStyle: "bold",
          fontSize: 14,
          labels: labels.map((label, index) => ({
            text: label,
            color: `rgba(${colors[index].join(",")}, 1)`,
          })),
        },
      },
      scales: {
        r: {
          suggestedMax: maxCountAdjusted,
          ticks: {
            precision: 0,
            stepSize: calculateStepSize(counts),
          },
          pointLabels: {
            display: true,
            centerPointLabels: true,
            font: {
              size: 18,
            },
          },
        },
      },
    },
  });
}

function createBarChartAge(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "barChartAge";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const ageRanges = {
    "<14": 0,
    "15-18": 0,
    "18-24": 0,
    "25-29": 0,
    "30-39": 0,
    "40-49": 0,
    "50-59": 0,
    "60+": 0,
    "Not mentioned": 0,
  };

  data.forEach((item) => {
    const userInfo = item.user_info;
    const ageQuestion = "Age";
  
    const ageInfo = userInfo.find((info) => info.question === ageQuestion);
  
    if (ageInfo) {
      const age = parseInt(ageInfo.answer);
      if (!isNaN(age)) {
        if (age < 14) {
          ageRanges["<14"]++;
        } else if (age >= 15 && age <= 18) {
          ageRanges["15-18"]++;
        } else if (age >= 18 && age <= 24) {
          ageRanges["18-24"]++;
        } else if (age >= 25 && age <= 29) {
          ageRanges["25-29"]++;
        } else if (age >= 30 && age <= 39) {
          ageRanges["30-39"]++;
        } else if (age >= 40 && age <= 49) {
          ageRanges["40-49"]++;
        } else if (age >= 50 && age <= 59) {
          ageRanges["50-59"]++;
        } else {
          ageRanges["60+"]++;
        }
      } else {
        ageRanges["Not mentioned"]++;
      }
    }
  });
  
  const filteredRanges = Object.entries(ageRanges)
    .filter(([_, count]) => count > 0)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const labels = Object.keys(filteredRanges);
  const counts = Object.values(filteredRanges);

  const totalUsers = counts.reduce((sum, count) => sum + count, 0);
  const percentages = counts.map((count) =>
    ((count / totalUsers) * 100).toFixed(2)
  );

  const colors = Object.values(colorAgeCategories).map(
    (color) => `rgba(${color.join(",")}, 1)`
  );

  const barData = {
    labels: labels,
    datasets: [
      {
        label: "Age Distribution",
        data: counts,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  chartTitle = "Number of Users";

  new Chart(canvas, {
    type: "bar",
    data: barData,
    options: {
      plugins: {
        title: {
          display: true,
          text: "Age Distribution",
          font: {
            size: 30,
          },
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label;
              const count = context.dataset.data[context.dataIndex];
              const percentage = percentages[context.dataIndex];
              return `${label}: ${count} Users (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Age Categories",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: chartTitle,
          },
          ticks: {
            precision: 0,
            callback: function (value) {
              if (value % 1 === 0) {
                return value;
              }
              return null;
            },
          },
          stepSize: 1,
          suggestedMax: data.length,
        },
      },
    },
  });

  return {
    chart: canvas,
    labels: labels,
    counts: counts,
    title: chartTitle,
  };
}

function createPieChartSex(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "pieChartSex";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const sexCounts = {
    Masculine: 0,
    Feminine: 0,
    NaN: 0,
  };

  data.forEach((item) => {
    const userInfo = item.user_info;
    const sexQuestion = "Sex";
  
    var sexInfo = userInfo.find((info) => info.question === sexQuestion);
    if(sexInfo.answer == ""){
      sexInfo.answer = "Not mentioned";
    }
    if (sexInfo) {
      const sex = sexInfo.answer;
      if (sexCounts.hasOwnProperty(sex)) {
        sexCounts[sex]++;
      } else {
        sexCounts[sex] = 1;
      }
    }
  });
  
  const filteredCounts = Object.entries(sexCounts)
    .filter(([_, count]) => count > 0)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const labels = Object.keys(filteredCounts);
  const counts = Object.values(filteredCounts);

  const colors = {
    Masculine: [0, 123, 255],
    Feminine: [255, 99, 132],
    "Not mentioned": [192, 192, 192],
  };

  const backgroundColors = labels.map(
    (label) => `rgba(${colors[label].join(",")}, 1)`
  );

  const totalUsers = counts.reduce((sum, count) => sum + count, 0);
  const percentages = counts.map(
    (count) => ((count / totalUsers) * 100).toFixed(2) + "%"
  );

  chartTitle = "Sex Distribution";

  const config = {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      aspectRatio: 2,
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        legend: {
          position: "right",
          labels: {
            generateLabels: function (chart) {
              const labels = chart.data.labels;
              const dataset = chart.data.datasets[0];

              return labels.map((label, index) => ({
                text: `${label} (${percentages[index]})`,
                fillStyle: dataset.backgroundColor[index],
                hidden: !chart.isDatasetVisible(0),
                index: index,
              }));
            },
          },
          onClick: function (mouseEvent, legendItem, legend) {
            const dataset = legend.chart.data.datasets[0];
            const meta = legend.chart.getDatasetMeta(0);
            meta.data[legendItem.index].hidden =
              !meta.data[legendItem.index].hidden;
            legend.chart.update();
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label;
              const value = context.formattedValue;
              const index = context.dataIndex;
              const percentage = percentages[index];
              return `${label}: ${value} Users (${percentage})`;
            },
          },
        },
      },
    },
  };

  new Chart(canvas, config);

  return {
    chart: canvas,
    labels: labels,
    counts: counts,
    title: chartTitle,
  };
}

function createDoughnutChartRelationshipStatus(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "doughnutChartRelationshipStatus";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const relationshipStatusCounts = {
    Single: 0,
    "In a relationship": 0,
    Engaged: 0,
    Divorced: 0,
    "Not mentioned": 0,
  };

  data.forEach((item) => {
    const userInfo = item.user_info;
    const relationshipStatusQuestion = "Relationship Status";
  
    const relationshipStatusInfo = userInfo.find((info) => info.question === relationshipStatusQuestion);
  
    if (relationshipStatusInfo) {
      var status = relationshipStatusInfo.answer;
      if (relationshipStatusCounts.hasOwnProperty(status)) {
        relationshipStatusCounts[status]++;
      } else {
        relationshipStatusCounts["Not mentioned"]++;
      }
    }
  });
  
  const filteredCounts = Object.entries(relationshipStatusCounts)
    .filter(([_, count]) => count > 0)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const labels = Object.keys(filteredCounts);
  const counts = Object.values(filteredCounts);

  const colors = {
    Single: [0, 123, 255],
    "In a relationship": [255, 99, 132],
    Engaged: [255, 205, 86],
    Divorced: [75, 192, 192],
    "Not mentioned": [192, 192, 192],
  };

  const backgroundColors = labels.map(
    (label) => `rgba(${colors[label].join(",")}, 1)`
  );

  const totalUsers = counts.reduce((sum, count) => sum + count, 0);
  const percentages = counts.map(
    (count) => ((count / totalUsers) * 100).toFixed(2) + "%"
  );

  chartTitle = "Relationship Status Distribution";

  const config = {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      aspectRatio: 2,
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        legend: {
          position: "left",
          labels: {
            generateLabels: function (chart) {
              const labels = chart.data.labels;
              const dataset = chart.data.datasets[0];

              return labels.map((label, index) => ({
                text: `${label} (${percentages[index]})`,
                fillStyle: dataset.backgroundColor[index],
                hidden: !chart.isDatasetVisible(0),
                index: index,
              }));
            },
          },
          onClick: function (mouseEvent, legendItem, legend) {
            const dataset = legend.chart.data.datasets[0];
            const meta = legend.chart.getDatasetMeta(0);
            meta.data[legendItem.index].hidden =
              !meta.data[legendItem.index].hidden;
            legend.chart.update();
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label;
              const value = context.formattedValue;
              const index = context.dataIndex;
              const percentage = percentages[index];
              return `${label}: ${value} Users (${percentage})`;
            },
          },
        },
      },
    },
  };

  new Chart(canvas, config);

  return {
    chart: canvas,
    labels: labels,
    counts: counts,
    title: chartTitle,
  };
}

function createBarChartTop3(data) {
  Chart.defaults.backgroundColor = "#fff";
  Chart.defaults.borderColor = "#36A2EB";
  Chart.defaults.color = "#000";
  Chart.defaults.font.size = 16;
  const canvas = document.createElement("canvas");
  canvas.id = "barChartTop3Emotions";
  const container = document.getElementById("container");
  container.appendChild(canvas);

  const responses = data.answers.map(answer => Object.values(answer.response).flat());

  const flattenedResponses = [].concat(...responses);

  const responseCount = flattenedResponses.reduce((count, response) => {
    count[response] = (count[response] || 0) + 1;
    return count;
  }, {});

  const sortedResponses = Object.keys(responseCount).sort((a, b) => responseCount[b] - responseCount[a]);

  const totalResponses = sortedResponses.reduce((sum, response) => sum + responseCount[response], 0);

  const percentages = sortedResponses.map(response => ((responseCount[response] / totalResponses) * 100).toFixed(2) + '%');

  const top3Responses = sortedResponses.slice(0, 3);
  const top3Counts = top3Responses.map(response => responseCount[response]);
  const top3Percentages = top3Responses.map(response => percentages[sortedResponses.indexOf(response)]);

  const backgroundColors = top3Responses.map(response => {
    const color = colorMapping[response];
    const rgbaColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    return rgbaColor;
  });

  const borderColor = top3Responses.map(response => {
    const color = colorMapping[response];
    const rgbaColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    return rgbaColor;
  });

  const chartTitle = "Top 3 Emotions Overall";

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top3Responses.map((response, index) => `${response}`),
      datasets: [{
        label: 'Response Count',
        data: top3Counts,
        backgroundColor: backgroundColors,
        borderColor: borderColor,
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 30,
          },
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const count = context.dataset.data[context.dataIndex];
              const response = top3Responses[context.dataIndex];
              const percentage = top3Percentages[context.dataIndex];
              return `${response}: Count: ${count} (${percentage})`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          }
        }
      }
    }
  });
}
