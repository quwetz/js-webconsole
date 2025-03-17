/**
 * @module commands
 * @description The commands moldule of js-webconsole. Here are all available commands defined or registered.
 */

/**
 * The parameter item Object
 * @typedef {Object} module:commands.ParameterItem
 * @property {string} label - The label of the item.
 * @property {string|Array} items - Either a string representing the type of parameter (e.g. color, text, ...) or an Array of different values to choose from (e.g. the callable apps for the run command).
 * @property {boolean} mandatory - Flag if parameter is mandatory
 */

import {log, runApp, enterCommand, clearLog} from './console.js';
import * as ui from './ui-elements.js';
import {createCommandButton as cmdBtn} from './ui-elements.js';
import * as util from './util.js';

const colorIdentifiers = ['foreground', 'background', 'link', 'alert'];
const apps = {};
const commands = {
    clear: {
        execute: clearLog,
        description: 'Clears the console log.',
        info: '',
        noAdditionalParameters: true,
        structure: [],
    },
	home: {
		execute: home, 
		description: 'Displays landing page content.', 
		info: ui.htmlFromString({text: 'Usage: <i>home</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
	help: {
		execute: help, 
		description: 'Provides Information about commands.', 
		info: ui.htmlFromString({text: 'Usage: <i>help [command]</i><br>Examples: <i>help setcolor</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'command', items: undefined, mandatory: false}],
		},
	setcolor: {
		execute: handleColorChange,
		description: 'Changes the specified color.',
		info: ui.htmlFromString({text: 'Usage: <i>setcolor (identifier) (css-colorvalue)</i><br>Examples: <i>setcolor background white</i>, <i>setcolor foreground #F112FA</i>, <i>setcolor alert rgb(0,255,255)</i><br>Valid identifiers: ' + colorIdentifiers.join(', ')}),
		noAdditionalParameters: false,
		structure: [{label: 'identifier', items: colorIdentifiers, mandatory: true}, {label: 'color', items: 'color', mandatory: true}],
	},
	run: {
		execute: startApp,
		description: 'Runs an App in the console.',
		info: ui.htmlFromString({text: 'Usage: <i>run (app_name) [parameters]...</i><br>Example: <i>run snake</i><br>Use <i>listapps</i> to list available apps'}),
		noAdditionalParameters: false,
		structure: [{label: 'app', items: undefined, mandatory: true}],
	},
	listapps: {
		execute: listApps,
		description: 'Lists all available apps.',
		info: ui.htmlFromString({text: 'Usage: <i>listapps</i>'}),
		noAdditionalParameters: true,
		structure: [],
	},
	setfontsize: {
		execute: setFontSize,
		description: 'Sets the console\'s font size.',
		info: ui.htmlFromString({text: 'Usage: <i>setfontsize (css-fontsize)</i><br>Example: <i>setfontsize 14px</i>'}),
		noAdditionalParameters: false,
		structure: [{label: 'size', items: 'size', mandatory: true}],
	},
	rss: {
	    execute: function (){log(ui.htmlFromString({text: '<a href="rss.xml" target="_blank">rss.xml</a>'}));},
	    description: 'A link to this site\'s rss feed',
	    info: '',
	    noAdditionalParameters: true,
	    structure: [],
	},
};


///////////////////////////////////////////////////////////////////////////////
////// Public Methods
///////////////////////////////////////////////////////////////////////////////

/**
 * Goes through currentInput and the command's structure to find the next possible command parameter.
 * The found command parameter can then be used for autocompletion for example.
 * @param {string} currentInput - the current commandline input string
 * @returns {ParameterItem | undefined} undefined if there is no next parameter for the currentInput. (Either the currentInput is not a valid command string or there are no more parameters) otherwise it returns the next {@link module:commands.ParameterItem ParameterItem}
 *
 */
export function nextParameter(currentInput){
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

/**
 * Registers a new command. If a command with the same name is already registered, it will be overwritten.
 * @param {string} command - keyword by which the command can be called (Must contain only alphanumerical characters)
 * @param {Object} commandData
 * @param {function} commandData.execute - the callback for the command
 * @param {string} commandData.description - short description of the command
 * @param {string} commandData.info - more in-depth description, ideally including ***usage*** and ***examples***
 * @param {boolean} commandData.noAdditionalParameters - Flag specifying if their are no additional parameters or options
 * @param {Array<ParameterItem>} commandData.structure - the structure of the command 
 * @throws {Error} if command is not a string or contains any illegal characters
 */
export function registerCommand(command, commandData){
    if (typeof command != 'string') {
        throw new Error(command + ' is not a string');
    }
    if (!util.isAlphaNumeric(command)) {
        throw new Error(command + ' contains illegal characters');
    }
    commands[command] = commandData;
    updateHelpStructure();
}

/**
 * Registers a new app. If an app with the same name is already registered it will be overwritten.
 * @param {Object} appData
 * @param {string} appData.name - the apps name (must contain only alphanumerical characters)
 * @param {function} appData.startApp - the function to call to start the app
 * @param {string} appData.info -info, ideally including ***usage*** and ***examples***
 * @throws {Error} if name is not a string or contains any illegal characters
 */
export function registerApp({name, startApp, info}){
    if (typeof name != 'string') {
        throw new Error(name + ' is not a string');
    }
    if (!util.isAlphaNumeric(name)) {
        throw new Error(name + ' contains illegal characters');
    }
    apps[name] = {startApp: startApp, info: info};
    updateRunStructure();
}

/**
 * executes a given commandString if valid, otherwise logs an error message to js-webconsole
 * @param {string} commandString - the command String
 */
export function executeCommand(commandString){
    var [command, rest] = util.splitAtFirstSpace(commandString);
	if(Object.keys(commands).includes(command)){
		commands[command].execute(rest);
	} else {
		log('Unknown command: ' + command);
	}	
}

/**
 * @returns {Array<string>} an Array containing the names of all registered Apps.
 */
export function getAppNames(){
    return Object.keys(apps);
}

/**
 * @returns {Array<string>} an Array containing the names of all registered Commands.
 */
export function getCommandNames(){
    return Object.keys(commands);
}

///////////////////////////////////////////////////////////////////////////////
////// Private Methods
///////////////////////////////////////////////////////////////////////////////

function updateHelpStructure(){
    commands.help.structure[0].items = Object.keys(commands);
}

function updateRunStructure(){
    commands.run.structure[0].items = Object.keys(apps);
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
	log('This website uses a command line interface.');
	log('To browse this site, enter a command or click a button.');
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
		runApp({startFunction: apps[app].startApp, params: appParams});
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

