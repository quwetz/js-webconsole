'use strict';

export {log, setBackgroundColor, setForegroundColor, setTargetElement, runApp, closeApp};

import * as cmd from './commands.js';

var targetElement;
var logContainer;
var commandPrompt;

var logHistory = [];
var commandHistory = [];
var commandHistoryIndex;
var activeApp;

document.body.addEventListener('keydown', keyPressed);

function setTargetElement(target){
	if(targetElement != undefined){
		target.innerHTML = '';
	}
	targetElement = target;
	targetElement.innerHTML += '<div id="consoleLog"></div>><input id="commandline" type="text" name="command_line" autofocus>';
	commandPrompt = document.getElementById('commandline');
	logContainer = document.getElementById('consoleLog');
}

function keyPressed(){
	if(activeApp == undefined){
		switch (event.key){
			case 'Enter':
				let command = commandPrompt.value;
				log(`> ${ command}`);
				run(command);
				commandPrompt.value = '';
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
					commandPrompt.value = commandHistory[commandHistoryIndex];
				}
				break;
			case 'ArrowDown':
				if(commandHistory.length > 0 ){
					if(commandHistory[commandHistoryIndex] == undefined || commandHistoryIndex === (commandHistory.length - 1)){
						commandHistoryIndex = 0;
					} else {
						commandHistoryIndex++;
					}
					commandPrompt.value = commandHistory[commandHistoryIndex];
				}
				break;
			default:
				commandHistoryIndex = commandHistory.length - 1;
				commandPrompt.focus();
				
		}
		return;
	}
	activeApp.keyPressed();
}

function run(commandString){
	if(targetElement == null) {
		throw new Error('targetElement not set!');
	}
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
	try{
		cmd.commands[command].execute(parts);
	} catch ({name, message}) {
		if(name === 'TypeError'){
			log('Unknown command: ' + command);
			return;
		}
		console.error(message);
	}
}

function setBackgroundColor(params) {
	var color = params.join(' ');
	if(isColor(color)){
		targetElement.style.backgroundColor = color;
		commandPrompt.style.backgroundColor = color;
		log(`Background color changed to ${ color}`);
	}
}

function setForegroundColor(params) {
	var color = params.join(' ');
	if(isColor(color)){
		targetElement.style.color = color;
		commandPrompt.style.color = color;
		log(`Foreground color changed to ${ color}`);
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

function log(msg){
	logContainer.innerHTML += msg+'<br>';
	logHistory.push(msg);
	console.log(msg);
}

function runApp(app){
	if(activeApp == undefined){
		activeApp = app;
		activeApp.start(logContainer, commandPrompt, closeApp);
		return;
	}
	throw new Error('There is already an App running');
}

function closeApp(){
	console.log('closeApp called');
	activeApp = undefined;
	for(let line of commandHistory){
		logContainer.innerHTML += line + '<br>';
	}
}