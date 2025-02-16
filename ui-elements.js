'use-strict';

export {createConsoleLog, createCommandPrompt, show, hide, createTextBox};

function createConsoleLog(id = 'webConsole-consoleLog', cssClass = 'webConsole') {
	var log = document.createElement('div');
	log.id = id;
	log.classList.add(cssClass);
	return log;
}

function createCommandPrompt(id = 'webConsole-commandPrompt', cssClass = 'webConsole') {
	var prompt = document.createElement('input');
	prompt.type = 'text';
	prompt.id = id;
	prompt.classList.add(cssClass);
	return prompt;
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