'use-strict';

import {log, runApp, enterCommand} from './console.js';
import {newGame as startSnake} from './snake.js';
import * as ui from './ui-elements.js';
import {createCommandButton as cmdBtn} from './ui-elements.js';

export {commands};

const parser = new DOMParser();

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
	},
	help: {
		execute: help, 
		description: 'Provides Information about commands', 
		info: ui.htmlFromString({text: 'Usage: <i>help [command]</i><br>Examples: <i>help fgcolor</i>'}),
		noAdditionalParameters: false,
		},
		
	echo: {	
		execute: log, 
		description: 'Prints text to the  console',
		info: ui.htmlFromString({text: 'Usage: <i>echo [text]</i><br>Example: <i>echo hello world</i>'}),
		noAdditionalParameters: false,
		},
	setcolor: {
		execute: handleColorChange,
		description: 'Changes the specified color',
	info: ui.htmlFromString({text: 'Usage: <i>setcolor (identifier) (css-colorvalue)</i><br>Examples: <i>setcolor background white</i>, <i>setcolor foreground #F112FA</i>, <i>setcolor alert rgb(0,255,255)</i><br>Valid identifiers: ' + colorIdentifiers.join(', ')}),
		noAdditionalParameters: false,
	},
	startgame: {
		execute: startGame,
		description: 'Runs a game in the console',
		info: ui.htmlFromString({text: 'Usage: <i>startgame (game_name) [parameters]...</i><br>Example: <i>startgame snake</i><br>Use <i>games</i> to list available games'}),
		noAdditionalParameters: false,
	},
	games: {
		execute: listGames,
		description: 'Lists all available games',
		info: ui.htmlFromString({text: 'Usage: <i>listGames</i>'}),
		noAdditionalParameters: true,
	},
	setfontsize: {
		execute: setFontSize,
		description: 'Sets the consoles font size',
		info: ui.htmlFromString({text: 'Usage: <i>setfontsize (css-fontsize)</i><br>Example: <i>setfontsize 14px</i>'}),
		noAdditionalParameters: false,
	},
};

function echo(params){
	log(params.join(' '));
}

function help(params){
	if (params[0] == undefined){
		log('Available Commands:');
		Object.keys(commands).forEach((e) => log([cmdBtn(e, commands[e].noAdditionalParameters), ` - ${ commands[e].description}`]));
		log('');
		
		log(ui.htmlFromString({text: 'For detailed Information use <i>help [command]</i>'}));
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
	log(['Enter or click ', cmdBtn('help', true), ' for a list of available commands']);
}

function setFontSize(params){
	var sizeString = params.join(' ');
	if(CSS.supports('font-size', sizeString)){
		document.documentElement.style.setProperty('--font-size', sizeString);
		log('Font size changed to ' + sizeString);
	} else {
		log(sizeString + ' is not a supported CSS font size');
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
			commandString: 'startgame ' + e, 
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
