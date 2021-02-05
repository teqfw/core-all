/**
 * Defined interface for HTTP2 requests handlers and its factories.
 * This class is a template to create new handlers factories. Known factories are:
 *  - TeqFw_Core_App_Server_Handler_Api
 *  - TeqFw_Core_App_Server_Handler_Static
 *  - Fl32_Teq_User_App_Server_Session
 *
 *  @interface
 */
export default class TeqFw_Core_App_Server_Handler_Factory {

    /**
     * @param {TeqFw_Di_SpecProxy} spec
     */
    constructor(spec) {
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$'];
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton
        /** @type {TeqFw_Di_Container} */
        const container = spec['TeqFw_Di_Container$'];  // instance singleton

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)

        /**
         * Create handler to process HTTP2 requests.
         * @returns {Promise<TeqFw_Core_App_Server_Handler_Factory.handler>}
         */
        this.createHandler = async function () {
            // DEFINE INNER FUNCTIONS
            /**
             *
             * @param {Object} context
             * @returns {Promise<boolean>}
             * @memberOf TeqFw_Core_App_Server_Handler_Factory
             * @interface
             */
            async function handler(context) {
                // PARSE INPUT & DEFINE WORKING VARS
                /** @type {String} */
                const body = context[DEF.HTTP_REQ_CTX_BODY];
                /** @type {Number} */
                const flags = context[DEF.HTTP_REQ_CTX_FLAGS];
                /** @type {IncomingHttpHeaders} */
                const headers = context[DEF.HTTP_REQ_CTX_HEADERS];
                /** @type {ServerHttp2Stream} */
                const stream = context[DEF.HTTP_REQ_CTX_STREAM];
                // DEFINE INNER FUNCTIONS

                // MAIN FUNCTIONALITY
                let result = false;
                try {
                    // process request, compose response and write it to the 'stream'
                    result = true;  // return 'true' if request is completely processed
                } catch (e) {
                    debugger;
                }
                return result;
            }

            // MAIN FUNCTIONALITY
            const name = `${this.constructor.name}.${handler.name}`;
            logger.debug(`HTTP2 requests handler '${name}' is created.`);
            // COMPOSE RESULT
            Object.defineProperty(handler, 'name', {value: name});
            return handler;
        };
    }
}

