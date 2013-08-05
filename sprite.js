/*
 * Sprite
 * Anton Ball
 * @license
 */
(function(glob){

	"use strict";

	// Variables

	var version = '0.0.1';

	// Private methods

	var convertToFramePoints = function(frameObject, numFrames){
		var result = [];
		for (var i = 0; i < numFrames; i += 1) {
			result.push([i * frameObject.width, 0, frameObject.width, frameObject.height]);
		}
		return result;
	};

	// Constructor

	var Sprite = function(el, frames, options){
		var isPlaying = false,
			currentFrame = 0,
			framePoints, animationTick, tickCount;

		this.el = el;
		this.options = $.extend({}, Sprite.defaults, options);
		this.numFrames = frames.length ? 
						 frames.length : 
						 Math.floor(options.imageWidth/frames.width) * Math.floor(options.imageHeight/frames.height);

		framePoints = $.isPlainObject(frames) ? convertToFramePoints(frames, this.numFrames) : frames;

		// Methods

		/*
		 * updateFrame
		 */
		var updateFrame = function(frame){
			$(this.el).css('background-position', -frame[0] + 'px ' + -frame[1] + 'px');
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
			if ($.isNumeric(num) && currentFrame !== num) {
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

			var playOptions = $.extend({onComplete: $.noop, onFrame: $.noop}, this.options, options),
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
			animationTick = window.setInterval(spriteTickHandler, 1000/playOptions.fps);
			return this;
		};

		/*
		 * stop
		 * Stop the sprite animation on an optional frame with optional
		 * animation and callback
		 *
		 * frame [Number] - Which frame to stop on
		 * animated [Boolean] - If this stop is animated
		 * callback [Function] - Callback for animated stops
		 */
		this.stop = function(frame, animated, callback){
			if (!isPlaying){
				return this;
			}

			var that = this;
			callback = callback || $.noop;

			window.clearInterval(animationTick);
			isPlaying = false;

			if (frame && !animated) {
				this.frame(frame);
			} else if (frame && animated) {
				this.play({from: currentFrame, onFrame: function(currentFrame){
					if (frame === currentFrame) {
						that.stop();
						callback.call(that);
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