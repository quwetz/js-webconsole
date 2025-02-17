'use strict';

export {init, log, runApp, closeApp, enterCommand, enterURLFragmentAsCommand, focusPromptInput};

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
	
	return consoleContainer;
}

function focusPromptInput(){
	promptInput.focus();
}

function keyPressed(){
	if(activeApp == undefined){
		switch (event.key){
			case 'Enter':
				processPromptInput();
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

function processPromptInput(){
	let commandString = promptInput.value;
	log(`> ${ commandString}`);
	commandHistoryIndex = undefined;
	if(commandString === ''){
		return;
	}
	commandHistory.push(commandString);
	promptInput.value = '';
	parseCommand(commandString);
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
	if(typeof(msg) == 'string'){
		let logLine = document.createElement('div');
		logLine.innerText = msg;
		logContainer.appendChild(logLine);
		return;
	}
	if(msg instanceof HTMLElement){
		logContainer.appendChild(msg);
		return;
	}
	if(Array.isArray(msg)){
		let logLine = document.createElement('div');
		for(let e of msg){
			if (e instanceof HTMLElement){
				logContainer.appendChild(e);
			} else {
				logContainer.appendChild(document.createTextNode(e));
			}
		}
		logContainer.appendChild(logLine);
		return;
	}
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

function enterCommand({commandString, autoSubmit = false, clear = true, initialDelay = 0}){
	var delay = initialDelay;
	if(clear) {
		promptInput.value ='';
	}
	for (let c of commandString){
		setTimeout(() => (promptInput.value += c), delay);
		delay += (Math.random() * 10) + 10;
	}
	if(autoSubmit) {
		setTimeout(processPromptInput, delay + 400);
	} else {
		setTimeout(() => (promptInput.value += ' '), delay);
	}
	focusPromptInput();
}

function enterURLFragmentAsCommand(){
	let command = window.location.hash.substring(1).replaceAll('%20', ' ');
	enterCommand({commandString: command, autoSubmit: true, initialDelay: 400});
}