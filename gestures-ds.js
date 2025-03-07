/**
 * @module gestures
 * @description A module for detecting touch gestures on a DOM element.
 */

/**
 * @typedef {Object} Gestures
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
 * @returns {GesturesAPI} An API object for subscribing/unsubscribing to gestures.
 */
function init(el) {
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
  const api = { subscribe, unsubscribe };

  const ongoingTouches = new Map();

  return api;

  // --------------------------------------------
  // Document nested functions as part of GesturesAPI
  // --------------------------------------------

  /**
   * Registers a callback for a gesture.
   * @param {string} gesture - The gesture type (e.g., "strokeUp").
   * @param {function} func - The callback function.
   * @throws {Error} If the gesture is invalid.
   * @memberof GesturesAPI
   */
  function subscribe(gesture, func) {
    if (!gestures[gesture]) throw new Error(`Invalid gesture: ${gesture}`);
    gestures[gesture].push(func);
  }

  /**
   * Unregisters a callback for a gesture.
   * @param {string} gesture - The gesture type (e.g., "strokeUp").
   * @param {function} func - The callback function to remove.
   * @throws {Error} If the gesture is invalid or the function is not registered.
   * @memberof GesturesAPI
   */
  function unsubscribe(gesture, func) {
    if (!gestures[gesture]) throw new Error(`Invalid gesture: ${gesture}`);
    const index = gestures[gesture].indexOf(func);
    if (index === -1) throw new Error("Function not registered");
    gestures[gesture].splice(index, 1);
  }

  return api;
}

export { init };
