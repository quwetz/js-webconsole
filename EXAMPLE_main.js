import * as shell from './console.js';
import * as ui from './ui-elements.js';
import {getAppNames, getCommandNames} from './commands.js';

// import commands
import './plugins/img.js';

// import apps
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
        {label: 'home', cb: commandCB('home')},
        {label: 'run'},
        {label: 'help'},
    ];
    
    menuObjects[1].children = [];
    getAppNames().forEach((app) => (menuObjects[1].children.push({label: app, cb: commandCB('run ' + app)})));
    
    menuObjects[2].children = [{label: 'general', cb: commandCB('help')}];
    getCommandNames().forEach((cmd) => (menuObjects[2].children.push({label: cmd, cb: commandCB('help ' + cmd)})));
    
    menu.appendChild(ui.createMenuBar(menuObjects));
    document.body.appendChild(menu);
}

function commandCB(str){
    return () => (shell.enterCommand({commandString: str, autoSubmit: true, clear: true}));
}
