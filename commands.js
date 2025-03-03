'use-strict';

import {log, runApp, enterCommand} from './console.js';
import {newGame as startSnake} from './snake.js';
import * as ui from './ui-elements.js';
import {createCommandButton as cmdBtn} from './ui-elements.js';
import {unimage} from './unimage.js';

export {commands, nextOptions};

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
		options: undefined, //set after initialisation
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
		options: colorIdentifiers,
		structure: [{label: 'identifier', items: colorIdentifiers, mandatory: true}, {label: 'color', items: 'color', mandatory: true}],
	},
	start: {
		execute: startGame,
		description: 'Runs a game in the console',
		info: ui.htmlFromString({text: 'Usage: <i>startgame (game_name) [parameters]...</i><br>Example: <i>startgame snake</i><br>Use <i>games</i> to list available games'}),
		noAdditionalParameters: false,
		options: Object.keys(games),
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
		info: ui.htmlFromString({text: 'Usage: <i>img</i>'}),
		noAdditionalParameters: true,
		structure: [],
	}
};

commands.help.options = Object.keys(commands);
commands.help.structure[0].items = Object.keys(commands);

function echo(params){
	log(params.join(' '));
}

function help(params){
	if (params[0] == undefined){
		log('Available Commands:');
		Object.keys(commands).forEach((e) => log([cmdBtn({commandString: e, autoSubmit: commands[e].noAdditionalParameters}), ` - ${ commands[e].description}`]));
		log('');
		
		log(ui.htmlFromString({text: 'For detailed information use <i>help [command]</i>'}));
		return;
	}
	if(Object.keys(commands).includes(params[0])){
		log(`Description: ${ commands[params[0]].description}`);
		log(commands[params[0]].info);
		return;
	}
	log('Unknown command: ' + params[0]);
}

function home(){
	log('Hello and welcome to my Website!');
	log(['Enter or click ', cmdBtn({commandString: 'help', autoSubmit: true}), ' for a list of available commands']);
}

function loadImage(){
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

async function renderImage(file){
	var img = new unimage(file);
	// TODO: Find a clean way to wait until the image has loaded...
	await sleep(1000);
	let div = ui.htmlFromString({text: img.monochromeString, parentElement: 'div'});
	div.classList.add('webConsole-img');
	div.style.fontSize = (16 / img.canvas.width) * 100 + '%';
	div.style.lineHeight = '1';
	log(div);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setFontSize(params){
	var sizeString = params.join(' ');
	let num = parseInt(sizeString);
	if(num <= 0){
		log('The font size has to be bigger than 0');
		return;
	}
	if(CSS.supports('font-size', sizeString)){
		document.documentElement.style.setProperty('--font-size', sizeString);
		log('Font size changed to ' + sizeString);
	} else {
		if (!isNaN(sizeString)){
			sizeString = num + 'px';
			document.documentElement.style.setProperty('--font-size', sizeString);
			log('Font size changed to ' + sizeString);
		} else {
			log(params.join(' ') + ' is not a supported CSS font size');
		}
	}
}

function startGame(params){
	if(params[0] == undefined){
		log('Missing parameter. Which game should be run?')
		listGames();
		return;
	}
	if(Object.keys(games).includes(params[0])){
		var game = params.shift();
		runApp(games[game].newGame, params);
		return;
	}
	log('Unknown game: ' + params[0]);
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
	var colorIdentifier = params.shift();
	if(colorIdentifiers.includes(colorIdentifier)){
		let cssVariable = `--${ colorIdentifier}-color`;
		let colorString = params.join(' ');
		if(changeColor(cssVariable, colorString)) {
			log(`${ colorIdentifier} color changed to ${ colorString}`);
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


/**	Goes through currentInput and the commands chain and returns the next possible options.
/*	Returns undefined if there are no options for the currentInput. (Either the input is not a valid command or there are no more options)
/*
*/
function nextOptions(currentInput){
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
