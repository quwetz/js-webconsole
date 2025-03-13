'use strict';
 
import * as shell from './console.js';
import * as ui from './ui-elements.js';
import {getAppNames, getCommandNames} from './commands.js';

// import commands
import './plugins/img.js';
import './mysite/cv.js';
import './mysite/aboutMe.js';

// import apps
//import './apps/minesweeper.js';
import './apps/snake.js';


var console = shell.init();

createMenu();
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

function createMenu(){
    const menu = document.createElement('div');
    menu.classList.add('webConsole-header');
    menu.classList.add('webConsole-hideWhileAppIsRunning');
    
    const menuObjects = [
        {label: 'info', children: [
            {label: 'about', cb: commandCB('about')}, 
            {label: 'cv', cb: commandCB('cv')}, 
            {label: 'contact', cb: commandCB('contact')},
            ]},
        {label: 'apps'},
        {label: 'projects'},
        {label: 'help'},
    ];
    
    menuObjects[1].children = [];
    getAppNames().forEach((app) => (menuObjects[1].children.push({label: app, cb: commandCB('run ' + app)})));
    
    menuObjects[3].children = [{label: 'general', cb: commandCB('help')}];
    getCommandNames().forEach((cmd) => (menuObjects[3].children.push({label: cmd, cb: commandCB('help ' + cmd)})));
    
    menu.appendChild(ui.createMenuBar(menuObjects));
    document.body.appendChild(menu);
}

function commandCB(str){
    return () => (shell.enterCommand({commandString: str, autoSubmit: true, clear: true}));
}
