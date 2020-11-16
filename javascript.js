// constants

var ballSymbols = ['/', '\\', '_', '"', '<', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var ballColors = ['purple', 'brown', 'orange', 'tomato', 'orchid', 'navy', 'fuchsia'];
textColors = Array.from(ballColors);
var treeSymbolsColors = {'M': 'green', '|': 'saddlebrown'};
starColor = 'red';

var widthPrecision = 10, heightPrecision = 3, sidePadding = 8, speedBase = 1.05;

shareLinks = [
	{
		src: './brand-icons/twitter.svg',
		alt: 'Twitter',
		hrefbase: 'https://twitter.com/share?url=',
	},
	{
		src: './brand-icons/facebook.svg',
		alt: 'Facebook',
		hrefbase: 'http://www.facebook.com/sharer.php?u=',
	},
	{
		src: './brand-icons/vk.svg',
		alt: 'VK',
		hrefbase: 'https://vk.com/share.php?url=',
	},
];



// settings

	settingNamesToShare = ['wind', 'speed', 'snowhillHeight', 'fallingRate', 'meltingRate', 'snowSymbol'];

	// presets
	var settingPresets = {
		'Snow': {
			wind: -1,
			speed: 37,
			snowhillHeight: 3,
			fallingRate: 1/30,
			meltingRate: 15/1000,
			snowSymbol: '*',
		},
		'Blizzard': {
			wind: 5,
			speed: 70,
			snowhillHeight: 10,
			fallingRate: 0.03,
			meltingRate: 0.005,
			snowSymbol: '*',
		},
		'Rain to the left': {
			wind: -1,
			speed: 80,
			snowhillHeight: 1,
			fallingRate: 0.04,
			meltingRate: 0.1,
			snowSymbol: '/',
		},
	};
	settingPresets['Rain to the right'] = Object.assign({}, settingPresets['Rain to the left']); 
	settingPresets['Rain to the right'].wind = 1;
	settingPresets['Rain to the right'].snowSymbol = '\\';
	Object.assign(settingPresets, {
		'Panic': {
			wind: 0,
			speed: 55,
			snowhillHeight: 10,
			fallingRate: 0.03,
			meltingRate: 0.006,
			snowSymbol: 'A',
		},
	});

	// localStorage management
	settings = {}
	function g(key) {
		if (key in settings) {
			return settings[key];
		}
		let type_and_value = window.localStorage.getItem('new-year-animation|'+key);
		if (type_and_value == null) {
			return null;
		}
		let [type, value] = type_and_value.split('|');
		let result = (type == 'number') ? parseFloat(value) : value;
		settings[key] = result;
		return result;
	}
	function s(key, value, overwrite=true) {
		if (overwrite || g(key) == null) {
			settings[key] = value;
			window.localStorage.setItem('new-year-animation|'+key, (typeof value)+'|'+value);
		}
	}

	// default settings
	for (const [name, value] of Object.entries(settingPresets['Snow'])) {
		s(name, value, false);
	}
	s('volume', 0.1, false);

	// load settings from query string
	let settingsFromQuery;
	try {
		let query = document.location.search;
		query = (query[0] == '?') ? query.replace('?', '') : query;
		settingsFromQuery = JSON.parse(atob(query));
		for (const name of settingNamesToShare) {
			if (name in settingsFromQuery) {
				s(name, settingsFromQuery[name]);
			}
		}
	} catch (e) {
		console.log(e);
	}
	let currentLink = new URL(document.location);
	currentLink.search = '';
	window.history.replaceState({}, document.title, currentLink.toString());



// other helper functions and variables

function randomElement(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

var snow = null;
var treeSymbols = Object.getOwnPropertyNames(treeSymbolsColors);
var shareLink = new URL(document.location.protocol + '//' + document.location.host + document.location.pathname);



document.addEventListener("DOMContentLoaded", function() {

	// get elements
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
	var share = document.getElementById('share');
	var shareLinkInput = document.getElementById('share-link-input');
	var shareLinkCopyButton = document.getElementById('share-link-copy-button');
	var shareLinkIncludeSettings = document.getElementById('share-link-include-settings');

	// handle settings inputs
	for (let i = 0; i < settingInputs.length; i++) {
		let input = settingInputs[i];
		input.value = g(input.name);
		input.id = input.name + "-setting";
		input.addEventListener('input', function(e) {
			s(e.target.name, (e.target.type === 'range') ? parseFloat(e.target.value) : e.target.value);
		});
	}


	// handle special buttons
		function activateKeyPress(e) {
			if (e.keyCode == 32 || e.keyCode == 13 || e.keyCode == 10) {
				e.target.activateFunction(e);
			}
		}

		// add social share buttons
		function shareSocial(e) {
			window.open(
				e.target.hrefbase + encodeURIComponent(shareLinkInput.value),
				'popUpWindow',
				'height=400,width=600,left=10,top=10,,scrollbars=yes,menubar=no'
			);
		}
		for (const shareLink of shareLinks) {
			let img = document.createElement('img');
			img.tabIndex = 0;
			Object.assign(img, shareLink);
			img.activateFunction = shareSocial;
			img.addEventListener('keydown', activateKeyPress);
			img.addEventListener('click', shareSocial);
			share.append(img);
		}

		// fullscreen icon
		function toggleFullscreen(e) {
			let promise;
			if (document.fullscreen) {
				promise = document.exitFullscreen();
			} else {
				promise = document.documentElement.requestFullscreen();
			}
			promise.then(e => {
				fullscreenButton.innerHTML = document.fullscreen ? '&#59207;' : '&#59205;';
			}).catch(console.log);
		}
		fullscreenButton.activateFunction = toggleFullscreen;
		fullscreenButton.addEventListener('keydown', activateKeyPress);
		fullscreenButton.addEventListener('click', toggleFullscreen);

		// mute icon
		function toggleMute(e) {
			if (audio.paused) {
				audio.play().then(e => {
					muteButton.innerHTML = '&#57395;';
				}).catch(console.log);
			} else {
				audio.pause();
				muteButton.innerHTML = '&#57356;';
			}
		}
		muteButton.activateFunction = toggleMute;
		muteButton.addEventListener('keydown', activateKeyPress);
		muteButton.addEventListener('click', toggleMute);

		// volume change slider
		volumeChange.addEventListener('input', function(e) {
			if (audio.paused) {
				audio.play().then(e => {
					muteButton.innerHTML = '&#57395;';
				}).catch(console.log);
			}
			audio.volume = e.target.value;
			s('volume', e.target.value);
		});
		audio.volume = g('volume');

		// setting presets select and button
		for (const presetName of Object.keys(settingPresets)) {
			let option = document.createElement('option');
			option.innerText = option.value = presetName;
			settingPresetsSelect.append(option);
		}
		settingPresetsSelect.addEventListener('change', function(e) {
			let preset = settingPresets[e.target.value];
			for (const [name, value] of Object.entries(preset)) {
				s(name, value);
				document.getElementById(name+"-setting").value = value;
			}
			e.target.value = '';
		});

		// share section
		shareLinkInput.value = document.location.href;
		shareLinkCopyButton.addEventListener('click', function(e) {
			shareLinkInput.focus();
			shareLinkInput.select();
			document.execCommand('copy');
		});
		shareLinkInput.addEventListener('blur', function(e) {
			document.getSelection().removeAllRanges();
		});
		shareLinkIncludeSettings.addEventListener('change', function(e) {
			if (e.target.checked) {
				let settingsToShare = {};
				for (const name of settingNamesToShare) {
					settingsToShare[name] = g(name);
				}
				shareLink.search = btoa(JSON.stringify(settingsToShare));
			} else {
				shareLink.search = '';
			}
			shareLinkInput.value = shareLink.toString();
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
		for (let i = height - 1; i >= 1; i--) {
			for (let j = width - 1; j >= 0; j--) {
				if (snow[i][j] != ' ') {
					snow[i][j] = g('snowSymbol');
				}
				if (snow[i-1][j] != ' ') {
					let rand = randomElement([-1, 0, 1]);
					snow[i][j+rand+g('wind')] = g('snowSymbol');
				}
				if (i <= height-g('snowhillHeight') || snow[i][j-1] == ' ' || snow[i][j] == ' ' || snow[i][j+1] == ' ') {
					snow[i-1][j] = ' ';
				}
			}
		}

		for (let i = height - 1; i >= 0; i--) {
			if (Math.random() < g('fallingRate')*Math.abs(g('wind'))) {
				snow[i][0] = g('snowSymbol');
			}
			if (Math.random() < g('fallingRate')*Math.abs(g('wind'))) {
				snow[i][width-1] = g('snowSymbol');
			}
		}

		for (let j = width - 1; j >= 0; j--) {
			if (Math.random() < g('fallingRate')) {
				snow[0][j] = g('snowSymbol');
			}
			if (Math.random() < g('meltingRate')) {
				snow[height-1][j] = ' ';
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
		width = Math.ceil(window.innerWidth/pre.clientWidth*widthPrecision) + 2*sidePadding;
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
		setTimeout(moveSnowInterval, 1000/Math.pow(speedBase, g('speed')));
	}
	moveSnowInterval();

});