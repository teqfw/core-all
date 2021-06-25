/**
 * Plugin registry item DTO.
 */
// MODULE'S VARS
const NS = 'TeqFw_Core_Back_Scan_Plugin_Dto_Item';

// MODULE'S CLASSES
class TeqFw_Core_Back_Scan_Plugin_Dto_Item {
    /**
     * Name of the plugin init class.
     * @type {string}
     */
    initClass;
    /**
     * Name of the package.
     * @type {string}
     */
    name;
    /**
     * Path to the root of the package.
     * @type {string}
     */
    path;
    /**
     * 'teqfw.json' content of the package. We don't know exact structure for this object because plugins can
     * add own nodes to this JSON.
     * @type {Object}
     */
    teqfw;
}


/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Core_Back_Scan_Plugin_Dto_Item
 */
class Factory {
    constructor() {
        /**
         * @param {TeqFw_Core_Back_Scan_Plugin_Dto_Item|null} data
         * @return {TeqFw_Core_Back_Scan_Plugin_Dto_Item}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Core_Back_Scan_Plugin_Dto_Item();
            res.initClass = data?.initClass;
            res.name = data?.name;
            res.path = data?.path;
            res.teqfw = data?.teqfw;
            return res;
        }
    }
}

// freeze class to deny attributes changes then export class
Object.freeze(TeqFw_Core_Back_Scan_Plugin_Dto_Item);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
export {
    TeqFw_Core_Back_Scan_Plugin_Dto_Item as default,
    Factory
} ;
