import {commands} from './commands.js';
import * as ui from './ui-elements.js';
import {ImageProcessor} from './image-processor.js';
import {log} from './console.js';

commands['img'] = {
		execute: loadImage,
		description: 'Loads a local image and converts it to a utf8 text image (locally)',
		info: ui.htmlFromString({text: 'Usage: <i>img</i>, '}),
		noAdditionalParameters: false,
		structure: [],
	};

function loadImage(params){
	var input = document.createElement('input');
	
	input.type = 'file';
	input.id = 'image_upload';
	input.accept = '.jpg, .jpeg, .png';
	input.addEventListener('change', function(event){
			renderImage(event.target.files[0]);
			event.target.remove();
		});
	input.addEventListener('cancel', function(event){
			log('no image chosen');
			event.target.remove();
		});
	input.classList.add('webConsole-doNotDisplay');
	document.body.appendChild(input);
	input.click();
}

function renderImage(file){
	var img = new ImageProcessor({file, width: 64, init_cb: logImg});
	log(`Loading ${ file.name}...`);
	
	function logImg() {
	    let div = ui.htmlFromString({text: img.monochromeString, container: 'div'});
        div.classList.add('webConsole-img');
        div.style.fontSize = (16 / img.canvas.width) * 100 + '%';
        div.style.lineHeight = '1';
        log(div);
	}
}
