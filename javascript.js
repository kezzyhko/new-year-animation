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



// other helper functions and variables

function randomElement(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

var snow = null;
var treeSymbols = Object.keys(treeSymbolsColors);
var shareLink = new URL(document.location.protocol + '//' + document.location.host + document.location.pathname);
var currentLink = new URL(document.location);
var closestYear = new Date().getFullYear() + (new Date().getMonth() >= 6 ? 1 : 0);



// multiple languages

	var translations = {
		en: {
			'another-language':		"РУ",
			'title': 				"HAPPY NEW YEAR",

			'section-settings':		"Settings",
			'settings-wind':		"Wind:",
			'settings-speed':		"Speed:",
			'settings-height':		"Snowdrift height:",
			'settings-amount':		"Amount of snow:",
			'settings-melting':		"Speed of melting:",
			'settings-symbol':		"Snowflake symbol:",
			'settings-blinking':	"Blinking text:",

			'presets-select':		"Settings presets",
			'presets-snow':			"Snow",
			'presets-blizzard':		"Blizzard",
			'presets-rain-left':	"Rain to the left",
			'presets-rain-right':	"Rain to the right",
			'presets-panic':		"Panic",
			'presets-default':		"Default (clear all settings)",

			'section-share':		"Share",
			'share-incl-settings':	"Include current settings",
			'share-incl-language':	"Include current language",
			'share-copy':			"Copy",

			'section-credits':		"Credits",
			'credits-fulltext':		'Made by <a href="https://vk.com/kezzyhko">kezzyhko</a><br>' + 
									'Sources are on <a href="https://github.com/kezzyhko/new-year-animation">GitHub</a><br>' + 
									'Thanks for icons to <a href="https://fontello.com/">Fontello</a><br>' + 
									'Music: unknown. If you know it - write to me and I will add it here.',
		},
		ru: {
			'another-language':		"EN",
			'title':				"С НОВЫМ ГОДОМ",

			'section-settings': 	"Настройки",
			'settings-wind':		"Ветер:",
			'settings-speed':		"Скорость:",
			'settings-height':		"Высота сугробов:",
			'settings-amount':		"Количество снега:",
			'settings-melting':		"Скорость таяния:",
			'settings-symbol':		"Символ снежинки:",
			'settings-blinking':	"Мигающий текст:",

			'presets-select':		"Наборы настроек",
			'presets-snow':			"Снег",
			'presets-blizzard':		"Метель",
			'presets-rain-left':	"Дождь влево",
			'presets-rain-right':	"Дождь вправо",
			'presets-panic':		"Паника",
			'presets-default':		"По-умолчанию (сбросить все настройки)",

			'section-share':		"Поделиться",
			'share-incl-settings':	"Включить текущие настройки",
			'share-incl-language':	"Включить текущий язык",
			'share-copy':			"Скопирывать",

			'section-credits':		"Благодарности",
			'credits-fulltext':		'Автор: <a href="https://vk.com/kezzyhko">kezzyhko</a><br>' + 
									'Исходный код: <a href="https://github.com/kezzyhko/new-year-animation">GitHub</a><br>' + 
									'Спасибо <a href="https://fontello.com/">Fontello</a> за иконки<br>' + 
									'Если вы знаете название музыки - скажите мне и я добавлю его сюда',
		},
	};
	var languages = Object.keys(translations);
	var defaultLanguage = languages[0];

	// detect current language 
	var currentLanguage = currentLink.searchParams.get('lang');
	if (!languages.includes(currentLanguage)) {
		var currentLanguage = defaultLanguage;
		for (const lang_country of window.navigator.languages) {
			let lang = lang_country.split('-')[0];
			if (languages.includes(lang)) {
				currentLanguage = lang;
				break;
			}
		}
	}
	currentLink.searchParams.set('lang', currentLanguage);
	window.history.replaceState({}, document.title, currentLink.toString());

	// apply the language function
	function changeLanguage(newLang) {
		currentLanguage = newLang;
		let fieldsToChange = document.querySelectorAll('[data-translation-key]');
		for (const element of fieldsToChange) {
			let translation = translations[currentLanguage][element.dataset.translationKey];
			if (!translation) {
				translation = translations[defaultLanguage][element.dataset.translationKey]
			}
			if (translation) {
				element.innerHTML = translation;
			}
		}
	}



// settings

	var settingsToShare = {
		'wind': 'number',
		'speed': 'number',
		'snowhillHeight': 'number',
		'fallingRate': 'number',
		'meltingRate': 'number',
		'snowSymbol': 'string',
		'blinkingText': 'string'
	};

	// localStorage management
	var settings = {}
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

	// presets
	var settingPresets = {
		'presets-snow': {
			wind: -1,
			speed: 37,
			snowhillHeight: 3,
			fallingRate: 1/30,
			meltingRate: 15/1000,
			snowSymbol: '*',
		},
		'presets-blizzard': {
			wind: 5,
			speed: 70,
			snowhillHeight: 10,
			fallingRate: 0.03,
			meltingRate: 0.005,
			snowSymbol: '*',
		},
		'presets-rain-left': {
			wind: -1,
			speed: 80,
			snowhillHeight: 1,
			fallingRate: 0.04,
			meltingRate: 0.1,
			snowSymbol: '/',
		},
	};
	settingPresets['presets-rain-right'] = Object.assign({}, settingPresets['presets-rain-left']); 
	settingPresets['presets-rain-right'].wind = 1;
	settingPresets['presets-rain-right'].snowSymbol = '\\';
	settingPresets['presets-panic'] = {
		wind: 0,
		speed: 55,
		snowhillHeight: 10,
		fallingRate: 0.03,
		meltingRate: 0.006,
		snowSymbol: 'A',
	};
	settingPresets['presets-default'] = Object.assign({}, settingPresets['presets-snow']);
	settingPresets['presets-default'].blinkingText = closestYear;

	// default settings
	for (const [name, value] of Object.entries(settingPresets['presets-default'])) {
		s(name, value, false);
	}
	s('volume', 0.2, false);

	// load settings from query params
	for (const name of Object.keys(settingsToShare)) {
		currentLink.searchParams.delete(name);
		if (currentLink.searchParams.has(name)) {
			let value = currentLink.searchParams.get(name);
			if (settingsToShare[name] == 'number') {
				value = parseFloat(value);
			}
			s(name, value);
		}
	}
	window.history.replaceState({}, document.title, currentLink.toString());



document.addEventListener("DOMContentLoaded", function() {

	// get elements
	var picture = document.getElementById('picture').innerText;
	var snowBlock = document.getElementById('snow');
	var treeBlock = document.getElementById('tree');
	var H = document.getElementById('H');
	var settingInputs = document.getElementsByClassName('setting');
	var fullscreenButton = document.getElementById('fullscreen-button');
	var audio = document.getElementById('audio');
	var sidebarLabel = document.getElementById('sidebar-label');
	var languageButton = document.getElementById('language-button');
	var muteButton = document.getElementById('mute-button');
	var volumeChange = document.getElementById('volume-change');
	var settingPresetsSelect = document.getElementById('setting-presets-select');
	var share = document.getElementById('share');
	var shareLinkInput = document.getElementById('share-link-input');
	var shareLinkCopyButton = document.getElementById('share-link-copy-button');
	var shareLinkIncludeSettings = document.getElementById('share-link-include-settings');
	var shareLinkIncludeLanguage = document.getElementById('share-link-include-language');

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

		// setting presets select
		for (const presetName of Object.keys(settingPresets)) {
			let option = document.createElement('option');
			option.dataset.translationKey = option.value = presetName;
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

		// share section - copy logic
		shareLink.search = '';
		shareLinkInput.value = shareLink.toString();
		shareLinkCopyButton.addEventListener('click', function(e) {
			shareLinkInput.focus();
			shareLinkInput.select();
			document.execCommand('copy');
		});
		shareLinkInput.addEventListener('blur', function(e) {
			document.getSelection().removeAllRanges();
		});

		// share section - checkboxes
		function shareCheckboxChanged(e) {
			if (shareLinkIncludeSettings.checked) {
				for (const name of Object.keys(settingsToShare)) {
					shareLink.searchParams.set(name, g(name));
				}
			} else {
				shareLink.search = '';
			}
			if (shareLinkIncludeLanguage.checked) {
				shareLink.searchParams.set('lang', currentLanguage);
			} else {
				shareLink.searchParams.delete('lang');
			}
			shareLinkInput.value = shareLink.toString();
		}
		shareLinkIncludeLanguage.addEventListener('change', shareCheckboxChanged);
		shareLinkIncludeSettings.addEventListener('change', shareCheckboxChanged);

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

		// language switcher
		changeLanguage(currentLanguage);
		function toggleLanguage(e) {
			changeLanguage(languages[(currentLanguage == languages[0]) ? 1 : 0]);
			shareCheckboxChanged();
			currentLink.searchParams.set('lang', currentLanguage);
			window.history.replaceState({}, document.title, currentLink.toString());
		}
		languageButton.activateFunction = toggleLanguage;
		languageButton.addEventListener('keydown', activateKeyPress);
		languageButton.addEventListener('click', toggleLanguage);



	// fixing page that was intended for no js
	audio.controls = false;
	sidebarLabel.style.display = 'unset';
	picture = picture.replace('....', closestYear);

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
		H.innerText = g('blinkingText');
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