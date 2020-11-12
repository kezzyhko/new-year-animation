// constants

var wind = -1, snowhillHeight = 3, fallingRate = 1/30, meltingRate = 15/1000, speed = 6;

var ballSymbols = ['/', '\\', '_', '"', '<', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var ballColors = ['purple', 'brown', 'orange', 'tomato', 'orchid', 'navy', 'fuchsia'];
textColors = Array.from(ballColors);
var treeSymbolsColors = {'M': 'green', '|': 'saddlebrown'};
starColor = 'red';

var widthPrecision = 10, heightPrecision = 3;



// helper functions and variables

function randomElement(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

var moveSnowInterval = null;
var snow = null;
var treeSymbols = Object.getOwnPropertyNames(treeSymbolsColors);


window.onload = function() {

	// helper variables
	var snowBlock = document.getElementById('snow');
	var treeBlock = document.getElementById('tree');
	var H = document.getElementById('H');
	var picture = document.getElementById('picture').innerText;

	// change dots to current year
	picture = picture.replace('....', new Date().getFullYear() + 1);

	// make everything colorful
	treeBlock.innerHTML = '';
	for (let i = 0; i <= picture.length - 1; i++) {
		if (ballSymbols.indexOf(picture[i]) >= 0) {
			symbol = picture[i];
			
			if (i < picture.indexOf(treeSymbols[0])) {
				color = starColor;
			}
			else {
				if (picture[i-1] == treeSymbols[0] && picture[i] == ballSymbols[0]) { // if new ball
					previousColor = randomElement(ballColors);
					ballColors.splice(ballColors.indexOf(previousColor), 1);
				}
				color = previousColor;
			};
		}
		else if (treeSymbols.indexOf(picture[i]) >= 0) {
			symbol = picture[i];
			color = treeSymbolsColors[symbol];
		}
		else {
			symbol = (picture[i] == '\n') ? '\n' : ' ';
			color = null;
		}
		
		if (color != null) {
			treeBlock.innerHTML += '<span style="color: ' + color + '">' + picture[i] + '</span>';
		}
		else {
			treeBlock.innerHTML += symbol;
		}
	}
	document.getElementById('picture').hidden = true;
	
	// blinking h1 text
	function blinkText(delay) {
		if (delay < 300) delay = 1000;
		setTimeout(blinkText, delay, delay/1.1);
		H.style.color = randomElement(textColors);
	}
	blinkText(0);


	// window size dependent code
	window.onresize = function() {

		// calculate size
		pre = document.createElement('pre');
		pre.style.visibility="hidden";
		pre.style.position = "absolute"
		document.body.append(pre);
		pre.innerText += '*'.repeat(widthPrecision);
		width = Math.ceil(window.innerWidth/pre.clientWidth*widthPrecision);
		pre.innerHTML += '*<br>'.repeat(heightPrecision);
		height = Math.ceil(window.innerHeight/pre.clientHeight*heightPrecision);
		
		// init empty space for snow
		snowBlock.innerHTML = '';
		snow = Array(height).fill(null);
		snow = snow.map(function(){return Array(width).fill(' ');});

		// randomize initial snow
		for (let i = 0; i <= 2*height; i++) {
			moveSnow();
		}

	}
	window.onresize();
		
	// the animation code
	function moveSnow() {
		for (let i = height - 1; i >= 0; i--) {
			if (Math.random() < fallingRate) {
				snow[i][0] = '*';
			}
			if (Math.random() < fallingRate) {
				snow[i][width-1] = '*';
			}
		}
		for (let j = width - 1; j >= 0; j--) {
			if (Math.random() < fallingRate) {
				snow[0][j] = '*';
			}
			if (Math.random() < meltingRate) {
				snow[height-1][j] = ' ';
			}
		}
		for (let i = height - 1; i >= 1; i--) {
			for (let j = width - 1; j >= 0; j--) {
				let rand = randomElement([-1, 0, 1]) + wind;
				if (snow[i-1][j] == '*') {
					snow[i][j+rand] = '*';
				}
				if (i <= height-snowhillHeight || snow[i][j-1]+snow[i][j]+snow[i][j+1] != '***') {
					snow[i-1][j] = ' ';
				}
			}
		}

		snowBlock.innerText = snow.map(function(line){return line.slice(0, width).join('');}).join('\n');
	}

	moveSnowInterval = setInterval(moveSnow, 1000/speed);

}