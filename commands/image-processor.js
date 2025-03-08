'use-strict';

export {ImageProcessor};

/** Class for processing an Image into Grayscale, Binary and ASCII renderings */
class ImageProcessor {
	canvas;
	ctx;
	
	// imagedatas
	original;
	monochrome;
	binary;
	
	monochromeString = '';
	binaryString = '';
	
	binaryThreshold = 128;
	
	/**
	 * Loads an image from a file, scales it to width and height and does the processing.
	 * @param {object} param
     * @param {object} param.file - the image file to load
     * @param {number} [param.width=32] - the target width
     * @param {number} [param.height=derived from width and the original aspect ratio] - the target height
     * @param {function} [param.init_cb] - function to call when processing is finished
	 */
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
			self.improveMonochromeContrast();
			self.generateBinaryString();
			self.generateMonochromeString();
			if(typeof init_cb == 'function'){
			    init_cb();
			}
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

    /**
     * Get the Monochrome ASCII image using ASCII-Block Symbols
     * @returns a string containing the image as a monochrome ASCII image
     */
    getMonochromeString(){
        if(this.monochromeString == undefined){
            this.generateMonochromeString();
        }
        return this.monochromeString;
    }

    /**
     * Get the Binary ASCII image using ASCII-Block Symbols
     * @returns a string containing the image as a binary ASCII image
     */
	getBinaryString(){
		if (this.binaryString == undefined) {
			this.generateBinaryString();
		}
		return this.binaryString;
	}
	
	monochromeHistogramm(){
	    if (this.monochrome == undefined) {
	        this.generateMonochrome();
	    }
	    var hist = Array(256).fill(0);
	    for (let i = 0; i < this.monochrome.data.length; i += 4) {
	        hist[this.monochrome.data[i]]++;
	    }
	    return hist;
	}
	
	improveMonochromeContrast() {
	    if (this.monochrome == undefined) {
	        this.generateMonochrome();
	    }
	    var min, max;
	    var hist = this.monochromeHistogramm();
	    var th = (this.monochrome.data.length / 4 ) * 0.05; // threshold = 5% of total number ofpixels
	    for (let i = 0; i < hist.length; i++) {
	        if (hist[i] > th) {
	            min = i;
	            break;
	        }
	    }
	    for (let i = hist.length; i > 0; i--) {
	        if (hist[i] > th) {
	            max = i;
	            break;
	        }
	    }
	    if (min == undefined) return;
	    let alpha = 255 / (max - min);
	    let beta = min;
	    for (let i = 0; i < this.monochrome.data.length; i += 4) {
	        let v = Math.floor((this.monochrome.data[i] - beta) * alpha);
	        this.monochrome.data[i] = v;
	        this.monochrome.data[i + 1] = v;
	        this.monochrome.data[i + 2] = v;
	    }
	}
}
