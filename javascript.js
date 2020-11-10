// constants

var wind = -1, snowhillHeight = 3, fallingRate = 6, meltingRate = 2.7, speed = 6;
var ballSymbols = ['/', '\\', '_', '"', '<', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var ballColors = ['purple', 'brown', 'orange', 'tomato', 'orchid', 'navy', 'fuchsia'];
var treeSymbolsColors = {'M': 'green', '|': 'saddlebrown'};



// helper functions and variables

function randomElement(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

var moveSnowInterval = null;
var textColors = [];
Object.assign(textColors, ballColors);
var treeSymbols = Object.getOwnPropertyNames(treeSymbolsColors);



window.onload = function() {
	// make everything colorful
	var picture = document.getElementById('picture').innerText;
	var treeBlock = document.getElementById('tree');
	treeBlock.innerHTML = '';
	for (var i = 0; i <= picture.length - 1; i++) {
		if (ballSymbols.indexOf(picture[i]) >= 0) {
			symbol = picture[i];
			
			if (i >= picture.indexOf(treeSymbols[0])) {
				if (picture[i-1] == treeSymbols[0] && picture[i] == ballSymbols[0]) {
					previousColor = randomElement(ballColors);
					ballColors.splice(ballColors.indexOf(previousColor), 1);
				}
				color = previousColor;
			}
			else color = 'red';
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

	// see below
	window.onresize();
	
	// blinking h1 text
	var H = document.getElementById('H');
	function blinkText(delay) {
		if (delay < 300) delay = 1000;
		setTimeout(blinkText, delay, delay/1.1);
		H.style.color = randomElement(textColors);
	}
	blinkText(0);
}



window.onresize = function() {
	// calculate size
	width = Math.floor(window.innerWidth/8.5);
	height = Math.floor(window.innerHeight/18);
	
	// init empty space for snow
	var snowBlock = document.getElementById('snow');
	snowBlock.innerHTML = '';
	var snow = Array(height).fill(null);
	snow = snow.map(function(){return Array(width).fill(' ');});

	// randomize initial snow
	for (var i = 0; i <= 2*height; i++) {
		moveSnow();
	}
	
	// start animation
	function moveSnow() {
		for (var i = height - 1; i >= 0; i--) {
			if (Math.random() < fallingRate/height) {
				snow[i][0] = '*';
			}
			if (Math.random() < fallingRate/height) {
				snow[i][width-1] = '*';
			}
		}
		for (var j = width - 1; j >= 0; j--) {
			if (Math.random() < fallingRate/width) {
				snow[0][j] = '*';
			}
			if (Math.random() < meltingRate/width) {
				snow[height-1][j] = ' ';
			}
		}
		for (var i = height - 1; i >= 1; i--) {
			for (var j = width - 1; j >= 0; j--) {
				var rand = randomElement([-1, 0, 1]) + wind;
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
	clearInterval(moveSnowInterval);
	moveSnowInterval = setInterval(moveSnow, 1000/speed);
}