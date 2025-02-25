'use-strict';

export {unimage};

class unimage {
	canvas;
	ctx;
	
	// imagedatas
	original;
	monochrome;
	binary;
	
	binaryString = '';
	
	binaryThreshold = 128;
	
	
	constructor(file){
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		this.canvas = canvas;
		this.ctx = ctx;
		var img = new Image;
		var self = this;
		img.onload = function() {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0,0, img.width, img.height);
			self.original = ctx.getImageData(0, 0, img.width, img.height);
			URL.revokeObjectURL(img.src);
			self.generateBinaryString();
		};
		img.src = URL.createObjectURL(file);
	}
	
	// th in [0,1)
	setBinaryThreshold(th){
		this.binaryThreshold = Math.floor(th * 256);
	}
	
	generateMonochrome(){
		console.log('generating monochrome...');
		this.monochrome = new ImageData(this.original.width, this.original.height);
		for (let i = 0; i < this.original.data.length; i += 4){
			let value = 
				(0.2126 * this.original.data[i]) +
				(0.7152 * this.original.data[i + 1]) +
				(0.0722 * this.original.data[i + 2]);
			this.monochrome.data[i] = value;
			this.monochrome.data[i + 1] = value;
			this.monochrome.data[i + 2] =  value;
			this.monochrome.data[i + 3] = 255;
		}
	}
	
	generateBinary(){
		console.log('generating binary...');
		if(this.monochrome == undefined){
			this.generateMonochrome();
		}
		this.binary = new ImageData(this.monochrome.width, this.monochrome.height);
		for (let i = 0; i < this.monochrome.data.length; i += 4){
			let value = this.monochrome.data[i] > this.binaryThreshold ? 255 : 0;
			this.binary.data[i] = this.binary.data[i + 1] = this.binary.data[i + 2] =  value;
			this.binary.data[i + 3] = 255;
		}
	}
	
	generateBinaryString(){
		if(this.binary == undefined){
			this.generateBinary();	
		}
		console.log('starting');
		for(let y = 0; y < this.canvas.height / 2; y++) {
			console.log('line done');
			for(let x = 0; x < this.canvas.width / 2; x++){
				this.binaryString += this.getBinaryBlock(x, y);
			}
			this.binaryString += '<br>';
		}
		console.log(this.binaryString);
		console.log('done');
	}
	
	getBinaryBlock(x,y){
		var topleft = this.binary.width * 8 * y + x * 8;
		var topright = topleft + 4;
		var bottomleft = topleft + this.binary.width * 8;
		var bottomright = bottomleft + 4;
		return this.blockSymbol(
			this.binary.data[topleft], 
			this.binary.data[topright], 
			this.binary.data[bottomleft], 
			this.binary.data[bottomright]
			);
	}
	
	blockSymbol(topleft, topright, bottomleft, bottomright){
		var binaryCode = 8 * (topleft != 0) + 4 * (topright != 0) + 2 * (bottomleft != 0) + 1 * (bottomright != 0);
		switch(binaryCode){
			case 0: return '&nbsp;'
			case 1: return '▗';
			case 2: return '▖';
			case 3: return '▅';
			case 4: return '▝';
			case 5: return '▐';
			case 6: return '▞';
			case 7: return '▟';
			case 8: return '▘';
			case 9: return '▚';
			case 10: return '▋';
			case 11: return '▙';
			case 12: return '▀';
			case 13: return '▜';
			case 14: return '▛';
			case 15: return '▉';
		}
	}
	
	setOriginal(){
		this.ctx.putImageData(this.original, 0, 0);
	}
	
	setMonochrome(){
		if (this.monochrome == undefined) {
			this.generateMonochrome();
		}
		this.ctx.putImageData(this.monochrome, 0, 0);
	}
	
	setBinary(){
		if(this.binary == undefined){
			this.generateBinary();
		}
		this.ctx.putImageData(this.binary, 0, 0);
	}

	getBinaryString(){
		if (this.binaryString == undefined) {
			this.generateBinaryString();
		}
		return this.binaryString;
	}
}