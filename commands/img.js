/**
 * @module img
 * @description A plugin for js-webconsole that adds the ***img*** command. 
 * ***img*** generates an ASCII Grayscale render of a given image. Everything is done locally, no data is sent anywhere.
 */

import {registerCommand} from '../commands.js';
import * as ui from '../ui-elements.js';
import {ImageProcessor} from './image-processor.js';
import {log} from '../console.js';
import {IllegalArgumentsError} from '../errors.js';

registerCommand('img', {
		execute: loadImage,
		description: 'Loads a local image and converts it to a utf8 text image.',
		info: ui.htmlFromString({text: 'Everything is done locally - no info is sent anywhere'+
		    '<br>Usage: <i>img [options]</i><br>options:'+
		    '<br>  -w width in characters(default=128)'+
		    '<br>  -h height in characters (default is derived from width and the images aspect ratio)'+
		    '<br>  -d display width of the image 1..100 (default=25)'+
		    '<br>Example: <i>img -w 64 -d 50</i>'}),
		noAdditionalParameters: false,
		structure: [],
	});

const optionsRegex = /\B-([whd])\s([a-z0-9A-Z]+\b)/g;

function loadImage(params){
    var width = 64;
    var height;
    var displayWidth = 25;
    
    try {
        handleOptions(params);
    } catch (e) {
        if (e instanceof IllegalArgumentsError) {
            log(e.message);
            return;
        } else {
            throw e;
        }
    }
    
	var input = document.createElement('input');
	
	input.type = 'file';
	input.id = 'image_upload';
	input.accept = '.jpg, .jpeg, .png';
	input.addEventListener('change', function(event){
			renderImage(event.target.files[0], width, height, displayWidth);
			event.target.remove();
		});
	input.addEventListener('cancel', function(event){
			log('no image chosen');
			event.target.remove();
		});
	input.classList.add('webConsole-doNotDisplay');
	document.body.appendChild(input);
	input.click();
	
	function handleOptions(){
	    var illegals = params.replaceAll(optionsRegex, '').trim();
	    if (illegals.length != 0){
	        throw new IllegalArgumentsError('Illegal Arguments: ' + illegals + '\n type help img for information');
	    }
	    for (const match of params.matchAll(optionsRegex)) {
	        if (isNaN(match[2])) {
                throw new IllegalArgumentsError('ERROR: ' + match[2] + ' is not a number!');
	        }
	        var value = Math.floor(Number(match[2]));
	        if (value < 1 || value > 2048) {
	            throw new IllegalArgumentsError('ERROR: Number has to be between 1 and 2048 for option ' + match[1])
	        }
	        switch (match[1]) {
	            case 'w':
    	            width = value;
    	            break;
	            case 'h':
	                height = value;
	                break;
	            case 'd':
	                if (value > 100) {
	                    throw new IllegalArgumentsError('ERROR: Number has to be between 1 and 100 for option ' + match[1]);
	                }
	                displayWidth = value;
	                break;
	        }
	    }
	}
}

function renderImage(file, width, height, displayWidth){
	var img = new ImageProcessor({file, width, height, init_cb: logImg});
	log(`Loading ${ file.name}...`);
	
	function logImg() {
	    let div = ui.htmlFromString({text: img.getMonochromeString(), container: 'div'});
        div.classList.add('webConsole-img');
        div.style.fontSize = ((1.5 * displayWidth / 100) * document.documentElement.clientWidth / width) + 'px';
        div.style.lineHeight = '1.22';
        log(div);
	}
}
