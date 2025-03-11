/**
 * @module img
 * @description A plugin for js-webconsole that adds the ***img*** command. 
 * ***img*** generates an ASCII Grayscale render of a given image. Everything is done locally, no data is sent anywhere.
 */

import {registerCommand} from '../commands.js';
import * as ui from '../ui-elements.js';
import {ImageProcessor} from './image-processor.js';
import {log} from '../console.js';
import {IllegalArgumentsError, ValueError} from '../errors.js';

registerCommand('img', {
		execute: loadImage,
		description: 'Loads a local image and converts it to a utf8 text image.',
		info: ui.htmlFromString({text: 'Everything is done locally - no info is sent anywhere'+
		    '<br>Usage: <i>img [options]</i><br>options:'+
		    '<br>  -w (number) width in characters (default=128)'+
		    '<br>  -h (number) height in characters (default is derived from width and the images aspect ratio)'+
		    '<br>  -d (number) display width of the image 1..100 (default=25)'+
		    '<br>  -c (number | <i>auto</i> | <i>original</i>) contrast adjustment value (default=auto)'+
		    '<br>      number - a decimal number > 0'+
		    '<br>      <i>auto</i> for automatic normalization'+
		    '<br>      <i>original</i> for no contrast and brightness adjustment'+
		    '<br>  -b (number) brightness adjustment value (default=0) - ignored if contrast is set to "auto" or "original"'+		    
		    '<br>Example: <i>img -w 64 -d 50 -c 0.7 -b 10</i>'}),
		noAdditionalParameters: false,
		structure: [],
	});

const optionsRegex = /\B-([bcdwh])\s((?:(?:-[0-9])?[a-z0-9A-Z\.]*){1,}\b)/g;

function loadImage(params){
    var width = 128;
    var height;
    var displayWidth = 25;
    var contrast = 'auto';
    var brightness = 0;
    
    try {
        handleOptions(params);
    } catch (e) {
        if (e instanceof IllegalArgumentsError || e instanceof TypeError || e instanceof ValueError) {
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
			renderImage({file: event.target.files[0], width, height, displayWidth, contrast, brightness});
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
	        var value = match[2];
	        
	        // check for type
	        switch (match[1]) {
	            case 'w':
	            case 'h':
	            case 'd':
	            case 'b':
	                if (isNaN(value)) {
                        throw new IllegalArgumentsError('ERROR: ' + value + ' is not a number!');
	                }
	                break;
	            case 'c':
	                if (isNaN(value) && (value != 'auto' && value != 'original')){
	                    throw new IllegalArgumentsError('ERROR: ' + value + ' is neither number nor "auto" or "original"');
	                }
	                break;
	        }
	        switch (match[1]) {
	            case 'w':
	                value = Math.floor(Number(value));
	                if (isNaN(match[2])) {
                        throw new IllegalArgumentsError('ERROR: ' + match[2] + ' is not a number!');
                    }
    	            if (value < 1 || value > 2048) {
	                    throw new IllegalArgumentsError('ERROR: Number has to be between 1 and 2048 for option w');
	                }
                    width = value;
    	            break;
	            case 'h':
	                value = Math.floor(Number(value));
    	            if (value < 1 || value > 2048) {
	                    throw new IllegalArgumentsError('ERROR: Number has to be between 1 and 2048 for option h');
	                }
	                height = value;
	                break;
	            case 'd':
	                value = Math.floor(Number(value));
	                if (value > 100) {
	                    throw new IllegalArgumentsError('ERROR: Number has to be between 1 and 100 for option d' + match[1]);
	                }
	                displayWidth = value;
	                break;
	            case 'c':
	                contrast = value;
	                break;
	            case 'b':
	                brightness = value;
	                break;
	        }
	    }
	}
}

function renderImage({file, width, height, displayWidth, contrast, brightness}){
	var img = new ImageProcessor({file, width, height, contrast, brightness, init_cb: logImg});
	log(`Loading ${ file.name}...`);
	
	function logImg() {
	    let div = ui.htmlFromString({text: img.getMonochromeString(), container: 'div'});
        div.classList.add('webConsole-img');
        div.style.fontSize = ((1.5 * displayWidth / 100) * document.documentElement.clientWidth / width) + 'px';
        div.style.lineHeight = '1.22';
        log(div);
	}
}
