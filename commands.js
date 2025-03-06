'use-strict';

import {log, runApp, enterCommand} from './console.js';
import * as ui from './ui-elements.js';
import {createCommandButton as cmdBtn} from './ui-elements.js';
import * as util from './util.js';
export {commands, apps, nextParameter, initializeCommandStructures};


const apps = {};

const colorIdentifiers = ['foreground', 'background', 'link', 'alert'];

const commands = {
	home: {
		execute: home, 
		description: 'Displays landing page content', 
		info: ui.htmlFromString({text: 'Usage: <i>home</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
	help: {
		execute: help, 
		description: 'Provides Information about commands', 
		info: ui.htmlFromString({text: 'Usage: <i>help [command]</i><br>Examples: <i>help fgcolor</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'command', items: undefined, mandatory: false}],
		},
	echo: {	
		execute: log, 
		description: 'Prints text to the  console',
		info: ui.htmlFromString({text: 'Usage: <i>echo [text]</i><br>Example: <i>echo hello world</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'text', items: 'text', mandatory: false}],
		},
	setcolor: {
		execute: handleColorChange,
		description: 'Changes the specified color',
		info: ui.htmlFromString({text: 'Usage: <i>setcolor (identifier) (css-colorvalue)</i><br>Examples: <i>setcolor background white</i>, <i>setcolor foreground #F112FA</i>, <i>setcolor alert rgb(0,255,255)</i><br>Valid identifiers: ' + colorIdentifiers.join(', ')}),
		noAdditionalParameters: false,
		structure: [{label: 'identifier', items: colorIdentifiers, mandatory: true}, {label: 'color', items: 'color', mandatory: true}],
	},
	start: {
		execute: startApp,
		description: 'Runs an App in the console',
		info: ui.htmlFromString({text: 'Usage: <i>startapp (app_name) [parameters]...</i><br>Example: <i>start snake</i><br>Use <i>listapps</i> to list available apps'}),
		noAdditionalParameters: false,
		structure: [{label: 'app', items: undefined, mandatory: true}],
	},
	listapps: {
		execute: listApps,
		description: 'Lists all available apps',
		info: ui.htmlFromString({text: 'Usage: <i>listapps</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
	setfontsize: {
		execute: setFontSize,
		description: 'Sets the consoles font size',
		info: ui.htmlFromString({text: 'Usage: <i>setfontsize (css-fontsize)</i><br>Example: <i>setfontsize 14px</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'size', items: 'size', mandatory: true}],
	},
};

/** This needs to be called after all commands and structures have been loaded from other scripts!
*   By Default this is done in console.js init().
*/
function initializeCommandStructures(){
    commands.help.structure[0].items = Object.keys(commands);
    commands.start.structure[0].items = Object.keys(apps);
}

function echo(params){
	log(params);
}

function help(params){
	if (params == ''){
		log('Available Commands:');
		Object.keys(commands).forEach((e) => log([cmdBtn({commandString: e, autoSubmit: commands[e].noAdditionalParameters}), ` - ${ commands[e].description}`]));
		log('');
		
		log(ui.htmlFromString({text: 'For detailed information use <i>help [command]</i>'}));
		return;
	}
	if(Object.keys(commands).includes(params)){
		log(`Description: ${ commands[params].description}`);
		log(commands[params].info);
		return;
	}
	log('Unknown command: ' + params);
}

function home(){
	log('Hello and welcome!');
	log('This website uses a command line interface, this is not a chatbot.');
	log('To browse this site, just enter a command or click a button.');
	log(['Enter or click ', cmdBtn({commandString: 'help', autoSubmit: true}), ' for a list of available commands']);
	log(['The code used for this UI is open source and available at ', ui.htmlFromString({text: '<a href="https://github.com/quwetz/js-webconsole">github.com/quwetz/js-webconsole</a>', container: 'span'})]);
}

function setFontSize(params){
	let num = parseInt(params);
	if(num <= 0){
		log('The font size has to be bigger than 0');
		return;
	}
	if(CSS.supports('font-size', params)){
		document.documentElement.style.setProperty('--font-size', params);
		log('Font size changed to ' + params);
	} else {
		if (!isNaN(params)){
			params = num + 'px';
			document.documentElement.style.setProperty('--font-size', params);
			log('Font size changed to ' + params);
		} else {
			log(params + ' is not a supported CSS font size');
		}
	}
}

function startApp(params){
	if(params == undefined){
		log('Missing parameter. Which App should be run?')
		listApps();
		return;
	}
	var [app, appParams] = util.splitAtFirstSpace(params);
	if(Object.keys(apps).includes(app)){
		runApp(apps[app].startApp, appParams);
		return;
	}
	log('Unknown app: ' + app);
}

function listApps(){
	log('Available Apps:');
	Object.keys(apps).forEach((e) => log(ui.createButton({
		text: e, 
		action: enterCommand,
		actionParameter: {
			commandString: 'start ' + e, 
			autoSubmit: true, 
			clear: true, 
			initialDelay: 400
		}
	})));
}

function handleColorChange(params){
	var [colorIdentifier, color] = util.splitAtFirstSpace(params);
	if(colorIdentifiers.includes(colorIdentifier)){
		let cssVariable = `--${ colorIdentifier}-color`;
		if(changeColor(cssVariable, color)) {
			log(`${ colorIdentifier} color changed to ${ color}`);
		}
		return;
	}
	log('Invalid color identifier. Valid identifiers are: ' + colorIdentifiers.join(', '));
}

function changeColor(cssVariable, color){
	if(isColor(color)){
		document.documentElement.style.setProperty(cssVariable, color);
		return true;
	}
	return false;
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


/**	Goes through currentInput and the commands chain and returns the next possible parameter.
/*	Returns undefined if there are no parameters for the currentInput. (Either the input is not a valid command or there are no more parameters)
/*
*/
function nextParameter(currentInput){
	var commandChain = currentInput.trim().split(' ').filter((s) => (s != ''));
	if (commandChain.length == 0) return undefined;
	let currentToken = commandChain.shift();
	if (!commands.hasOwnProperty(currentToken)) return undefined;
	
	let structure = commands[currentToken].structure;
	if (structure.length < commandChain.length) return undefined;
	
	let i = 0;
	for (; i < commandChain.length; i++) {
		let items = structure[i].items;
		if (Array.isArray(items)){
			if (!items.includes(commandChain[i])) return undefined;
		} 
	}
	return structure[i];
}
