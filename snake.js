export {newGame};

function newGame(params){
	var width = 32;
	var height = 32;
	var playerX = 0;
	var playerY = 0;
	var velocityX = 1;
	var velocityY = 0;
	
	var displayElement;
	var field = [...Array(height)].map(e => Array(width).fill('.'));
	console.log(field);
	
	var closeFunction;
	
	setInterval(update, 1000/15);
	
	return {
		start,
		keyPressed,
	};
	
	function quit(){
		console.log('quit called');
		closeFunction();
	}
	
	function start(logContainer, commandPrompt, close_cb){
		displayElement = logContainer;
		displayElement.innerHTML = '';
		closeFunction = close_cb;
	}
	
	function keyPressed(){
		switch(event.key){
			case 'Escape':
				quit();
				break;
			case 'ArrowUp':
				velocityX = 0;
				velocityY = -1;
				break;
			case 'ArrowDown':
				velocityX = 0;
				velocityY = 1;
				break;
			case 'ArrowRight':
				velocityX = 1;
				velocityY = 0;
				break;
			case 'ArrowLeft':
				velocityX = -1;
				velocityY = 0;
				break;
		}
	}
	
	function update(){
		var nextFrame = '';
		field[playerY][playerX] = '.';
		playerX += velocityX;
		playerY += velocityY;
		field[playerY][playerX] = '#';
		
		for(var y = 0; y < height; y++){
			for(var x = 0; x < width; x++){
				nextFrame += field[y][x];
			}
			nextFrame += '<br>';
		}
		displayElement.innerHTML = nextFrame;
	}
}