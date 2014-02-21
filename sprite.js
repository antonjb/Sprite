(function(glob){

	"use strict";

	// Variables

	var version = '1.0.1',
		fun = function(){};

	// Private methods

	/*
	 * Converts the simple frame object into an array of points.
	 * @param {Object} frameObject - The frame object to use
	 * @param {Number} numFrames - The number of frames
	 * @returns {Array}
	 */
	var convertToFramePoints = function(frameObject, numFrames){
		var result = [];
		for (var i = 0; i < numFrames; i += 1) {
			result.push([i * frameObject.width, 0, frameObject.width, frameObject.height]);
		}
		return result;
	},
	/*
	 * Simple object merge
	 * @param {Object} destination - The destination for the merged object
	 * @param {Object} sources - The objects to merge
	 * @returns {Object} The merged object
	 */
	mergeObjects = function(){
		var dest = typeof arguments[0] === 'object' ? arguments[0] : {},
			n = arguments.length, 
			i, obj, prop;

		for (i = 0; i < n; i += 1) {
			obj = arguments[i];
			if (obj !== null) {
				for (prop in obj) {
					dest[prop] = obj[prop];
				}
			}
		}
		return dest;
	},
	/*
	 * Returns if the value is numeric.
	 * Inspired by jQuery & Underscore's implementation.
	 * @param {Object} value - The value to test
	 * @returns {Boolean} - Whether value was numeric
	 */
	isNumeric = function(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	},
	/*
	 * Returns if the object is an Array
	 * Inspired by jQuery & Underscore's implementation.
	 * @param {Object} obj - The object to test
	 * @returns {Boolean} - Whether the object is an Array
	 */
	isArray = function(obj){
		return Object.prototype.toString.call(obj) === '[object Array]';
	};

	/**
	 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	 * MIT license
	 */
	(function() {
		var lastTime = 0,
			vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame){
			window.requestAnimationFrame = function(callback) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}());

	/*
	 * https://gist.github.com/joelambert/1002116
	 * Drop in replace functions for setTimeout() & setInterval() that 
	 * make use of requestAnimationFrame() for performance where available
	 * http://www.joelambert.co.uk
	 *
	 * Copyright 2011, Joe Lambert.
	 * Free to use under the MIT license.
	 * http://www.opensource.org/licenses/mit-license.php
	 */
	var requestInterval = function(fn, delay) {
		if( !window.requestAnimationFrame       && 
			!window.webkitRequestAnimationFrame && 
			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
			!window.oRequestAnimationFrame      && 
			!window.msRequestAnimationFrame) 
		{
			return window.setInterval(fn, delay);
		}
				
		var start = new Date().getTime(),
			handle = {};
			
		function loop() {
			handle.value = requestAnimationFrame(loop);
			var current = new Date().getTime(),
				delta = current - start;
				
			if(delta >= delay) {
				fn.call();
				start = new Date().getTime();
			}
		}
		
		handle.value = requestAnimationFrame(loop);
		return handle;
	};
	 
	/**
	 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
	 * @param {int|object} fn The callback function
	 */
	var clearRequestInterval = function(handle) {
		window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
		window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
		window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) :
		window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
		window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
		window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
		window.clearInterval(handle);
	};

	// Constructor

	/**
	 * The Sprite constructor
	 * @constructor
	 * @param {Element} el - The DOM Element
	 * @param {Array|Object} frames - The frames of the Sprite
	 * @param {Object} options - Additional options for the Sprite
	 */
	var Sprite = function(el, frames, options){
		var isPlaying = false,
			currentFrame = 0,
			currentOptions, framePoints, 
			animationTick, tickCount;

		this.el = el;
		this.options = mergeObjects({}, Sprite.defaults, options);
		this.numFrames = frames.length ? 
						 frames.length : 
						 Math.floor(options.imageWidth/frames.width) * Math.floor(options.imageHeight/frames.height);
		framePoints = !isArray(frames) ? convertToFramePoints(frames, this.numFrames) : frames;
		currentOptions = mergeObjects({}, this.options);

		// Methods

		/*
		 * Updates the position of the frame
		 * @private
		 * @param {Array} frame - The frame to move to
		 */
		var updateFrame = function(frame){
			this.el.style.backgroundPosition = -frame[0] + 'px ' + -frame[1] + 'px';
		};

		/*
		 * Returns whether the Sprite is animating
		 * @returns {Boolean}
		 */
		this.isPlaying = function(){
			return isPlaying;
		};

		/*
		 * Getter/Setter for the frame number
		 * @param {Number} num - The frame number
		 * @returns {Number} the current frame number
		 */
		this.frame = function(num){
			if (isNumeric(num) && currentFrame !== num) {
				currentFrame = num < this.numFrames ? num : currentFrame;
				updateFrame.call(this, framePoints[currentFrame]);
			}
			 return currentFrame;
		};

		/*
		 * Starts the sprite sheet animation
		 * @param {Object} options - Optional overrides
		 *		{Number} fps - Frames per second
		 *		{Number} from - Frame number to start from
		 *		{Boolean} reverse - Whether to play in reverse
		 *		{Boolean} loop - If the Sprite loops
		 *		{Function} onFrame - Callback on a frame
		 *		{Function} onComplete - Callback when the animation is finished
		 * @returns {Sprite}
		 */
		this.play = function(options){
			if (isPlaying) {
				return this;
			}

			var playOptions = mergeObjects({onComplete: fun, onFrame: fun}, this.options, options),
				that = this,
				loopCount = 0;

			tickCount = 0;
			currentFrame = this.frame(playOptions.from || currentFrame);
			currentOptions = mergeObjects({}, playOptions);
			
			/**
			 * Each time a frame is entered
			 * @private
			 */
			var spriteTickHandler = function(){
				currentFrame = (playOptions.reverse ? that.numFrames + (currentFrame - 1) : currentFrame + 1) % that.numFrames;
				updateFrame.call(that, framePoints[currentFrame]);
				playOptions.onFrame.call(that, currentFrame, loopCount);

				if (currentFrame === (playOptions.from || 0)) {
					loopCount += 1;
					if (!playOptions.loop || loopCount === playOptions.loop) {
						that.stop();
						playOptions.onComplete.call(that);
					}
				}

				tickCount += 1;
			};

			isPlaying = true;
			animationTick = requestInterval(spriteTickHandler, 1000/playOptions.fps);

			return this;
		};

		/*
		 * Stop the sprite animation
		 * @param {Object} options - Optional options
		 *		{Number} frame - Frame to stop on
		 *		{Boolean} animated - Whether to animate to the stopping frame
		 *		{Function} callback - Callback once Sprite is stopped
		 * @returns {Sprite}
		 */
		this.stop = function(options){
			var that = this;

			if (!isPlaying) {return this;}
			
			options = mergeObjects({callback: fun, frame: currentFrame, animated: false}, options);
			options.frame = isNumeric(options.frame) ? options.frame : currentFrame;
			clearRequestInterval(animationTick);
			isPlaying = false;
			
			if (!options.animated) {
				this.frame(options.frame);
				options.callback.call(this);
			} else {
				this.play({reverse: currentOptions.reverse, fps: currentOptions.fps, onFrame: function(currentFrame){
					if (options.frame === currentFrame) {
						that.stop({callback: options.callback});
					}
				}});
			}

			return this;
		};
	};

	Sprite.toString = function(){
		return 'Sprite version ' + this.version;
	};

	// Global Properties

	Sprite.version = version;
	
	/*
	 * The default options
	 * @param {Number} fps - Frames per second. Higher number is more taxing
	 * @param {Boolean} loop - Whether the sprite animation loops
	 * @param {Boolean} reverse - Whether to play the animation in reverse
	 */
	Sprite.defaults = {
		fps: 12,
		loop: true,
		reverse: false
	};
	
	// Expose Sprite
	glob.Sprite = Sprite;

}(this));