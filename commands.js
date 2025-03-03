'use-strict';

import {log, runApp, enterCommand} from './console.js';
import {newGame as startSnake} from './snake.js';
import * as ui from './ui-elements.js';
import {createCommandButton as cmdBtn} from './ui-elements.js';
import {unimage} from './unimage.js';
import * as util from './util.js';
import {cv} from './cv.js';

export {commands, nextParameter};

const games = {
	snake: {
		newGame: startSnake,
		info: 'TODO: insert info',
	},
}

const colorIdentifiers = ['foreground', 'background', 'alert'];

const commands = {
	home: {
		execute: home, 
		description: 'Displays landing page content', 
		info: ui.htmlFromString({text: 'Usage: <i>home</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
	help: {
		execute: help, 
		description: 'Provides Information about commands', 
		info: ui.htmlFromString({text: 'Usage: <i>help [command]</i><br>Examples: <i>help fgcolor</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'command', items: undefined, mandatory: false}],
		},
		
	echo: {	
		execute: log, 
		description: 'Prints text to the  console',
		info: ui.htmlFromString({text: 'Usage: <i>echo [text]</i><br>Example: <i>echo hello world</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'text', items: 'text', mandatory: false}],
		},
	setcolor: {
		execute: handleColorChange,
		description: 'Changes the specified color',
		info: ui.htmlFromString({text: 'Usage: <i>setcolor (identifier) (css-colorvalue)</i><br>Examples: <i>setcolor background white</i>, <i>setcolor foreground #F112FA</i>, <i>setcolor alert rgb(0,255,255)</i><br>Valid identifiers: ' + colorIdentifiers.join(', ')}),
		noAdditionalParameters: false,
		structure: [{label: 'identifier', items: colorIdentifiers, mandatory: true}, {label: 'color', items: 'color', mandatory: true}],
	},
	start: {
		execute: startGame,
		description: 'Runs a game in the console',
		info: ui.htmlFromString({text: 'Usage: <i>startgame (game_name) [parameters]...</i><br>Example: <i>startgame snake</i><br>Use <i>games</i> to list available games'}),
		noAdditionalParameters: false,
		structure: [{label: 'game', items: Object.keys(games), mandatory: true}],
	},
	listgames: {
		execute: listGames,
		description: 'Lists all available games',
		info: ui.htmlFromString({text: 'Usage: <i>listgames</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
	setfontsize: {
		execute: setFontSize,
		description: 'Sets the consoles font size',
		info: ui.htmlFromString({text: 'Usage: <i>setfontsize (css-fontsize)</i><br>Example: <i>setfontsize 14px</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'size', items: 'size', mandatory: true}],
	},
	img: {
		execute: loadImage,
		description: 'Loads a local image and converts it to a utf8 text image (locally)',
		info: ui.htmlFromString({text: 'Usage: <i>img</i>, '}),
		noAdditionalParameters: false,
		structure: [],
	},
	cv: {
		execute: () => (log(cv)),
		description: 'Displays my curriculum vitae',
		info: ui.htmlFromString({text: 'Usage: <i>cv</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
};

commands.help.structure[0].items = Object.keys(commands);

function echo(params){
	log(params);
}

function help(params){
	if (params == ''){
		log('Available Commands:');
		Object.keys(commands).forEach((e) => log([cmdBtn({commandString: e, autoSubmit: commands[e].noAdditionalParameters}), ` - ${ commands[e].description}`]));
		log('');
		
		log(ui.htmlFromString({text: 'For detailed information use <i>help [command]</i>'}));
		return;
	}
	if(Object.keys(commands).includes(params)){
		log(`Description: ${ commands[params].description}`);
		log(commands[params].info);
		return;
	}
	log('Unknown command: ' + params);
}

function home(){
	log('Hello and welcome to my Website!');
	log(['Enter or click ', cmdBtn({commandString: 'help', autoSubmit: true}), ' for a list of available commands']);
}

function loadImage(params){
	var input = document.createElement('input');
	
	input.type = 'file';
	input.id = 'image_upload';
	input.accept = '.jpg, .jpeg, .png';
	input.addEventListener('change', function(event){
			renderImage(event.target.files[0]);
			event.target.remove();
		});
	input.addEventListener('cancel', function(event){
			log('no image chosen');
			event.target.remove();
		});
	input.classList.add('webConsole-doNotDisplay');
	document.body.appendChild(input);
	input.click();
}

function renderImage(file){
	var img = new unimage({file, width: 64, init_cb: logImg});
	log(`Loading ${ file.name}...`);
	
	function logImg() {
	    let div = ui.htmlFromString({text: img.monochromeString, parentElement: 'div'});
        div.classList.add('webConsole-img');
        div.style.fontSize = (16 / img.canvas.width) * 100 + '%';
        div.style.lineHeight = '1';
        log(div);
	}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setFontSize(params){
	let num = parseInt(params);
	if(num <= 0){
		log('The font size has to be bigger than 0');
		return;
	}
	if(CSS.supports('font-size', params)){
		document.documentElement.style.setProperty('--font-size', params);
		log('Font size changed to ' + params);
	} else {
		if (!isNaN(params)){
			params = num + 'px';
			document.documentElement.style.setProperty('--font-size', params);
			log('Font size changed to ' + params);
		} else {
			log(params + ' is not a supported CSS font size');
		}
	}
}

function startGame(params){
	if(params == undefined){
		log('Missing parameter. Which game should be run?')
		listGames();
		return;
	}
	var [game, gameParams] = util.splitAtFirstSpace(params);
	if(Object.keys(games).includes(game)){
		runApp(games[game].newGame, gameParams);
		return;
	}
	log('Unknown game: ' + game);
}

function listGames(){
	log('Available Games:');
	Object.keys(games).forEach((e) => log(ui.createButton({
		text: e, 
		action: enterCommand,
		actionParameter: {
			commandString: 'start ' + e, 
			autoSubmit: true, 
			clear: true, 
			initialDelay: 400
		}
	})));
}

function handleColorChange(params){
	var [colorIdentifier, color] = util.splitAtFirstSpace(params);
	if(colorIdentifiers.includes(colorIdentifier)){
		let cssVariable = `--${ colorIdentifier}-color`;
		if(changeColor(cssVariable, color)) {
			log(`${ colorIdentifier} color changed to ${ color}`);
		}
		return;
	}
	log('Invalid color identifier. Valid identifiers are: ' + colorIdentifiers.join(', '));
}

function changeColor(cssVariable, color){
	if(isColor(color)){
		document.documentElement.style.setProperty(cssVariable, color);
		return true;
	}
	return false;
}

function isColor(color){
	var illegalStrings = ['unset', 'true'];
	if(illegalStrings.includes(color)){
		logColorConversionError();
		return false;
	}
	if(CSS.supports('color', color)){
		return true;
	}
	logColorConversionError();
	return false;
}

function logColorConversionError(){
	log('Illegal color formatting. Use a valid css color format.');
	log('Examples: black, rgb(0,0,0) or #000000');
}


/**	Goes through currentInput and the commands chain and returns the next possible parameter.
/*	Returns undefined if there are no parameters for the currentInput. (Either the input is not a valid command or there are no more parameters)
/*
*/
function nextParameter(currentInput){
	var commandChain = currentInput.trim().split(' ').filter((s) => (s != ''));
	if (commandChain.length == 0) return undefined;
	let currentToken = commandChain.shift();
	if (!commands.hasOwnProperty(currentToken)) return undefined;
	
	let structure = commands[currentToken].structure;
	if (structure.length < commandChain.length) return undefined;
	
	let i = 0;
	for (; i < commandChain.length; i++) {
		let items = structure[i].items;
		if (Array.isArray(items)){
			if (!items.includes(commandChain[i])) return undefined;
		} 
	}
	return structure[i];
}
