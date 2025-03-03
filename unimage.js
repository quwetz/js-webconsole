'use-strict';

export {unimage};

class unimage {
	canvas;
	ctx;
	
	// imagedatas
	original;
	monochrome;
	binary;
	
	monochromeString = '';
	binaryString = '';
	
	binaryThreshold = 128;
	
	
	constructor({file, width = 32, height, init_cb}){
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		this.canvas = canvas;
		this.ctx = ctx;
		var img = new Image;
		var self = this;
		img.onload = function() {
			const aspectRatio = img.width / img.height;
			canvas.width = width;
			if(height == undefined){
			    canvas.height = Math.round(32 / aspectRatio);
			} else {
			    canvas.height = height;
			}
			ctx.drawImage(img, 0,0, canvas.width, canvas.height);
			self.original = ctx.getImageData(0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(img.src);
			self.generateBinaryString();
			self.generateMonochromeString();
			init_cb();
		};
		img.src = URL.createObjectURL(file);
	}
	
	// th in [0,1)
	setBinaryThreshold(th){
		this.binaryThreshold = Math.floor(th * 256);
	}
	
	generateMonochrome(){
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
	
	generateMonochromeString(){
		if(this.monochrome == undefined){
			this.generateMonochrome();
		}
		for(let y = 0; y < this.canvas.height; y++) {
			for(let x = 0; x < this.canvas.width * 4; x += 4){
				this.monochromeString += this.brightnessValueToBlockSymbol(this.monochrome.data[this.monochrome.width * y * 4 + x]);
			}
			this.monochromeString += '<br>';
		}
	}
	
	brightnessValueToBlockSymbol(value){
		if (value > 204) return '█';
		if (value > 153) return '▓';
		if (value > 102) return '▒';
		if (value > 51) return '░';
		return ' ';
	}
	
	generateBinary(){
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
		for(let y = 0; y < this.canvas.height; y++) {
			for(let x = 0; x < this.canvas.width * 4; x += 4){
				this.binaryString += this.binary.data[this.binary.width * y * 4 + x] > 0 ? '█' : ' ';
			}
			this.binaryString += '<br>';
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
