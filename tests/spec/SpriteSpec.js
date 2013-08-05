describe('Sprite', function() {
	it('Sprite should be available', function() {
		expect(Sprite).not.toBe(null);
	});
});

describe('Sprite constructor', function(){

	var sprite;

	beforeEach(function(){
		sprite = new Sprite(document.createElement('div'), {width: 20, height: 20, length: 10}, {fps: 24});
	});

	it('Sprite is created', function(){
		expect(sprite).not.toBe(null);
	});

	it('Element available', function(){
		expect(sprite.el).toBeDefined();
	});

	it('Options being set', function(){
		expect(sprite.options).toBeDefined();
	});

	it('Changing default options', function(){
		Sprite.defaults.fps = 24;
		sprite = new Sprite(document.createElement('div'), {width: 20, height: 20, length: 10});
		expect(sprite.options.fps).toEqual(24);
	});

});

describe('Sprite created with object', function(){

	it('Sprite with basic object', function(){
		var sprite = new Sprite(document.createElement('div'), {width: 40, height: 40, length: 10});
		expect(sprite.numFrames).toEqual(10);
	});

	it('Sprite with basic object, no length and image size options', function(){
		var sprite = new Sprite(document.createElement('div'), {width: 40, height: 40}, {imageWidth: 400, imageHeight: 400});
		expect(sprite.numFrames).toEqual(100);
	});

	it('Sprite with basic object, no length and uneven sizes', function(){
		var sprite = new Sprite(document.createElement('div'), {width: 2, height: 3}, {imageWidth: 10, imageHeight: 10});
		expect(sprite.numFrames).toEqual(15);

		sprite = new Sprite(document.createElement('div'), {width: 7, height: 4}, {imageWidth: 15, imageHeight: 10});
		expect(sprite.numFrames).toEqual(4);
	});

});

describe('Sprite created with array', function(){
	it('Sprite with frames array', function(){
		var frames = [[0,0,167,206],[167,0,167,206],[334,0,167,206],[501,0,167,206],
					  [668,0,167,206],[835,0,167,206],[1002,0,167,206],[1169,0,167,206],
					  [0,206,167,206],[167,206,167,206],[334,206,167,206],[501,206,167,206],
					  [668,206,167,206],[835,206,167,206],[1002,206,167,206],[1169,206,167,206],
					  [0,412,167,206],[167,412,167,206],[334,412,167,206],[501,412,167,206],
					  [668,412,167,206],[835,412,167,206],[1002,412,167,206]];
		var sprite = new Sprite(document.getElementById('spriteEl'), frames);
		expect(sprite.numFrames).toEqual(frames.length);
	});
});

describe('Frame testing', function(){
	var sprite;

	beforeEach(function(){
		sprite = new Sprite(document.createElement('div'), {width: 10, height: 10, length: 100});
	});

	it('Frame returns the current frame', function(){
		expect(sprite.frame()).not.toBeUndefined();
		expect(sprite.frame()).toEqual(0);
		sprite.frame(10);
		expect(sprite.frame()).toEqual(10);
	});

	it("Can't set frame to value out of bounds", function(){
		expect(sprite.frame(101)).toEqual(0);
	});

});

describe('Stop tests', function(){
	it('Stop should return instance', function(){
		var sprite = new Sprite(document.createElement('div'), {width: 167, height: 210, length: 23}).play();
		expect(sprite.stop()).toEqual(sprite);
	});
});

describe('Play testing', function(){

	describe('Consecutive sprite image', function(){
		var sprite;

		beforeEach(function(){
			var el = document.createElement('div');
			sprite = new Sprite(el, {width: 167, height: 210, length: 23});
			spyOn(sprite, 'play').andCallThrough();
		});

		afterEach(function(){
			sprite.stop();
		});

		it('Play method exists and returns itself', function(){
			sprite.play();
			expect(sprite.play).toHaveBeenCalled();
			expect(sprite.play()).toEqual(sprite);
		});

		it('isPlaying should be set', function(){
			sprite.play();
			expect(sprite.isPlaying()).toBe(true);
		});

	});

});

// Like this because can't really test without looking at it.
describe('Actual run of play', function(){
	var sprite;

	// beforeEach(function(){
	// 	var el = document.getElementById('spriteEl'),
	// 		$el = $(el).addClass('sprite_consecutive');
	// 	sprite = new Sprite(el, {width: 102, height: 102, length: 20});
	// });

	beforeEach(function(){
		var el = document.getElementById('spriteEl'),
			$el = $(el).addClass('sprite_stacked');
		sprite = new Sprite(el, [[0, 0, 102, 102], [102, 0, 102, 102], [204, 0, 102, 102], [306, 0, 102, 102],
			[408, 0, 102, 102], [510, 0, 102, 102], [612, 0, 102, 102], [714, 0, 102, 102], 
			[816, 0, 102, 102], [0, 102, 102, 102], [102, 102, 102, 102], [204, 102, 102, 102],
			[306, 102, 102, 102], [408, 102, 102, 102], [510, 102, 102, 102], [612, 102, 102, 102],
			[714, 102, 102, 102], [816,102,102,102],[0,204,102,102,0,0.3,0.3],[102,204,102,102,0,0.3,0.3]]);
	});

	it('Play is running', function(){
		// sprite.play();
		// sprite.play({fps: 12, from: 10});
		// sprite.play({fps: 12, loop: false});
		// sprite.play({fps: 10, from: 22}); // There is no 22
		// sprite.play({loop: 2});
		// sprite.play({fps: 4, reverse: true});
		// sprite.play({loop: 2, reverse: true});
		// sprite.play({fps: 4, reverse: true, loop: false});
		// sprite.play({fps: 4, from: 10}).stop();
		// sprite.play({fps: 4, from: 10}).stop(14);
		// sprite.play({fps: 4, from: 2}).stop(1);
		// sprite.play({fps: 4, from: 3}).stop(10, true, function(){
		// 	console.log('stop callback');
		// });
		// sprite.play({loop: 2,
		// 			onFrame: function(currentFrame, numLoops){
		// 				console.log('onFrame: ' + currentFrame + '\t' + numLoops);
		// 			},
		// 			onComplete: function(){
		// 			 	console.log('complete');
		// 			}});
	});

});