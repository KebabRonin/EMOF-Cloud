// Set up canvas
const canvas = document.getElementById('wheel-canvas');
canvas.width = document.getElementById('wheel-container').offsetWidth;
canvas.height = document.getElementById('wheel-container').offsetHeight;
const context = canvas.getContext('2d');


const emotions_list = [
	[{ color: "#ffffff" ,name: ""}],
	[{ color: '#2983c5', name: 'Grief' },
	{ color: '#8973b3', name: 'Loathing' },
	{ color: '#f05b61', name: 'Rage' },
	{ color: '#f6923d', name: 'Vigilance' },
	{ color: '#ffca05', name: 'Ecstasy' },
	{ color: '#8ac650', name: 'Admiration' },
	{ color: '#00a551', name: 'Terror' },
	{ color: '#0099cd', name: 'Amazement' }],
	[{ color: '#74a8da', name: 'Sadness' },
	{ color: '#a390c4', name: 'Disgust' },
	{ color: '#f2736d', name: 'Anger' },
	{ color: '#f9ad66', name: 'Anticipation' },
	{ color: '#ffdc7b', name: 'Joy' },
	{ color: '#abd26a', name: 'Trust' },
	{ color: '#30b575', name: 'Fear' },
	{ color: '#36aed7', name: 'Surprise' }],
	[{ color: '#a0c0e5', name: 'Pensiveness' },
	{ color: '#b9aad3', name: 'Boredom' },
	{ color: '#f48d80', name: 'Annoyance' },
	{ color: '#fcc487', name: 'Interest' },
	{ color: '#ffed9f', name: 'Serenity' },
	{ color: '#cadf8b', name: 'Acceptance' },
	{ color: '#7ac698', name: 'Apprehension' },
	{ color: '#89c7e4', name: 'Distraction' }],
	[{ color: '#C9C8E4', name: 'Remorse' },
	{ color: '#EABBBF', name: 'Contempt' },
	{ color: '#FBC6B2', name: 'Aggresiveness' },
	{ color: '#FFF1CA', name: 'Optimism' },
	{ color: '#F2F5C9', name: 'Love' },
	{ color: '#B2DBB1', name: 'Submission' },
	{ color: '#A9D5C3', name: 'Awe' },
	{ color: '#C3DAEF', name: 'Disapproval' }]
  ];


//selected emotions
let selectedEmotions = [];

// Draw each emotion segment
for (let k = 4; k >= 0; k--) {
	
	let angle = (2 * Math.PI) / emotions_list[k].length;
	let ratio = (k + 1 ) / 5;
	let width = ratio * canvas.width;
	let height = ratio * canvas.height;
	let radius = Math.min(width, height) / 2;

	for (let i = 0; i < emotions_list[k].length; i++) {

		let startAngle = -Math.PI / 2 + i * angle;
		let endAngle = -Math.PI / 2 + (i + 1) * angle;

		if(k == 4){
			startAngle = -Math.PI / 2 + i * angle + angle/2;
			endAngle = -Math.PI / 2 + (i + 1) * angle + angle/2;
		}

		context.beginPath();
		context.moveTo(canvas.width / 2, canvas.height / 2);
		context.arc(canvas.width / 2, canvas.height / 2, radius, startAngle, endAngle);
		context.closePath();

		context.fillStyle = emotions_list[k][i].color;
		context.fill();

		let x = (canvas.width / 2 - (radius - 30) * Math.cos(Math.PI / 2 + i * angle + angle / 2));
		let y = (canvas.height / 2 - (radius - 30) * Math.sin(Math.PI / 2 + i * angle + angle / 2));

		if(k == 4){
			x = (canvas.width / 2 - (radius - 30) * Math.cos(Math.PI / 2 + i * angle + angle));
			y = (canvas.height / 2 - (radius - 30) * Math.sin(Math.PI / 2 + i * angle + angle));
		}

		context.save();
		context.textAlign = 'center';

		// Set up stroke for text
		context.strokeStyle = 'black';
		context.lineWidth = 1;

		context.font = '11px Arial';
		//context.strokeText(emotions_list[k][i].name, x, y);
		context.fillStyle = 'black';
		context.fillText(emotions_list[k][i].name, x, y);
		context.restore();

		const segment = {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: radius,
			startAngle: startAngle,
			endAngle: endAngle,
		};

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
				
				///Calculate what emotion the user clicked on
				const a = x - canvas.width/2;
				const b = y - canvas.height/2;
				const distance = Math.sqrt(a*a + b*b);

				const h = distance/(canvas.width/2) * 5

				circle_number = parseInt(h,10)
				
				if(circle_number == k && k != 0){
					
					emotion = emotions_list[circle_number][i].name;
					color = emotions_list[circle_number][i].color;
					
					
					let tagsContainer = document.getElementById('howyoufeel-tags-container');
					
					if (!selectedEmotions.includes(emotion)) {
						
						selectedEmotions.push(emotion);
						
						let tag = document.createElement("div")
						let text = document.createTextNode(emotion);
						
						tag.appendChild(text);
						tag.style.backgroundColor = color;
						tag.id = emotion;
						
						tagsContainer.appendChild(tag);
					} else {
						let tag = document.getElementById(emotion);
						
						tagsContainer.removeChild(tag);
						
						const index = selectedEmotions.indexOf(emotion);
						if (index > -1) {
							selectedEmotions.splice(index, 1);
						}
					}
				}
			}
		});
	}

}



