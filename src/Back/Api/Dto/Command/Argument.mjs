/**
 * Data structure for command argument.
 * (@see node_modules/commander/lib/command.js:291 - Command.argument)
 */
// MODULE'S VARS
const NS = 'TeqFw_Core_Back_Api_Dto_Command_Argument';

// MODULE'S CLASSES
class TeqFw_Core_Back_Api_Dto_Command_Argument {
    /** @type {*} */
    defaultValue;
    /** @type {string} */
    description;
    /** @type {Function|*} */
    fn;
    /** @type {string} */
    name;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Core_Back_Api_Dto_Command_Argument
 */
class Factory {
    constructor() {
        /**
         * @param {TeqFw_Core_Back_Api_Dto_Command_Argument|null} data
         * @return {TeqFw_Core_Back_Api_Dto_Command_Argument}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Core_Back_Api_Dto_Command_Argument();
            res.defaultValue = data?.defaultValue;
            res.description = data?.description;
            res.fn = data?.fn;
            res.name = data?.name;
            return res;
        }
    }
}

// freeze class to deny attributes changes then export class
Object.freeze(TeqFw_Core_Back_Api_Dto_Command_Argument);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
export {
    TeqFw_Core_Back_Api_Dto_Command_Argument as default,
    Factory
} ;