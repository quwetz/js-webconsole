'use-strict';

import {log, runApp} from './console.js';
import {newGame as startSnake} from './snake.js';

export {commands};

const games = {
	snake: {
		newGame: startSnake,
		info: 'TODO: insert info',
	},
}

const colorIdentifiers = ['foreground', 'background', 'alert'];

const commands = {
	help: {
		execute: help, 
		description: 'Provides Information about commands', 
		info: 'Usage: <i>help [command]</i><br>Examples: <i>help fgcolor</i>',
		},
	echo: {	
		execute: log, 
		description: 'Prints text to the  console',
		info: 'Usage: <i>echo [text]</i><br>Example: <i>echo hello world</i>',
		},
	setcolor: {
		execute: handleColorChange,
		description: 'Changes the specified color',
		info: 'Usage: <i>setcolor (identifier) (css-colorvalue)</i><br>Examples: <i>setcolor background white</i>, <i>setcolor foreground #F112FA</i>, <i>setcolor alert rgb(0,255,255)</i><br>Valid identifiers: ' + colorIdentifiers.join(', '),
	},
	startgame: {
		execute: startGame,
		description: 'Runs a game in the console',
		info: 'Usage: <i>startgame (game_name) [parameters]...</i><br>Examples: <i>startgame minesweeper</i>, <i>startgame snake</i><br>Use <i>games</i> to list available games',
	},
	games: {
		execute: listGames,
		description: 'Lists all available games',
		info: 'Usage: <i>listGames</i>',
	},
};

function echo(params){
	log(params.join());
}

function help(params){
	if (params[0] == undefined){
		log('Available Commands:');
		Object.keys(commands).forEach((e) => log(` ‣ ${ e} - ${ commands[e].description}`));
		log('');
		log('For detailed Information use <i>help [command]</i>');
		return;
	}
	if(Object.keys(commands).includes(params[0])){
		log(`Description: ${ commands[params[0]].description}`);
		log(commands[params[0]].info);
		return;
	}
	log('Unknown command: ' + params[0]);
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
	Object.keys(games).forEach((e) => log(`‣ ${ e}`));
}

function handleColorChange(params){
	var colorIdentifier = params.shift();
	if(colorIdentifiers.includes(colorIdentifier)){
		let cssVariable = `--${ colorIdentifier}-color`;
		changeColor(cssVariable, params.join(' '));
		return;
	}
	log('Invalid color identifier. Valid identifiers are: ' + colorIdentifiers.join(', '));
}

function changeColor(cssVariable, color){
	if(isColor(color)){
		document.documentElement.style.setProperty(cssVariable, color);
	}
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
