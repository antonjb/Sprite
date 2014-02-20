(function(glob){

	"use strict";

	// Variables

	var version = '1.0.1',
		fun = function(){};

	// Private methods

	/*
	 * convertToFramePoints
	 * Converts the simple frame object into an array of points.
	 */
	var convertToFramePoints = function(frameObject, numFrames){
		var result = [];
		for (var i = 0; i < numFrames; i += 1) {
			result.push([i * frameObject.width, 0, frameObject.width, frameObject.height]);
		}
		return result;
	},
	/*
	 * mergeObjects
	 * Simple object merge.
	 * destination [Object] - The destination for the properties
	 * *objects [Object] - The sources for the destination
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
	 * isNumberic
	 * Test if the value is numeric
	 * Looked at jQuery's & Underscore's implementation.
	 */
	isNumeric = function(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	},
	/*
	 * Test if the object is an array
	 * Looked at jQuery's & Underscore's implementation.
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

	var Sprite = function(el, frames, options){
		var isPlaying = false,
			currentFrame = 0,
			framePoints, animationTick, tickCount;

		this.el = el;
		this.options = mergeObjects({}, Sprite.defaults, options);
		this.numFrames = frames.length ? 
						 frames.length : 
						 Math.floor(options.imageWidth/frames.width) * Math.floor(options.imageHeight/frames.height);
		framePoints = !isArray(frames) ? convertToFramePoints(frames, this.numFrames) : frames;

		// Methods

		/*
		 * updateFrame
		 */
		var updateFrame = function(frame){
			this.el.style.backgroundPosition = -frame[0] + 'px ' + -frame[1] + 'px';
		};

		/*
		 * isPlaying
		 * Whether the sprite is currently playing
		 */
		this.isPlaying = function(){
			return isPlaying;
		};

		/*
		 * frame
		 * Gets or sets the frame number
		 * num [Number] - Optional. The frame to go to
		 */
		this.frame = function(num){
			if (isNumeric(num) && currentFrame !== num) {
				currentFrame = num < this.numFrames ? num : currentFrame;
				updateFrame.call(this, framePoints[currentFrame]);
			}
			 return currentFrame;
		};

		/*
		 * Play
		 * Starts the sprite sheet animation with optional options
		 * options [Object]
		 *		fps [Number] - Frames per second
		 *		from [Number] - Frame number to start from
		 *		reverse [Boolean] - Whether to play the frames in reverse
		 *		loop [Boolean] - If the sprite loops its animation
		 *		onFrame [Function] - Callback on a frame
		 *		onComplete [Function] - Callback when the animation is finished
		 */
		this.play = function(options){
			if (isPlaying) {
				return this;
			}

			var playOptions = mergeObjects({onComplete: fun, onFrame: fun}, this.options, options),
				that = this,
				playFrames = playOptions.reverse ? framePoints.slice(0).reverse() : framePoints,
				loopCount = 0;

			tickCount = 0;
			currentFrame = this.frame(playOptions.from || currentFrame);
			
			var spriteTickHandler = function(){
				updateFrame.call(that, playFrames[currentFrame]);
				currentFrame = (currentFrame += 1) % that.numFrames;
				playOptions.onFrame.call(that, currentFrame, loopCount);
				if (currentFrame === 0) {
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
		 * stop
		 * Stop the sprite animation on an optional frame with optional
		 * animation and callback
		 *
		 * options [Object]
		 *		frame [Number] - Which frame to stop on
		 *		animated [Boolean] - If this stop is animated
		 *		callback [Function] - Callback for animated stops
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
				this.play({from: options.frame, onFrame: function(currentFrame){
					if (options.frame === currentFrame) {
						that.stop({callback: options.callback});
					}
				}});
			}

			return this;
		};
	};

	/*
	 * toString
	 */
	Sprite.toString = function(){
		return 'Sprite version ' + this.version;
	};

	// Global Properties

	/*
	 * version
	 */
	Sprite.version = version;
	
	/*
	 * defaults
	 * The default options
	 * fps [Number] - Frames per second. Higher number is more taxing
	 * loop [Boolean] - Whether the sprite animation loops
	 * reverse [Boolean] - Whether to play the animation in reverse
	 */
	Sprite.defaults = {
		fps: 12,
		loop: true,
		reverse: false
	};
	
	// Namespace

	glob.Sprite = Sprite;

}(this));