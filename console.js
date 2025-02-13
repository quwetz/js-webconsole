'use strict';

export {log, setBackgroundColor, setForegroundColor, setTargetElement, runApp, closeApp, showCommandPrompt, hideCommandPrompt};

import * as cmd from './commands.js';

var targetElement;
var logContainer;
var commandPromptLabel;
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
	
	logContainer = targetElement.appendChild(document.createElement('div'));
	commandPromptLabel = targetElement.appendChild(document.createElement('span'));
	commandPromptLabel.innerText = '>';
	commandPrompt = targetElement.appendChild(document.createElement('input'));
	commandPrompt.type = 'text';
	commandPrompt.focus();
	
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
	if(Object.keys(cmd.commands).includes(command)){
		cmd.commands[command].execute(parts);
	} else {
		log('Unknown command: ' + command);
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

function runApp(startApp, params){
	if(activeApp == undefined){
		logContainer.innerHTML = ''; // TODO: hide the log and pass a new element for rendering the game 
		activeApp = startApp(logContainer.appendChild(document.createElement('div')), commandPrompt, closeApp, params);
		return;
	}
	throw new Error('There is already an App running');
}

function closeApp(){
	console.log('closeApp called');
	activeApp = undefined;
	showCommandPrompt();
	logContainer.innerHTML = '';
	for(let line of commandHistory){
		logContainer.innerHTML += line + '<br>';
	}
}

function showCommandPrompt(){
	commandPromptLabel.style.visibility = 'visible';
	commandPrompt.style.visibility = 'visible';
}

function hideCommandPrompt(){
	commandPromptLabel.style.visibility = 'hidden';
	commandPrompt.style.visibility = 'hidden';
}