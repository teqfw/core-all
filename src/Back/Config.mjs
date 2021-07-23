/**
 * Container for configurations.
 * Load local configuration from a file (default './cfg/local.json').
 *
 * @namespace TeqFw_Core_Back_Config
 */
// MODULE'S IMPORT
import {existsSync, readFileSync, statSync} from 'fs';
import {join} from 'path';

export default class TeqFw_Core_Back_Config {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Core_Back_Defaults} */
        const DEF = spec['TeqFw_Core_Back_Defaults$'];
        /** @type {TeqFw_Core_Back_Api_Dto_Formless.Factory} */
        const fConfig = spec['TeqFw_Core_Back_Api_Dto_Formless#Factory$'];
        /** @type {typeof TeqFw_Core_Back_Api_Dto_App_Boot} */
        const Boot = spec['TeqFw_Core_Back_Api_Dto_App_Boot#'];

        // DEFINE WORKING VARS / PROPS
        /** @type {TeqFw_Core_Back_Api_Dto_App_Boot} */
        const boot = new Boot();
        /** @type {TeqFw_Core_Back_Api_Dto_Formless} storage for local configuration */
        let local = fConfig.create();


        // DEFINE INSTANCE METHODS
        /**
         * Get boot configuration.
         *
         * @return {TeqFw_Core_Back_Api_Dto_App_Boot}
         */
        this.getBoot = function () {
            return boot;
        };

        /**
         * Get local configuration options (all or for given 'node' only).
         *
         * @param {string|null} node
         * @return {*}
         */
        this.getLocal = function (node = null) {
            return (node === null) ? local : local[node];
        };

        /**
         * Load local configuration and init internal storage.
         *
         * @param {string} root absolute path to application root folder ('/home/alex/work/pwa/')
         * @param {string} cfg relative path to local configuration JSON (by default: './cfg/local.json')
         */
        this.loadLocal = function (root, cfg = DEF.PATH_CFG_LOCAL) {
            const full = join(root, cfg);
            if (existsSync(full) && statSync(full).isFile()) {
                const data = readFileSync(full);
                local = fConfig.create(data.toString());
            }
        };

        /**
         * Set boot options to config.
         * @param {string} path absolute path to application root
         * @param {string} version application version
         */
        this.setBoot = function (path, version) {
            boot.projectRoot = path;
            boot.version = version;
        }
    }
}
