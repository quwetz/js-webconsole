'use-strict';

import {log, setForegroundColor, setBackgroundColor, runApp} from './console.js';
import {newGame as startSnake} from './snake.js';

export {commands};

var commands = {
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
	bgcolor: {
		execute: setBackgroundColor, 
		description: 'Sets the background color of the console',
		info: 'Usage: <i>bgcolor (css-colorvalue)</i><br>Examples: <i>bgcolor white</i>, <i>bgcolor #F112FA</i>, <i>bgcolor rgb(0,255,255)</i>',
		},
	fgcolor: {
		execute: setForegroundColor, 
		description: 'Sets the foreground color of the  console',
		info: 'Usage: <i>fgcolor (css-colorvalue)</i><br>Examples: <i>fgcolor white</i>, <i>fgcolor #F112FA</i>, <i>fgcolor rgb(0,255,255)</i>',
		},
	startgame: {
		execute: startGame,
		description: 'Runs a game in the console',
		info: 'Usage: <i>startgame (game_name) [parameters]...</i><br>Examples: <i>startgame minesweeper</i>, <i>startgame snake 128 64</i><br>Use <i>games</i> to list available games',
	},
};

var games = {
	snake: {
		newGame: startSnake,
		info: 'TODO: insert info',
	},
}

function echo(params){
	log(params.join());
}

function help(params){
	if (params[0] == undefined){
		log('Available Commands:');
		for(let cmd of Object.keys(commands)){
			log(`&emsp; ${ cmd} - ${ commands[cmd].description}`);
		}
		log('For detailed Information use <i>help [command]</i>');
		return;
	}
	try{
		log(`Description: ${ commands[params[0]].description}`);
		log(commands[params[0]].info);
	} catch ({name, message}) {
		if(name === 'TypeError'){
			log('Unknown command: ' + params[0]);
			return;
		}
		console.error(message);
	}	
}

function startGame(params){
	var game = params.shift();
	runApp(games[game].newGame(params));
}


