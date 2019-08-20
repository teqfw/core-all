/**
 * Application registry for teq-modules.
 */
export default class TeqFw_Core_App_Registry_Module {
    /**
     * @typedef {Object} TeqFw_Core_App_Registry_Module.ModuleDescriptorData
     * @property {Object} autoload - Source scripts auto-loading configuration.
     * @property {string} autoload.ns - Namespace for sources ("TeqFw_Core_Di").
     * @property {string} autoload.path - Relative path to sources folder ("./src").
     */
    /**
     * @typedef {Object} TeqFw_Core_App_Registry_Module.ModuleScanData
     * @property {string} name - Module name ("teqfw-core-di")
     * @property {Object} path - Paths to module's parts.
     * @property {string} path.root - Absolute path to module's root ("/.../app/node_modules/teqfw-core-di")
     * @property {string} path.pub - Absolute path to module's `pub` resources (if exist, "/.../app/node_modules/teqfw-core-di")
     * @property {TeqFw_Core_App_Registry_Module.ModuleDescriptorData} desc - teqfw-descriptor from `package.json`
     */

    constructor() {
        /**
         * Registry for teq-modules definitions (see `teqfw` nodes in `package.json` files).
         *
         * @type {Map<string, TeqFw_Core_App_Registry_Module.ModuleScanData>}
         */
        const _registry = new Map();

        /**
         * Get module data by name or get all modules.
         *
         * @param {string}[mod_name] - Module name to get module's definitions from registry. Get all definitions
         *      for all modules if undefined.
         * @return {[TeqFw_Core_App_Registry_Module.ModuleScanData]|TeqFw_Core_App_Registry_Module.ModuleScanData}
         * @memberOf TeqFw_Core_App_Registry_Module.prototype
         */
        this.get = function (mod_name = undefined) {
            let result;
            if (mod_name) {
                result = _registry.get(mod_name);
            } else {
                result = Array.from(_registry.values());
            }
            return result;
        };

        /**
         * Save scanned data for modules into the inner store.
         *
         * @param {Array<TeqFw_Core_App_Registry_Module.ModuleScanData>} mods - Array of the scanned nodule's data.
         * @memberOf TeqFw_Core_App_Registry_Module.prototype
         */
        this.init = function (mods) {
            /** @type {TeqFw_Core_App_Registry_Module.ModuleScanData} one */
            for (const one of mods) {
                const name = one.name;
                _registry.set(name, one);
            }
        };
    }
}