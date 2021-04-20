import $path from 'path';

/**
 * Load namespaces data to initialize DI container on the front.
 */
class TeqFw_Core_App_Back_Service_Load_Namespaces {

    constructor(spec) {
        // CONSTRUCTOR INJECTED DEPS
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$'];
        /** @type {TeqFw_Core_App_Plugin_Registry} */
        const registry = spec['TeqFw_Core_App_Plugin_Registry$'];   // instance singleton
        /** @type {typeof TeqFw_Core_App_Shared_Service_Route_Load_Namespaces_Request} */
        const Request = spec['TeqFw_Core_App_Shared_Service_Route_Load_Namespaces#Request'];   // class
        /** @type {typeof TeqFw_Core_App_Shared_Service_Route_Load_Namespaces_Response} */
        const Response = spec['TeqFw_Core_App_Shared_Service_Route_Load_Namespaces#Response']; // class
        /** @type {typeof TeqFw_Core_App_Shared_Service_Route_Load_Namespaces_ResponseItem} */
        const DItem = spec['TeqFw_Core_App_Shared_Service_Route_Load_Namespaces#ResponseItem']; // class

        // INIT OWN PROPERTIES AND DEFINE WORKING VARS
        const namespaces = getNamespaces(registry); // cache for namespaces

        // DEFINE INNER FUNCTIONS
        /**
         * Loop through all plugins and compose namespace mapping for static sources.
         * (@see TeqFw_Http2_Plugin_Handler_Static)
         * @param {TeqFw_Core_App_Plugin_Registry} registry
         * @memberOf TeqFw_Core_App_Back_Service_Load_Namespaces
         */
        function getNamespaces(registry) {
            const result = {};
            const plugins = registry.items();
            for (const one of plugins) {
                /** @type {TeqFw_Core_App_Plugin_Package_Data_Autoload} */
                const auto = one.teqfw.autoload;
                const srcUrl = $path.join('/', DEF.AREA_SRC, one.name);
                const item = Object.assign(new DItem(), auto);
                item.path = srcUrl;
                result[item.ns] = item;
            }
            return result;
        }

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)
        // this.createInputParser = function () {};

        this.createService = function () {
            /**
             *
             * @returns {Promise<{response: TeqFw_Core_App_Shared_Service_Route_Load_Namespaces_Response}>}
             * @memberOf TeqFw_Core_App_Back_Service_Load_Namespaces
             */
            async function service() {
                const response = new Response();
                response.items = namespaces;
                return {response};
            }

            Object.defineProperty(service, 'name', {
                value: `${this.constructor.name}.${service.name}`,
            });
            return service;
        };

        this.getRoute = function () {
            return DEF.API_LOAD_NS;
        };
    }
}

export default TeqFw_Core_App_Back_Service_Load_Namespaces;
