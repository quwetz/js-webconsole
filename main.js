'use strict';
 
import * as shell from './console.js';
import * as ui from './ui-elements.js';

var console = shell.init();
// document.body.appendChild(ui.createCommandButton('home', true));
// document.body.appendChild(ui.createCommandButton('games', true));
// document.body.appendChild(ui.createCommandButton('help', true));

document.body.appendChild(console);
shell.focusPromptInput();

shell.enterURLFragmentAsCommand();