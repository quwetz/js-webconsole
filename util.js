/**
 * @module util
 * @description A module for utility functions
 */
 

/**
 * Splits a given String into an Array at the first occurence of a Space Character.
 * @param {string} str - The String to split.
 * @return {Array<string>} An Array containing a substring of str up to the first character
 * and the rest excluding the space. Returns ['', ''] when str is empty
 * @throws {TypeError} if str is not a string
 */
export function splitAtFirstSpace(str){
    if (typeof str != 'string') {
        throw new TypeError('str is not a string!');
    }
	const index = str.indexOf(' ');
	if (index < 0) return [str, ''];
	return [str.substring(0, index), str.substring(index + 1)];
}

/**
 * Fetches data from a given url and waits until the data is received. Logs an Error to the console if something goes wrong.
 * @param {string} url - the url
 * @return the response if response is ok
 */
export async function fetchData(url){
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * checks if a given string only contains alphanumeric values
 * @param {string} str - the string
 * @returns {boolean} true if str contains only alphanumeric values, otherwise false
  */
export function isAlphaNumeric(str){
    const alphaNumerics = /^[\p{L}\p{N}]*$/u;
    return str.match(alphaNumerics) !== null;
}

/**
 * Removes all DOM Elements of a given className from the document.
 * @param {string] className - the className
 * @throws {TypeError} if className is not a string.
 */
export function removeElementsByClass(className) {
    if (typeof className != 'string') {
        throw new TypeError('className is not a string');
    }
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

/**
 * Clamps a given value to the range [min..max] (inclusive)
 * @throws {TypeError} if any parameter can't be converted to a Number.
 */
export function clamp(value, min, max){
    if (Number(value) == NaN) throw new TypeError(`ERROR: ${ value} is not a Number`);
    if (Number(min) == NaN) throw new TypeError(`ERROR: ${ min} is not a Number`);
    if (Number(max) == NaN) throw new TypeError(`ERROR: ${ max} is not a Number`);
    return (Math.min(max, Math.max(min, value)));
}
