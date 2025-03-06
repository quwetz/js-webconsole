import {log} from './console.js';
import {commands} from './commands.js';
import * as util from './util.js';
import * as ui from './ui-elements.js';

commands.cv = {
		execute: printCV,
		description: 'Displays my curriculum vitae',
		info: ui.htmlFromString({text: 'Usage: <i>cv</i>'}),
		noAdditionalParameters: true,
		structure: [],
	};
	
async function printCV(){
    const response = await util.fetchData(window.location.pathname + '/mysite/cv.txt');
    const text = await response.text();
    console.log(text);
    log(text);
    return text;
}
