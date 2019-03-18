import * as SVG from "./svg";

export const setup = function(node) {
	
	let _mouse = Object.create(null);
	let _events = {};

	Object.assign(_mouse, {
		isPressed: false, // is the mouse button pressed (y/n)
		position: [0,0],  // the current position of the mouse [x,y]
		pressed: [0,0],   // the last location the mouse was pressed
		drag: [0,0],      // vector, displacement from start to now
		prev: [0,0],      // on mouseMoved, the previous location
		x: 0,             //
		y: 0              // -- x and y, copy of position data
	});

	// deep copy mouse object
	const getMouse = function() {
		let m = _mouse.position.slice();
		// if a property is an object it's an array. we can .slice()
		Object.keys(_mouse)
			.filter(key => typeof key === "object")
			.forEach(key => m[key] = _mouse[key].slice());
		Object.keys(_mouse)
			.filter(key => typeof key !== "object")
			.forEach(key => m[key] = _mouse[key]);
		return Object.freeze(m);
	};

	// clientX and clientY are from the browser event data
	const updateMousePosition = function(clientX, clientY) {
		_mouse.prev = _mouse.position;
		_mouse.position = SVG.convertToViewBox(node, clientX, clientY);
		_mouse.x = _mouse.position[0];
		_mouse.y = _mouse.position[1];
	}
	const updateMouseDrag = function() {
		// counting on updateMousePosition to have just been called
		// using mouse.position instead of calling SVG.convertToViewBox again
		_mouse.drag = [_mouse.position[0] - _mouse.pressed[0], 
		               _mouse.position[1] - _mouse.pressed[1]];
		_mouse.drag.x = _mouse.drag[0];
		_mouse.drag.y = _mouse.drag[1];
	}

	// these attach to incoming DOM events
	const mouseMoveHandler = function(event) {
		updateMousePosition(event.clientX, event.clientY);
		let mouse = getMouse();
		if (_mouse.isPressed) { updateMouseDrag(); }
		if (_events.mousemove) {
			_events.mousemove.forEach(f => f(mouse));
		}
	}
	const mouseDownHandler = function(event) {
		_mouse.isPressed = true;
		_mouse.pressed = SVG.convertToViewBox(node, event.clientX, event.clientY);
		if (_events.mousedown) {
			let mouse = getMouse();
			_events.mousedown.forEach(f => f(mouse));
		}
	}
	const mouseUpHandler = function(event) {
		_mouse.isPressed = false;
		if (_events.mouseup) {
			let mouse = getMouse();
			_events.mouseup.forEach(f => f(mouse));
		}
	}
	const mouseLeaveHandler = function(event) {
		updateMousePosition(event.clientX, event.clientY);
		if (_events.mouseleave) {
			let mouse = getMouse();
			_events.mouseleave.forEach(f => f(mouse));
		}
	}
	const mouseEnterHandler = function(event) {
		updateMousePosition(event.clientX, event.clientY);
		if (_events.mouseenter) {
			let mouse = getMouse();
			_events.mouseenter.forEach(f => f(mouse));
		}
	}
	const touchStartHandler = function(event) {
		event.preventDefault();
		let touch = event.touches[0];
		if (touch == null) { return; }
		_mouse.isPressed = true;
		_mouse.pressed = SVG.convertToViewBox(node, touch.clientX, touch.clientY);
		if (_events.mousedown) {
			let mouse = getMouse();
			_events.mousedown.forEach(f => f(mouse));
		}
	}
	const touchMoveHandler = function(event) {
		event.preventDefault();
		let touch = event.touches[0];
		if (touch == null) { return; }
		updateMousePosition(touch.clientX, touch.clientY);
		let mouse = getMouse();
		if (_mouse.isPressed) { updateMouseDrag(); }
		if (_events.mousemove) {
			_events.mousemove.forEach(f => f(mouse));
		}
	}

	let _animate, _intervalID, _animationFrame;
	const updateAnimationHandler = function(handler) {
		if (_animate != null) {
			clearInterval(_intervalID);
		}
		_animate = handler;
		if (_animate != null) {
			_animationFrame = 0;
			_intervalID = setInterval(() => {
				let animObj = {
					"time": node.getCurrentTime(),
					"frame": _animationFrame++
				};
				_animate(animObj);
			}, 1000/60);
		}
	}

	const handlers = {
		// mouse
		mouseup: mouseUpHandler,
		mousedown: mouseDownHandler,
		mousemove: mouseMoveHandler,
		mouseleave: mouseLeaveHandler,
		mouseenter: mouseEnterHandler,
		// touches
		touchend: mouseUpHandler,
		touchmove: touchMoveHandler,
		touchstart: touchStartHandler,
		touchcancel: mouseUpHandler,
	};

	const addEventListener = function(eventName, func) {
		if (typeof func !== "function") {
			throw "must supply a function type to addEventListener";
		}
		if (_events[eventName] === undefined) {
			_events[eventName] = [];
		}
		_events[eventName].push(func);
	};

	// modify object, assign getters and setters
	["mousemove", "mousedown", "mouseup", "mouseleave", "mouseenter"].forEach(key => {
		Object.defineProperty(node, key, {
			set: function(handler) { addEventListener(key, handler); }
		});
	});
	Object.defineProperty(node, "animate", {
		set: function(handler) { updateAnimationHandler(handler); }
	});
	Object.defineProperty(node, "mouse", {get: function(){ return getMouse(); }});

	const attachHandlers = function(node) {
		Object.keys(handlers).forEach(key => 
			node.addEventListener(key, handlers[key], false)
		);
	}
	const removeHandlers = function(node) {
		Object.keys(handlers).forEach(key => 
			node.removeEventListener(key, handlers[key], false)
		);
	}

	attachHandlers(node);
};


export const deinit = function(node) {
	Object.keys(handlers).forEach(key => 
		node.removeEventListener(key, handlers[key], false)
	);
}
