Sprite
======

Sprite is a JavaScript sprite sheet animation library. It uses `background-position` for animating the sprite sheet and where possible `requestAnimationFrame`, falling back to `setInterval`.

## Methods

### Sprite(el, frames [, options])
Sprite's constructor method.

```javascript
var foo = new Sprite(...);
```

#### Arguments:

- `el` (DOM Element) - The element that will be animating

```javascript
var foo = new Sprite(document.getElementById('sprite'));
```

- `frames` (Array||Object) - There are multiple ways to define frames, inspired by EaselJS.

**Object**
Using an object is a simple method for inline sprite sheets.

```javascript
var foo = new Sprite(..., {width: 20, height: 20, length: 4});
```

- `width` (Number) - The width of the sprite
- `height` (Number) - The height of the sprite
- `length` (Number) - How many sprites there are

Alternatively, allow Sprite to calculate the length by passing the `imageWidth` and `imageHeight` as options.

```javascript
var foo = new Sprite(..., {width: 20, height: 20}, {imageWidth: 40, imageHeight: 40});
```

- `options` (Object) - An object to set the default options for this instance.

Along with the standard options these are available

- `imageWidth` (Number) - The width of the image. Needed when length isn't set
- `imageHeight` (Number) - The height of the image. Needed when length isn't set

**Array**
The array definition is useful for more complex sprite sheets with multiple lines and stacked frames.
This definition is an Array of Arrays with the following make-up [x, y, width, height]

```javascript
var frames = [[0, 0, 20, 20], [20, 0, 20, 20], [0, 20, 20, 20], [20, 20, 20, 20]];
var foo = new Sprite(..., frames);
```

### play([options])
Starts the animation.

- `options` (Object) - Override any of the options set previously. See Options.

```javascript
var foo = new Sprite(..., ..., {fps: 12, reverse: true});
// Change my mind, play at 24 fps and forwards
foo.play({fps: 24, reverse: false, onComplete: fooCompleteHandler});
```
### stop([frame] [, animated] [, callback])
Stops the animation, optionally on a specific frame.

- `frame` (Number) - Frame number to stop on
- `animated` (Boolean) - If stopping should be animated
- `callback` (Function) - Called on completion of an animated `stop`

### frame([value])
Getter/Setter for frame.

- `value` (Number) - Which frame to go to

### isPlaying()
Returns true if the Sprite is animating

## Options
Options can be set when instantiating Sprite or overridden when using the `play` method. Defaults can be changed using `Sprite.defaults`.

- `fps` (Number) - Frames per second. Default: 12.
- `loop` (Boolean||Number) - Boolean or a Number for how many times to loop. Default: true.
- `reverse` (Boolean) - If the animation plays in reverse. Default: false.
- `from` (Number) - Frame number to start from.
- `onFrame` (Function(currentFrame, numLoops)) - Callback on each frame.
- `onComplete` (Function) - Callback once the animation is complete.

## Notes
Sprite includes [requestAnimationFrame polyfill](https://gist.github.com/paulirish/1579671) globally.

Tested in the following browsers

- IE 7 - 10
- Chrome
- Firefox
- Safari
- Opera