'use-strict';

export {createConsoleLog, createCommandPrompt, show, hide, htmlFromString, createTextBox, createButton, createCommandButton, createOptionsMenu, createAutoCompleteHelp, createSubmitButton};
import {enterCommand, processPromptInput} from './console.js';

function createConsoleLog(id = 'webConsole-consoleLog', cssClass = 'webConsole') {
	var log = document.createElement('div');
	log.id = id;
	log.classList.add(cssClass);
	return log;
}

function createCommandPrompt(id = 'webConsole-commandPrompt') {
	var prompt = document.createElement('input');
	prompt.type = 'text';
	prompt.id = id;
	prompt.classList.add('webConsole-promptInput');
	return prompt;
}

function createOptionsMenu(options){
	var menuElement = document.createElement('div');
	var width = Math.max(...(options.items.map((s) => (s.length))));
	menuElement.classList.add('webConsole-optionsMenu');
	
	for(let option of options.items){
		let button = createCommandButton({commandString: option, autoSubmit: false, clear: false});
		button.style.width = width + '.5ch';
		let div = document.createElement('div');
		div.appendChild(button);
		menuElement.appendChild(div);
	}
	if (!options.mandatory){
		menuElement.appendChild(createSubmitButton(width));
	}
	return menuElement;
}

function createSubmitButton(width = 1, wrapper = 'div'){
	let button = createButton({text: String.fromCharCode('0x21B5'), action: processPromptInput});
	button.style.width = width + '.5ch';
	let div = document.createElement(wrapper);
	div.appendChild(button);
	return div;
}

function createButton({text, action, actionParameter}){
	var button = document.createElement('button');
	button.type = 'button';
	button.addEventListener('click', function(){
			action(actionParameter);
			});
	button.innerText = text;
	button.classList.add('webConsole-button');
	return button;
}

function createCommandButton({commandString, autoSubmit = false, clear = true}){
	return createButton({text: commandString, action: enterCommand, actionParameter: {commandString: commandString, autoSubmit: autoSubmit,clear: clear }});
}

function createTextBox(text, width = 0, height = 0){
	var textBox = document.createElement('span');
	var lines = text.trim().split('\n');
	if (width < 2) {
		width = 2 + maxLineLength(lines);
	}
	if (height < 2) {
		height = 2 + lines.length;
	}
	textBox.style.width = `${ width}ch`;
	textBox.style.height = `${ height}em`;
	textBox.style.lineHeight = '1em';
	textBox.innerHTML = '╔' + '═'.repeat(width - 2) + '╗<br />';
	
	let n_emptyLines = Math.floor((height - lines.length - 2) / 2);
	for(let i = 0; i < n_emptyLines; i++){
		textBox.innerHTML += '║' + '&nbsp;'.repeat(width - 2) + '║<br />';
	}
	for(let i = 0; i < Math.min(height - 2, lines.length); i++){
		textBox.innerHTML += '║' + centerString(lines[i].substr(0, width - 2), width - 2) + '║<br />';
	}
	for(let i = 0; i < Math.ceil(n_emptyLines); i++){
		textBox.innerHTML += '║' + '&nbsp;'.repeat(width - 2) + '║<br />';
	}
	textBox.innerHTML += '╚' + '═'.repeat(width - 2) + '╝';
	return textBox;
}

function centerString(s, length){
	if (s.length < length){
		let diff = length - s.length;
		s = '&nbsp;'.repeat(diff/2) + s + '&nbsp;'.repeat(Math.ceil(diff/2));
	}
	return s;
}

function maxLineLength(lines){
	return Math.max(...lines.map(s => s.length));
}

function hide(uiElement) {
	uiElement.classList.add('webConsole-doNotDisplay');
}

function show(uiElement) {
	if (uiElement.classList.contains('webConsole-doNotDisplay')) {
		uiElement.classList.remove('webConsole-doNotDisplay');		
	}
}

function htmlFromString({text: s, parentElement = 'div'}){
	var e = document.createElement(parentElement);
	e.innerHTML = s;
	return e;
}

function createAutoCompleteHelp(options){
	var wrapper = document.createElement('div');
	wrapper.id = 'webConsole-autoCompleteHelp';
	wrapper.classList.add('webConsole-autoCompleteHelp');

	var label = document.createElement('div');
	label.innerText = options.label;

	if(typeof options.items != 'string'){
		let om = wrapper.appendChild(createOptionsMenu(options));
		label.classList.add('webConsole-autoCompleteHelp-optionsLabel');
	} else if (options.items == 'color'){
		let colorPicker = document.createElement('input');
		colorPicker.type = 'color';
		colorPicker.classList.add('webConsole-inputColor');
		wrapper.appendChild(colorPicker);
	}

	
	
	
	wrapper.appendChild(label);

	return wrapper;
}