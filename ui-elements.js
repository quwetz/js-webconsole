'use-strict';

export {createConsoleLog, createCommandPrompt, show, hide, htmlFromString, createTextBox, createButton, createCommandButton, createAutoCompleteHelp, createSubmitButton};
import {enterCommand, processPromptInput, setupPromptCursorForTextInput} from './console.js';

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
	if(typeof options.items != 'string'){
		return createOptionsDropDown(options);
	} else {
		switch (options.items) {
			case 'color':
				return createColorPicker();
			case 'text':
				return createTextLabel('text');
		}		
	}
}

function createTextLabel(text){
	var label = document.createElement('div');
	label.classList.add('webConsole-autoCompleteHelp');
	label.innerText = text;
	label.addEventListener('click', setupPromptCursorForTextInput);
	return label;
}

function createColorPicker(){
	var wrapper = document.createElement('div');
	var input = document.createElement('input');
	var labelText = 'color';
	wrapper.classList.add('webConsole-autoCompleteHelp');
	wrapper.style.width = (labelText.length + 0.2) + 'ch';
	input.type = 'color';
	input.classList.add('webConsole-autoCompleteHelp-colorPicker');
	wrapper.appendChild(createAutoCompleteLabel(labelText));	
	wrapper.appendChild(input);
	input.addEventListener('change', function(){
		enterCommand({commandString: this.value, clear: false, autoSubmit: false});
		});
	return wrapper;
}

function createAutoCompleteLabel(text){
	var label = document.createElement('span');
	label.classList.add('webConsole-autoCompleteHelp-label');
	label.innerText = text;
	return label;
}

function createOptionsDropDown(options){
	let select = document.createElement('select');
	select.classList.add('webConsole-autoCompleteHelp');
	let placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.innerText = options.label;
	placeholder.setAttribute('disabled', '');
	placeholder.setAttribute('selected', '');
	select.appendChild(placeholder);
	
	for (let optionValue of options.items){
		let optionElement = document.createElement('option');
		optionElement.value = optionValue;
		optionElement.innerText = optionValue;
		select.appendChild(optionElement);
	}
	select.addEventListener('change', function(){
		enterCommand({commandString: this.value, clear: false, autoSubmit: false});
		});
	return select;
}