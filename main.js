'use strict';
 
import * as shell from './console.js';
import * as ui from './ui-elements.js';

// import commands
import './plugins/img.js';
import './mysite/cv.js';

// import apps
//import './apps/minesweeper.js';
import './apps/snake.js';


var console = shell.init();

document.body.appendChild(ui.createMenuBar([
        {label: 'info'},
        {label: 'apps'},
        {label: 'projects'},
        {label: 'help'},
    ]));
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
