/**
 * @module gestures
 * @description A module for detecting touch gestures on a DOM element.
 */

/**
 * @typedef {Object} Gestures
 * @name Gestures
 * @property {Array<function>} strokeUp - Functions to call for "stroke up" gestures.
 * @property {Array<function>} strokeRight - Functions to call for "stroke right" gestures.
 * @property {Array<function>} strokeDown - Functions to call for "stroke down" gestures.
 * @property {Array<function>} strokeLeft - Functions to call for "stroke left" gestures.
 */

/**
 * @typedef {Object} GesturesAPI
 * @name GesturesAPI
 * @property {function} subscribe - Registers a callback for a gesture.
 * @property {function} unsubscribe - Unregisters a callback for a gesture.
 */

/**
 * Initializes gesture detection on a DOM element.
 * @param {HTMLElement} el - The DOM element to monitor for touch gestures.
 * @returns {GesturesAPI} - An API object for subscribing/unsubscribing to gestures.
 */
export function init(el){     
    el.addEventListener("touchstart", handleStart);
    el.addEventListener("touchend", handleEnd);
    el.addEventListener("touchcancel", handleCancel);
    el.addEventListener("touchmove", handleMove); 
  
    /** @type {Gestures} */    
    const gestures = {
        strokeUp: [],
        strokeRight: [],
        strokeDown: [],
        strokeLeft: [],
    };
    
    
    /** @type {GesturesAPI} */
    const api = {
        subscribe,
        unsubscribe,
    };
    const ongoingTouches = new Map();
    
    return api;

    /**
     * Registers a callback for a gesture.
     * @name subscribe
     * @method subscribe
     * @param {string} gesture - The gesture type (e.g., "strokeUp").
     * @param {function} func - The callback function.
     * @throws {Error} If the gesture is invalid.
     */
    function subscribe(gesture, func) {
        gestures[gesture].push(func);
    }
    
    /**
     * Unregisters a callback for a gesture.
     * @function unsubscribe
     * @param {string} gesture - The gesture type (e.g., "strokeUp").
     * @param {function} func - The callback function to remove.
     * @throws {Error} If the gesture is invalid or the function is not registered.
     */
    function unsubscribe(gesture, func) {
        if (!gesture in gestures){
            throw new Error(gesture + ' is not a valid gesture.')
        }
        var index = gestures[gesture].indexOf(func);
        if (index == -1) {
            throw new Error('Function is not registered.');
        }
        gestures[gesture].splice(index, 1);
    }

    /////////////////////
    // private methods
    ////////////////////
    
    function handleStart(evt) {
        const touches = evt.changedTouches;
        for(let i = 0; i < touches.length; i++){
            ongoingTouches.set(touches[i].identifier, {x: touches[i].screenX, y: touches[i].screenY,});
        }
    }
    
    function handleEnd(evt) {
        const touches = evt.changedTouches;
        for(let i = 0; i < touches.length; i++){
            const id = touches[i].identifier;
            const totalAngle = Math.atan2(
                touches[i].screenY - ongoingTouches.get(id).y, 
                touches[i].screenX - ongoingTouches.get(id).x
                );
            ongoingTouches.delete[id];
            detectStroke(totalAngle);
        }
    } 
    
    function handleCancel(evt) {
        const touches = evt.changedTouches;
        for(let i = 0; i < touches.length; i++){
            const id = touches[i].identifier;
            ongoingTouches.delete[id];
        }        
    }
    
    function handleMove(evt) {
    }
    
    function detectStroke(angle){
        // Note the inverted y axis on screen coordinates
        if (Math.abs(angle) < Math.PI * 0.2) {
            gestures.strokeRight.forEach(fn => fn());
        } else if (Math.abs(angle) > Math.PI * 0.8) {
            gestures.strokeLeft.forEach(fn => fn());
        } else if (Math.PI * 0.3 < angle && angle < Math.PI * 0.7) {
            gestures.strokeDown.forEach(fn => fn());
        } else if (Math.PI * -0.7 < angle && angle < Math.PI * -0.3) {
            gestures.strokeUp.forEach(fn => fn());
        }
    }
}

