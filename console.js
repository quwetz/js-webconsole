/**
 * @module console
 * @description Manages the conosoles DOM Elements, input and logging to the console
 */

export {init, log, runApp, closeApp, enterCommand, focusPromptInput, processPromptInput, setupPromptCursorForTextInput};

import * as cmd from './commands.js';
import * as ui from './ui-elements.js';
import * as util from './util.js';

// DOM Elements
var consoleContainer, logContainer, commandPrompt, promptInput;

var commandHistory = [];
var commandHistoryIndex;
var activeApp;
var autoCompleteHelp;
var optionsIndex = 0;

document.body.addEventListener('keydown', keyPressed);

///////////////////////////////////////////////////////////////////////////////
////// Public Methods
///////////////////////////////////////////////////////////////////////////////

/**
 * Initializes the console. Sets up all necessary DOM Elements. Should only be called once.
 * @returns the DOM Element (div) containting the console.
 */
function init(){
	consoleContainer = document.createElement('div');
	consoleContainer.id = 'webConsole';
	consoleContainer.classList.add('webConsole');

	logContainer = ui.createConsoleLog();
	consoleContainer.appendChild(logContainer);

	let promptLabel = document.createTextNode('>');
	promptInput = ui.createCommandPrompt();

	commandPrompt = document.createElement('div');
	commandPrompt.classList.add('posRelative');
	commandPrompt.appendChild(promptLabel);
	commandPrompt.appendChild(promptInput);
	commandPrompt.appendChild(ui.createSubmitButton(1, 'span')).classList.add('webConsole-promptSubmitButton');
	consoleContainer.appendChild(commandPrompt);
	
	return consoleContainer;
}

/**
 * Focus the prompt Input.
 */
function focusPromptInput(){
	promptInput.focus();
}

/**
 * Trims any trailing whitespace characters from the prompt.
 * Then adds a single space if the prompt is not empty.
 * Removes Autocomplete Helper Elements.
 * Focuses the prompt input.
 */
function setupPromptCursorForTextInput(){
	if (promptInput.value != ''){
		promptInput.value = promptInput.value.trimEnd() + ' ';
	}
	focusPromptInput();
	removeAutoCompleteHelp();
}

/**
 * executes the current command prompt input.
 */
function processPromptInput(){	
	removeAutoCompleteHelp();
	let commandString = promptInput.value.trim();
	log(`> ${ commandString}`);
	commandHistoryIndex = undefined;
	if(commandString === ''){
		return;
	}
	commandHistory.push(commandString);
	promptInput.value = '';
	cmd.executeCommand(commandString);
}

/**
 * Prints msg to the console
 * @param msg {string | DOM-Element | Array<string|DOM-Element>} - If string: a div-Element is logged with msg as innerText. If (parsed) html code should be logged, create the element beforehand and pass it to this method.
 */
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

/* startApp ... the apps start function. Receives receives the following parameters:
/*		1. DOM Element to which the game should be rendered to
/*		2. Callback for Cleanup after closing
/*		3. Array of additional game specific parameters
/*		startApp returns an object containing at least a keyPressed function to which keyboard input is passed while the app is running.
/*	
*/

/**
 * Starts a new app in the console. Hides the log and command prompt. All input after calling this method will be passed to the app until closeApp() is called.
 * @param {function} startApp - the apps start function. startApp is called with these parameters: 
 *   1. DOM-Element to render the app to
 *   2. closeApp callback function
 *   3. params 
 * @param {string} params - parameter string passed to the app
 * @throws {Error} if there is already an app running.  
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

/**
 * Cleanup callback for apps to call when they close.
 * Makes the log and commandPrompt visible, removes the Apps DOM-Element from the document.
 * After calling closeApp all input is processed by the console until a new app is started with runApp().
 * @param {DOM-Element} targetElement - the DOM-Element the app uses for rendering itself.
 */
function closeApp(targetElement){
	consoleContainer.removeChild(targetElement);
	activeApp = undefined;
	ui.show(logContainer);
	ui.show(commandPrompt);
}

/**
 * Simulates typing of a command to the prompt by adding string to the prompt character by character with a small delay in between.
 * Focusses the prompt after entering the command.
 * @param {object} param
 * @param {string} param.commandString - the command
 * @param {boolean} [param.autoSubmit=false] - autoSubmit flag to process the input after entering the command
 * @param {boolean} [param.clear=true] - wether the promptInput should be cleared before the command is entered
 * @param {number} [param.initialDelay=0] - delay in ms before printing of the first character
 */
function enterCommand({commandString, autoSubmit = false, clear = true, initialDelay = 0}){
	var delay = initialDelay;
	if(clear) {
		promptInput.value ='';
	} else {
		promptInput.value = promptInput.value.trimEnd() + ' ';
	}
	removeAutoCompleteHelp();
	for (let c of commandString){
		setTimeout(() => (promptInput.value += c), delay);
		delay += (Math.random() * 10) + 10;
	}

	if(autoSubmit) {
		delay += 400
		setTimeout(processPromptInput, delay);
	} else {
		setTimeout(() => (promptInput.value += ' '), delay);
	}
	
	delay += 100;
	setTimeout(displayAutoCompleteHelp, delay);

	focusPromptInput();
}


///////////////////////////////////////////////////////////////////////////////
////// Private Methods
///////////////////////////////////////////////////////////////////////////////

function keyPressed(){
	if(activeApp == undefined){
		switch (event.key){			
			case 'Enter':
				processPromptInput();
				break;
			case 'ArrowRight':
			    if(autoCompleteHelp != undefined && autoCompleteHelp.nodeName == 'SELECT' && optionsIndex != 0){
			        enterCommand({commandString: autoCompleteHelp.value, autoSubmit: false, clear: false})
			    }
			    break;
			case 'ArrowUp':
			    if(autoCompleteHelp != undefined && autoCompleteHelp.nodeName == 'SELECT'){
			        autoCompleteHelp.value = prevOption();
			        event.preventDefault();
			        break;
			    }
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
			     if(autoCompleteHelp != undefined && autoCompleteHelp.nodeName == 'SELECT'){
			        autoCompleteHelp.value = nextOption();  
			        break;
			    }
				if(commandHistory.length > 0 ){
					if(commandHistory[commandHistoryIndex] == undefined || commandHistoryIndex === (commandHistory.length - 1)){
						commandHistoryIndex = 0;
					} else {
						commandHistoryIndex++;
					}
					promptInput.value = commandHistory[commandHistoryIndex];
				}
				break;
			case 'Escape':
			    promptInput.value = '';
			    removeAutoCompleteHelp();
			    focusPromptInput();
			    break;
			default:
				commandHistoryIndex = commandHistory.length - 1;
				promptInput.focus();
				setTimeout(displayAutoCompleteHelp, 100);
		}
		return;
	}
	activeApp.keyPressed();
}

function nextOption(){
    optionsIndex++;
    optionsIndex %= autoCompleteHelp.options.length;
    if (optionsIndex == 0) optionsIndex++;
    return autoCompleteHelp.options[optionsIndex].value;
}

function prevOption(){
    optionsIndex--;
    if (optionsIndex <= 0) optionsIndex = autoCompleteHelp.options.length - 1;
    return autoCompleteHelp.options[optionsIndex].value;
}

function displayAutoCompleteHelp(){
	removeAutoCompleteHelp();
	var param = cmd.nextParameter(promptInput.value);
	if (param == undefined) return;
	autoCompleteHelp = ui.createAutoCompleteHelp(param);
	commandPrompt.appendChild(autoCompleteHelp);
	autoCompleteHelp.style.left = (promptInput.value.trimEnd().length + 2) + 'ch';
}

function removeAutoCompleteHelp(){
	autoCompleteHelp = undefined;
	util.removeElementsByClass('webConsole-autoCompleteHelp');
	optionsIndex = 0;
}
