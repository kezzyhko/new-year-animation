// constants

var ballSymbols = ['/', '\\', '_', '"', '<', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var ballColors = ['purple', 'brown', 'orange', 'tomato', 'orchid', 'navy', 'fuchsia'];
textColors = Array.from(ballColors);
var treeSymbolsColors = {'M': 'green', '|': 'saddlebrown'};
starColor = 'red';

var widthPrecision = 10, heightPrecision = 3, speedBase = 1.05;

var settingPresets = {
	'Snow': {
		wind: -1,
		speed: 37,
		snowhillHeight: 3,
		fallingRate: 1/30,
		meltingRate: 15/1000,
		snowSymbol: '*',
	},
	'Rain 1': {
		wind: -1,
		speed: 80,
		snowhillHeight: 1,
		fallingRate: 0.04,
		meltingRate: 0.1,
		snowSymbol: '/',
	},
};
settingPresets['Rain 2'] = Object.assign({}, settingPresets['Rain 1']); 
settingPresets['Rain 2'].wind = 1;
settingPresets['Rain 2'].snowSymbol = '\\';
var settings = Object.assign({}, settingPresets['Snow']); 
settings.volume = 0.1;



// helper functions and variables

function randomElement(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

var snow = null;
var treeSymbols = Object.getOwnPropertyNames(treeSymbolsColors);



document.addEventListener("DOMContentLoaded", function() {

	// helper variables
	var picture = document.getElementById('picture').innerText;
	var snowBlock = document.getElementById('snow');
	var treeBlock = document.getElementById('tree');
	var H = document.getElementById('H');
	var settingInputs = document.getElementsByClassName('setting');
	var fullscreenButton = document.getElementById('fullscreen-button');
	var audio = document.getElementById('audio');
	var muteButton = document.getElementById('mute-button');
	var volumeChange = document.getElementById('volume-change');
	var settingPresetsSelect = document.getElementById('setting-presets-select');
	var settingPresetsApply = document.getElementById('setting-presets-apply');

	// handle settings inputs
	function settingChanged(s) {
		settings[s.name] = (s.type === 'range') ? parseFloat(s.value) : s.value;
	}
	for (let i = 0; i < settingInputs.length; i++) {
		let s = settingInputs[i];
		s.value = settings[s.name]; //initial settings
		s.id = s.name + "-setting";
		s.addEventListener('input', function(e) {settingChanged(e.target)});
	}


	// handle special buttons
		// fullscreen icon
		fullscreenButton.addEventListener('click', function(e) {
			let promise;
			if (document.fullscreen) {
				promise = document.exitFullscreen();
			} else {
				promise = document.documentElement.requestFullscreen();
			}
			promise.then(e => {
				fullscreenButton.innerHTML = document.fullscreen ? '&#59207;' : '&#59205;';
			}).catch(alert);
		});

		// mute icon
		muteButton.addEventListener('click', function(e) {
			if (audio.paused) {
				audio.play().then(e => {
					muteButton.innerHTML = '&#57395;';
				}).catch(alert);
			} else {
				audio.pause();
				muteButton.innerHTML = '&#57356;';
			}
		});

		// volume change slider
		volumeChange.addEventListener('input', function(e) {
			if (audio.paused) {
				audio.play().then(e => {
					muteButton.innerHTML = '&#57395;';
				}).catch(alert);
			}
			audio.volume = e.target.value;
			settings.volume = e.target.value;
		});
		audio.volume = settings.volume;

		// setting presets select and button
		for (const presetName of Object.keys(settingPresets)) {
			let option = document.createElement('option');
			option.innerText = option.value = presetName;
			settingPresetsSelect.append(option);
		}
		settingPresetsApply.addEventListener('click', function(e) {
			let preset = settingPresets[settingPresetsSelect.value];
			Object.assign(settings, preset);
			for (const [name, value] of Object.entries(preset)) {
				document.getElementById(name+"-setting").value = value;
			}
		});


	// change dots in the tree's star to current year
	let now = new Date();
	picture = picture.replace('....', now.getFullYear() + (now.getMonth() >= 6 ? 1 : 0));

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


	// the animation code
	function moveSnow() {
		for (let i = height - 1; i >= 0; i--) {
			if (Math.random() < settings.fallingRate*Math.abs(settings.wind)) {
				snow[i][0] = settings.snowSymbol;
			}
			if (Math.random() < settings.fallingRate*Math.abs(settings.wind)) {
				snow[i][width-1] = settings.snowSymbol;
			}
		}

		for (let j = width - 1; j >= 0; j--) {
			if (Math.random() < settings.fallingRate) {
				snow[0][j] = settings.snowSymbol;
			}
			if (Math.random() < settings.meltingRate) {
				snow[height-1][j] = ' ';
			}
		}

		for (let i = height - 1; i >= 1; i--) {
			for (let j = width - 1; j >= 0; j--) {
				if (snow[i][j] != ' ') {
					snow[i][j] = settings.snowSymbol;
				}
				if (snow[i-1][j] != ' ') {
					let rand = randomElement([-1, 0, 1]);
					snow[i][j+rand+settings.wind] = settings.snowSymbol;
				}
				if (i <= height-settings.snowhillHeight || snow[i][j-1] == ' ' || snow[i][j] == ' ' || snow[i][j+1] == ' ') {
					snow[i-1][j] = ' ';
				}
			}
		}

		snowBlock.innerText = snow.map(function(line){return line.slice(0, width).join('');}).join('\n');
	}


	// snow initialization
	function initSnow() {
		// calculate size
		pre = document.createElement('pre');
		pre.style.visibility = 'hidden';
		pre.style.position = 'absolute';
		document.body.append(pre);
		pre.innerText += ' '.repeat(widthPrecision);
		width = Math.ceil(window.innerWidth/pre.clientWidth*widthPrecision);
		pre.innerHTML += ' <br>'.repeat(heightPrecision);
		height = Math.ceil(window.innerHeight/pre.clientHeight*heightPrecision);
		pre.remove();
		
		// init empty space for snow
		snowBlock.innerHTML = '';
		snow = Array(height).fill(null);
		snow = snow.map(function(){return Array(width).fill(' ');});

		// randomize initial snow
		for (let i = 0; i <= 2*height; i++) {
			moveSnow();
		}
	}
	window.addEventListener('resize', initSnow);
	initSnow();

	// start the animation
	function moveSnowInterval() {
		moveSnow();
		setTimeout(moveSnowInterval, 1000/Math.pow(speedBase, settings.speed));
	}
	moveSnowInterval();

});