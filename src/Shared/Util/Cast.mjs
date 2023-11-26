/**
 * Set of utilities for type casting of input data.
 * @namespace TeqFw_Core_Shared_Util_Cast
 */
// MODULE'S VARS
const NS = 'TeqFw_Core_Shared_Util_Cast';
const ENCODER = new TextEncoder();

// MODULE'S FUNCTIONS
/**
 * Cast input data into array data type.
 * @param {*} data
 * @return {Array}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castArray(data) {
    return Array.isArray(data) ? [...data] : [];
}

/**
 * Cast input data into array of object using factory function.
 * @param {*} data
 * @param {function} [fact]
 * @return {Array}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castArrayOfObj(data, fact) {
    const defFunc = (a) => a ?? {}; // return input itself or empty Object
    const norm = (typeof fact === 'function') ? fact : defFunc;
    return Array.isArray(data)
        ? data.map((one) => norm(one))
        : [];
}

/**
 * Cast input data into array of strings.
 * @param {*} data
 * @return {Array}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castArrayOfStr(data) {
    return Array.isArray(data)
        ? data.map((one) => castString(one))
        : [];
}

/**
 * Cast input data into 'Uint8Array' data type.
 * @param {*} data
 * @return {Uint8Array}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castBin(data) {
    if (typeof data === 'string') {
        return ENCODER.encode(data);
    } else if (data instanceof Uint8Array) {
        const res = new Uint8Array(data.length);
        res.set(data);
        return res;
    }
    return data;
}

/**
 * Cast input data into 'boolean' data type.
 * @param {*} data
 * @return {boolean}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castBoolean(data) {
    if ((data === true)
        || ((typeof data === 'string')
            && (
                (data.toLowerCase() === 'true')
                || (data.toLowerCase() === 'yes')
            ))
        || ((typeof data === 'number') && (data !== 0))
    ) {
        return true;
    }
    return false;
}

/**
 * Cast input data into 'boolean' data type if input defined.
 * @param {*} data
 * @return {boolean|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castBooleanIfExists(data) {
    return ((data === undefined) || (data === null)) ? data : castBoolean(data);
}

/**
 * Cast input data into 'boolean' data type if input defined.
 * @param {Date|string|number} data
 * @return {Date|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castDate(data) {
    return ((typeof data === 'object') && (data instanceof Date)) ? new Date(data) :
        ((typeof data === 'string') || (typeof data === 'number')) ? new Date(data) : undefined;
}

/**
 * Cast input data into decimal 'number' data type.
 * @param {*} data
 * @return {number|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castDecimal(data) {
    const res = Number.parseFloat(data);
    return ((typeof res === 'number') && (!isNaN(res))) ? res : undefined;
}

/**
 * Cast input data into object value (enumerations).
 * @param {*} data
 * @param {Object} enu constant with allowable values
 * @param {boolean} capitalize 'true' - capitalize data before comparison
 * @return {string|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castEnum(data, enu, capitalize = true) {
    const values = Object.values(enu);
    const norm = (capitalize && (typeof data === 'string')) ? data.toUpperCase() : data;
    return values.includes(norm) ? norm : undefined;
}

/**
 * Cast input data into 'function' data type.
 * @param {*} data
 * @return {function|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castFunction(data) {
    if (typeof data === 'function') {
        return data;
    }
    return undefined;
}

/**
 * Cast input data into integer 'number' data type.
 * @param {*} data
 * @return {number|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castInt(data) {
    const norm = (typeof data === 'string') ? data.trim() : data;
    const res = Number.parseInt(norm);
    return ((typeof res === 'number') && (!isNaN(res))) ? res : undefined;
}

/**
 * Deep clone of the original object.
 * @param {Object} data
 * @return {Object}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castObject(data) {
    return (typeof data === 'object') ? JSON.parse(JSON.stringify(data)) : {};
}

/**
 * Cast input data as a map (objects inside object).
 * @param {Object} data
 * @param {function} fact
 * @returns {Object<number|string, Object>}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castObjectsMap(data, fact) {
    const defFunc = (a) => a ?? {}; // return input itself or empty Object
    const norm = (typeof fact === 'function') ? fact : defFunc;
    const res = {};
    if ((typeof data === 'object') && (data !== null)) {
        for (const key of Object.keys(data)) res[key] = norm(data[key]);
    }
    return res;
}

/**
 * Cast input data into some primitive type.
 * @param data
 * @return {undefined|string|number|boolean|symbol|bigint}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castPrimitive(data) {
    if (
        (typeof data === 'string')
        || (typeof data === 'number')
        || (typeof data === 'boolean')
        || (typeof data === 'symbol')
        || (typeof data === 'bigint')
        || (data === null)
    ) return data;
    return undefined;
}

/**
 * Cast input data into 'string' data type.
 * @param {*} data
 * @return {string|undefined}
 * @memberOf TeqFw_Core_Shared_Util_Cast
 */
function castString(data) {
    if (typeof data === 'string') {
        return data;
    } else if (typeof data === 'number') {
        return String(data);
    } else if (typeof data === 'boolean') {
        return (data) ? 'true' : 'false';
    }
    return undefined;
}

// MODULE'S FUNCTIONALITY
// finalize code components for this es6-module
Object.defineProperty(castArray, 'namespace', {value: NS});
Object.defineProperty(castArrayOfObj, 'namespace', {value: NS});
Object.defineProperty(castBin, 'namespace', {value: NS});
Object.defineProperty(castBoolean, 'namespace', {value: NS});
Object.defineProperty(castBooleanIfExists, 'namespace', {value: NS});
Object.defineProperty(castDecimal, 'namespace', {value: NS});
Object.defineProperty(castEnum, 'namespace', {value: NS});
Object.defineProperty(castFunction, 'namespace', {value: NS});
Object.defineProperty(castInt, 'namespace', {value: NS});
Object.defineProperty(castObject, 'namespace', {value: NS});
Object.defineProperty(castObjectsMap, 'namespace', {value: NS});
Object.defineProperty(castPrimitive, 'namespace', {value: NS});
Object.defineProperty(castString, 'namespace', {value: NS});

export {
    castArray,
    castArrayOfObj,
    castArrayOfStr,
    castBin,
    castBoolean,
    castBooleanIfExists,
    castDate,
    castDecimal,
    castEnum,
    castFunction,
    castInt,
    castObject,
    castObjectsMap,
    castPrimitive,
    castString,
};
