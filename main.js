'use strict';
 
import * as shell from './console.js';
import * as ui from './ui-elements.js';

var console = shell.init();
// document.body.appendChild(ui.createCommandButton('home', true));
// document.body.appendChild(ui.createCommandButton('games', true));
// document.body.appendChild(ui.createCommandButton('help', true));

document.body.appendChild(console);
shell.focusPromptInput();

loadHomePage();

function loadHomePage(){
	let command = window.location.hash.substring(1).replaceAll('%20', ' ');
	if (command == '') {
		command = 'home';
	}
	shell.enterCommand({commandString: command, autoSubmit: true, initialDelay: 200});
}