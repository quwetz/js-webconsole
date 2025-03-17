/**
 * @module snake
 * @description A plugin for js-webconsole that adds the game snake to available apps. 
 */

import * as ui from '../ui-elements.js';
import * as gestures from '../gestures.js';
import {registerApp} from '../commands.js';

registerApp({name: 'snake', startApp: newGame, info: 'TODO: insert info about snake'});

function newGame(targetElement, close_cb, params){
    
    const prevFontSize = window.getComputedStyle(document.documentElement).getPropertyValue('--font-size');
    targetElement.style.setProperty('--font-size', 'clamp(3px, 2.6vw, 20px)');
    
	var touch = gestures.init(window);
    touch.subscribe('strokeRight', () => (inputQueue.push('ArrowRight')));
    touch.subscribe('strokeDown', () => (inputQueue.push('ArrowDown')));
    touch.subscribe('strokeLeft', () => (inputQueue.push('ArrowLeft')));
    touch.subscribe('strokeUp', () => (inputQueue.push('ArrowUp')));    
    
    document.addEventListener('keydown', keyPressed);
    
	var displayElement = targetElement;
	displayElement.classList.add('posRelative');
	displayElement.classList.add('webConsole-snake');

	var cleanup_cb = close_cb;
	
	var width = 32;
	var height = 32;
	var difficulty = 'normal';
	
	var playerX, playerY, velocityX, velocityY, appleX, appleY, tail, length, inputQueue, fps, intervalID, paused, gameOver, field;
	
	var playerX = 0;
	var playerY = 0;
	var velocityX = 1;
	var velocityY = 0;
	var appleX;
	var appleY;
	var tail = [];
	var length = 3;
	var inputQueue = []; // process only one keystroke per gameUpdate to prevent >=180° turning in one frame

	var tiles = {
		empty: '&nbsp;',
		tail: '#',
		head: '#',
		apple: '¤',
	}
	
	const pauseTextBox = ui.createTextBox({text: 'Game paused'});
	pauseTextBox.classList.add('webConsole-floatingBanner');
	displayElement.appendChild(pauseTextBox);
	const gameOverBanner = createGameOverBanner();
	displayElement.appendChild(gameOverBanner);
	gameOverBanner.addEventListener('click', restart);

	var score = (function(){
		const element = document.createElement('span');
		const text = document.createElement('pre');
		text.classList.add('webConsole-pre');
		
		const backButton = ui.createButton({text: '<-', action: quit});
	    backButton.classList.add('posAbsolute');
	    backButton.style = 'top: 0.85em';
	    element.appendChild(backButton);
        
        element.appendChild(text); 
	    
	    
		var points = 0;
		increase(0);
		
		return {
			points,
			element,
			increase,
			reset,
			};
		
		function increase(increment){
				points += increment;
				let n_digits = points.toString().length;
				let label = 'snake';
				let str = label.padStart((width + label.length) / 2, ' ').padEnd(width, ' '); 
				str = str.substring(0, str.length - n_digits) + points;
				text.innerText = str;
		}
		function reset(score) {
		    increase(0 - points);
		}
	})();
	
    field = initField();
    init();    
    	
	return;
	
	function init(){
		initValues(); 
		clearField();   
	    placeApple();
	    ui.hide(gameOverBanner);
	    ui.hide(pauseTextBox);
	}
	
	function initValues(){
	    playerX = 0;
	    playerY = 0;
	    velocityX = 1;
	    velocityY = 0;
	    appleX;
	    appleY;
	    tail = [];
	    length = 3;
	    inputQueue = []; // process only one keystroke per gameUpdate to prevent >=180° turning in one frame
	    fps = 15;
	    intervalID = setInterval(update, 1000/fps);
	    paused = false;
	    gameOver = false;
	}
	
	function initField(){
		disableScrolling();
		
		var f = [...Array(height)].map(e => Array(width));
		displayElement.appendChild(document.createTextNode('╔' + '═'.repeat(width) + '╗'));
		displayElement.appendChild(document.createElement('br'));
		displayElement.appendChild(document.createTextNode('║'));		
		displayElement.appendChild(score.element);
		displayElement.appendChild(document.createTextNode('║'));
		displayElement.appendChild(document.createElement('br'));
		
		displayElement.appendChild(document.createTextNode('╠' + '═'.repeat(width) + '╣'));
		displayElement.appendChild(document.createElement('br'));
		
		let gameAreaContainer = document.createElement('div');
		gameAreaContainer.classList.add('webConsole-scaleToSquare');
		gameAreaContainer.style.height = height + 'ch';
		displayElement.appendChild(gameAreaContainer);
		
		for(let y = 0; y < height; y++){
			gameAreaContainer.appendChild(document.createTextNode('║'));
			for(let x = 0; x < width; x++){
				f[y][x] = {
					elem: gameAreaContainer.appendChild(document.createElement('span')),
					tile: tiles.empty,
					setTile: function(t){
						this.tile = t; 
						this.elem.innerHTML = t;
						(t == tiles.apple) ? this.elem.classList.add('alert') : this.elem.classList.remove('alert');
						},
					}
				f[y][x].setTile(f[y][x].tile);
				f[y][x].elem.id=(`tile ${ x},${ y}`);
			}
			gameAreaContainer.appendChild(document.createTextNode('║'));
			gameAreaContainer.appendChild(document.createElement('br'));
		}
		displayElement.appendChild(document.createTextNode('╚' + '═'.repeat(width) + '╝'));
		displayElement.appendChild(document.createElement('br'));
		
		return f;
	}

	function placeApple(){
		do {
			appleX = randInt(0, width);
			appleY = randInt(0, height);
		} while (field[appleY][appleX].tile != tiles.empty);
		field[appleY][appleX].setTile(tiles.apple);
	}

	function randInt(min, max){
		return Math.floor((Math.random() * (max - min)) + min);
	}
	
	function quit(){
		enableScrolling();
        document.documentElement.style.setProperty('--font-size', prevFontSize);
		cleanup_cb();
	}
	
	function disableScrolling(){
		document.body.style.position = 'fixed';
		document.body.style.overflowY = 'scroll';
		document.documentElement.style.overscrollBehavior = 'none';
	}
	
	function enableScrolling(){
		document.body.style.position = '';
		document.body.style.overflowY = '';
		document.documentElement.style.overscrollBehavior = 'auto';
	}
	
	function keyPressed(){
		switch(event.key){
			case 'p':
			case 'P':
				if(!gameOver){
					paused ? endPause() : startPause();
					paused = !paused;
				}
				break;
			case 'Escape':
				clearInterval(intervalID);
				quit();
				break;
			case 'ArrowUp':
			case 'ArrowDown':
			case 'ArrowRight':
			case 'ArrowLeft':
				if(inputQueue[inputQueue.length-1] != event.key) {
					inputQueue.push(event.key);
				}
				break;
			default:
			    if (gameOver) {
			        restart();
			    }
		}
	}
	
	function endPause(){
		intervalID = setInterval(update, 1000/fps);
		ui.hide(pauseTextBox);
	}
	
	function startPause(){
		clearInterval(intervalID);
		ui.show(pauseTextBox);
	}
	
	function update(){
		processMovementInput();
		movePlayer();
		return;
	}
	
	function processMovementInput(){
		if(inputQueue.length > 0){
			let key = inputQueue.shift();
			switch(key){
				case 'ArrowUp':
				if(velocityY != 1){
					velocityX = 0;
					velocityY = -1;
				}
				break;
			case 'ArrowDown':
				if(velocityY != -1){
					velocityX = 0;
					velocityY = 1;
				}
				break;
			case 'ArrowRight':
				if(velocityX != -1){
					velocityX = 1;
					velocityY = 0;
				}
				break;
			case 'ArrowLeft':
				if(velocityX != 1){
					velocityX = -1;
					velocityY = 0;
				}
				break;
			}
		}
	}

	function checkCollisions(){
		if(tailBitten()){
		    endGame();
  		}
		if(playerX == appleX && playerY == appleY){
			eatApple();
		}
	}
	
	function endGame(){
		gameOver = true;
		clearInterval(intervalID);
		ui.show(gameOverBanner);
	}
	
	function createGameOverBanner(){
		var banner = ui.createTextBox({text: 'GAME OVER'});
		banner.classList.add('webConsole-floatingBanner');
		return banner;
	}
	
	function eatApple(){
			length += 1;
			score.increase(10);
			fps = 15 + Math.sqrt(2 * length);
			placeApple();
	}

	function tailBitten(){
		return tail.some(pos => (pos.x == playerX) && (pos.y == playerY));
	}

	function movePlayer(){
		updateTail();
		playerX += velocityX;
		playerY += velocityY;
		if(difficulty == 'easy') {
		    playerX = (playerX + width) % width;
		    playerY = (playerY + height) % height;
		} else {
		    if (playerX < 0 || playerX >= width || playerY < 0 || playerY >= height) {
		        endGame();
		        return;
		    }
		}
		field[playerY][playerX].setTile(tiles.head);
		checkCollisions();
	}

	function updateTail(){
		tail.push({x: playerX, y: playerY});
		field[playerY][playerX].setTile(tiles.tail);
		while(tail.length > length){
			let end = tail.shift();
			field[end.y][end.x].setTile(tiles.empty);
		}
	}
	
	function clearField(){
	    for (let y = 0; y < height; y++) {
	        for (let x = 0; x < width; x++) {
	            field[y][x].setTile(tiles.empty);
	        }
	    }
	}
	
	function restart(){
    	init();
        score.reset();
	}
}
