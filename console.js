'use strict';

export {init, log, runApp, closeApp};

import * as cmd from './commands.js';
import * as ui from './ui-elements.js';

// DOM Elements
var consoleContainer, logContainer, commandPrompt, promptInput;

var commandHistory = [];
var commandHistoryIndex;
var activeApp;

document.body.addEventListener('keydown', keyPressed);

function init(){
	consoleContainer = document.createElement('div');
	consoleContainer.id = 'webConsole';
	consoleContainer.classList.add('webConsole');

	logContainer = ui.createConsoleLog();
	consoleContainer.appendChild(logContainer);

	let promptLabel = document.createTextNode('>');
	promptInput = ui.createCommandPrompt();

	commandPrompt = document.createElement('div');
	commandPrompt.appendChild(promptLabel);
	commandPrompt.appendChild(promptInput);
	consoleContainer.appendChild(commandPrompt);
	
	promptInput.focus();
	
	return consoleContainer;
}

function keyPressed(){
	if(activeApp == undefined){
		switch (event.key){
			case 'Enter':
				let command = promptInput.value;
				log(`> ${ command}`);
				run(command);
				promptInput.value = '';
				commandHistory.push(command);
				commandHistoryIndex = undefined;
				break;
			case 'ArrowUp':
				if(commandHistory.length > 0 ){
					if(commandHistory[commandHistoryIndex] == undefined || commandHistoryIndex === 0){
						commandHistoryIndex = commandHistory.length - 1;
					} else {
						commandHistoryIndex--;
					}
					event.preventDefault();
					promptInput.value = commandHistory[commandHistoryIndex];
				}
				break;
			case 'ArrowDown':
				if(commandHistory.length > 0 ){
					if(commandHistory[commandHistoryIndex] == undefined || commandHistoryIndex === (commandHistory.length - 1)){
						commandHistoryIndex = 0;
					} else {
						commandHistoryIndex++;
					}
					promptInput.value = commandHistory[commandHistoryIndex];
				}
				break;
			default:
				commandHistoryIndex = commandHistory.length - 1;
				promptInput.focus();
				
		}
		return;
	}
	activeApp.keyPressed();
}

function run(commandString){
	if(commandString === ''){
		return;
	}
	if(activeApp == undefined){
		parseCommand(commandString);
	} else {
		activeApp.run(commandString);
	}
}

function parseCommand(commandString){
	var parts = commandString.split(' ');
	var command = parts.shift();
	if(Object.keys(cmd.commands).includes(command)){
		cmd.commands[command].execute(parts);
	} else {
		log('Unknown command: ' + command);
	}			
}

function log(msg){
	logContainer.innerHTML += msg+'<br>';
	console.log(msg);
}

/** startApp ... the apps start function. Receives receives the following parameters:
/*		1. DOM Element to which the game should be rendered to
/*		2. Callback for Cleanup after closing
/*		3. Array of additional game specific parameters
/*		startApp returns an object containing at least a keyPressed function to which keyboard input is passed while the app is running.
/*	
*/
function runApp(startApp, params){
	if(activeApp == undefined){
		ui.hide(logContainer);
		ui.hide(commandPrompt);
		activeApp = startApp(consoleContainer.appendChild(document.createElement('div')), closeApp, params);
		return;
	}
	throw new Error('There is already an App running');
}

// CleanUp Callback for apps to call when they close.
function closeApp(targetElement){
	consoleContainer.removeChild(targetElement);
	activeApp = undefined;
	ui.show(logContainer);
	ui.show(commandPrompt);
}