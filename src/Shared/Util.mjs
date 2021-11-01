/**
 * Set of utilities to use on front and back.
 * @namespace TeqFw_Core_Shared_Util
 */
// DEFINE WORKING VARS
const NS = 'TeqFw_Core_Shared_Util';


/**
 * Convert ArrayBuffer to HEX-string.
 * @param {ArrayBuffer} buffer
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function buf2hex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Deep merge of the 2 objects.
 * Source: https://gist.github.com/ahtcx/0cd94e62691f539160b32ecda18af3d6#gistcomment-2930530
 *
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 * @memberOf TeqFw_Core_Shared_Util
 */
function deepMerge(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object';

    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    Object.keys(source).forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = targetValue.concat(sourceValue);
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });

    return target;
}

/**
 * Convert local date to YYYY/MM/DD.
 * @param {Date|string|null} dateIn
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatDate(dateIn = null) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn) :
        new Date();
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}/${m}/${d}`;
}

/**
 * Convert local date to YYYY/MM/DD HH:MM:SS.
 * @param {Date|string|null} dateIn
 * @param {boolean} withSeconds
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatDateTime(dateIn = null, withSeconds = true) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn) :
        new Date();
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    const h = `${date.getHours()}`.padStart(2, '0');
    const i = `${date.getMinutes()}`.padStart(2, '0');
    const s = `${date.getSeconds()}`.padStart(2, '0');
    const time = (withSeconds) ? `${h}:${i}:${s}` : `${h}:${i}`;
    return `${y}/${m}/${d} ${time}`;
}

/**
 * Convert local time to HH:MM:SS.
 * @param {Date|string|null} dateIn
 * @param {boolean} withSeconds
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatTime(dateIn = null, withSeconds = true) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn) :
        new Date();
    const h = `${date.getHours()}`.padStart(2, '0');
    const i = `${date.getMinutes()}`.padStart(2, '0');
    const s = `${date.getSeconds()}`.padStart(2, '0');
    return (withSeconds) ? `${h}:${i}:${s}` : `${h}:${i}`;
}

/**
 * Convert UTC date to YYYY/MM/DD.
 * @param {Date|string|null} dateIn
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatUtcDate(dateIn = null) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn) :
        new Date();
    const y = date.getUTCFullYear();
    const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const d = `${date.getUTCDate()}`.padStart(2, '0');
    return `${y}/${m}/${d}`;
}

/**
 * Convert input to 'X.XX CUR'.
 *
 * @param {number} amount
 * @param {string|null} cur
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatAmount(amount, cur = null) {
    const normAmnt = round(amount);
    const normCur = (typeof cur === 'string') ? cur : '';
    return `${normAmnt.toFixed(2)} ${normCur.toUpperCase()}`
}

/**
 * Convert UTC date to YYYY/MM/DD HH:MM:SS.
 * @param {Date|string|null} dateIn
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatUtcDateTime(dateIn = null) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn) :
        new Date();
    const y = date.getUTCFullYear();
    const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const d = `${date.getUTCDate()}`.padStart(2, '0');
    const h = `${date.getUTCHours()}`.padStart(2, '0');
    const i = `${date.getUTCMinutes()}`.padStart(2, '0');
    const s = `${date.getUTCSeconds()}`.padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${i}:${s}`;
}

/**
 * Convert UTC time to HH:MM:SS.
 * @param {Date|string|null} dateIn
 * @return {string}
 * @memberOf TeqFw_Core_Shared_Util
 */
function formatUtcTime(dateIn = null) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn) :
        new Date();
    const h = `${date.getUTCHours()}`.padStart(2, '0');
    const i = `${date.getUTCMinutes()}`.padStart(2, '0');
    const s = `${date.getUTCSeconds()}`.padStart(2, '0');
    return `${h}:${i}:${s}`;
}

/**
 * Return 'true' if `val` is empty.
 * @param {*} val
 * @returns {boolean}
 * @memberOf TeqFw_Core_Shared_Util
 */
function isEmpty(val) {
    return (val === undefined) || (val === null) || (val === '');
}

/**
 * Parse some data as boolean or use default value.
 * @param {*} data
 * @param def
 * @return {boolean}
 * @memberOf TeqFw_Core_Shared_Util
 */
function parseBoolean(data, def = false) {
    let result = def;
    if (
        (data === true) ||
        ((typeof data === 'string') && (
            (data.toLowerCase() === 'true') ||
            (data.toLowerCase() === 'yes')
        )) ||
        ((typeof data === 'number') && (
            (data !== 0)
        ))
    ) {
        result = true;
    } else if (
        (data === false) ||
        ((typeof data === 'string') && (
            (data.toLowerCase() === 'false') ||
            (data.toLowerCase() === 'no')
        )) ||
        ((typeof data === 'number') && (
            (data === 0)
        ))
    ) {
        result = false;
    }
    return result;
}

/**
 * Round number to 'places' decimals.
 *
 * (https://stackoverflow.com/a/19722641/4073821)
 *
 * @param {number} num
 * @param {number} places (integer)
 * @return {number}
 * @memberOf TeqFw_Core_Shared_Util
 */
function round(num, places = 2) {
    const norm = (typeof num === 'number') ? num : Number.parseFloat(num);
    return +(Math.round(norm + "e+" + places) + "e-" + places);
}


// finalize code components for this es6-module
Object.defineProperty(deepMerge, 'name', {value: `${NS}.${deepMerge.name}`});
Object.defineProperty(formatAmount, 'name', {value: `${NS}.${formatAmount.name}`});
Object.defineProperty(formatDate, 'name', {value: `${NS}.${formatDate.name}`});
Object.defineProperty(formatDateTime, 'name', {value: `${NS}.${formatDateTime.name}`});
Object.defineProperty(formatTime, 'name', {value: `${NS}.${formatTime.name}`});
Object.defineProperty(formatUtcDate, 'name', {value: `${NS}.${formatUtcDate.name}`});
Object.defineProperty(formatUtcDateTime, 'name', {value: `${NS}.${formatUtcDateTime.name}`});
Object.defineProperty(formatUtcTime, 'name', {value: `${NS}.${formatUtcTime.name}`});
Object.defineProperty(isEmpty, 'name', {value: `${NS}.${isEmpty.name}`});
Object.defineProperty(parseBoolean, 'name', {value: `${NS}.${parseBoolean.name}`});
Object.defineProperty(round, 'name', {value: `${NS}.${round.name}`});

export {
    buf2hex,
    deepMerge,
    formatAmount,
    formatDate,
    formatDateTime,
    formatTime,
    formatUtcDate,
    formatUtcDateTime,
    formatUtcTime,
    isEmpty,
    parseBoolean,
    round,
};
