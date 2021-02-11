import {constants as H2} from 'http2';

/**
 * This is marker function for HTTP2 stream handlers.
 *
 * @param {TeqFw_Core_App_Server_Http2_Stream_Context} context
 * @returns {TeqFw_Core_App_Server_Http2_Stream_Report}
 * @memberOf TeqFw_Core_App_Server_Http2_Stream
 * @interface
 */
// eslint-disable-next-line no-unused-vars
function handler(context) {
    return new TeqFw_Core_App_Server_Http2_Stream_Report();
}

/**
 * Data structure to group input data for the handlers.
 */
class TeqFw_Core_App_Server_Http2_Stream_Context {
    /** @type {String} */
    body;
    /** @type {Number} */
    flags;
    /** @type {Object.<String, String>} */
    headers;
    /** @type {TeqFw_Core_App_Server_Http2_Stream_Shared} */
    shared;
}

/**
 * Data structure to group handler's processing results (output headers, body, etc.).
 */
class TeqFw_Core_App_Server_Http2_Stream_Report {
    /**
     * 'true' if current handler has processed the request completely.
     * @type {Boolean}
     */
    complete = false;
    /**
     * Full name of the file to send to a client.
     * @type {String}
     */
    filepath;
    /**
     * Headers to add to output on response.
     * @type {Object.<String, String>}
     */
    headers = {};
    /**
     * String or buffer to send to a client.
     * @type {String|Buffer}
     */
    output;
    /**
     * Additional shared objects to be added to input context for remaining handlers.
     * @type {TeqFw_Core_App_Server_Http2_Stream_Shared}
     */
    sharedAdditional = new TeqFw_Core_App_Server_Http2_Stream_Shared();
}

/**
 * Data structure to group transient data being shared between handlers. This is simple object to store shared data
 * related to one HTTP2 request. This context is shared between handlers (ACL and API services, for example).
 *
 * See 'HTTP_SHARE_CTX_...' keys in plugins Default-objects.
 *
 * It is not a good solution but it is flexible solution. I need the flexibility for the time.
 *
 */
class TeqFw_Core_App_Server_Http2_Stream_Shared {
}

/**
 * Factory to create handler for server's streams.
 */
class TeqFw_Core_App_Server_Http2_Stream {

    constructor(spec) {
        // CONSTRUCTOR INJECTED DEPS
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$'];   // instance singleton
        /** @type {TeqFw_Di_Container} */
        const container = spec[DEF.DI_CONTAINER];   // named singleton
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton

        // PARSE INPUT & DEFINE WORKING VARS
        /** @type {Array.<TeqFw_Core_App_Server_Http2_Stream.handler>} */
        const handlers = [];  // ordered array with handlers

        // DEFINE INNER FUNCTIONS

        /**
         * Close stream on any error.
         *
         * @param {ServerHttp2Stream} stream
         * @param {Error} err
         */
        function respond500(stream, err) {
            const stack = (err.stack) ?? '';
            const message = err.message ?? 'Unknown error';
            const error = {message, stack};
            const str = JSON.stringify({error});
            console.error(str);
            if (stream.writable) {
                stream.respond({
                    [H2.HTTP2_HEADER_STATUS]: H2.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                    [H2.HTTP2_HEADER_CONTENT_TYPE]: 'application/json'
                });
                stream.end(str);
            }
        }

        /**
         * Process HTTP request after body has been read. Run handlers one by one and write out result when
         * any handler reports about processing of the request.
         *
         * @param {ServerHttp2Stream} stream
         * @param {Object<String, String>} headers
         * @param {Number} flags
         * @param {String} body
         * @returns {Promise<void>}
         */
        async function processRequest(stream, headers, flags, body) {

            // DEFINE INNER FUNCTIONS

            /**
             * Validate HTTP request method. 'GET' & 'HEAD' methods must be always allowed.
             *
             * @param {Object<String, String>} headers
             * @returns {boolean}
             */
            function hasValidMethod(headers) {
                const method = headers[H2.HTTP2_HEADER_METHOD];
                return (method === H2.HTTP2_METHOD_HEAD) ||
                    (method === H2.HTTP2_METHOD_GET) ||
                    (method === H2.HTTP2_METHOD_POST);
            }

            /**
             * Log request data.
             *
             * @param {Object<String, String>} headers
             */
            function logRequest(headers) {
                const method = headers[H2.HTTP2_HEADER_METHOD];
                const path = headers[H2.HTTP2_HEADER_PATH];
                logger.debug(`${method} ${path}`);
            }

            /**
             * @param {ServerHttp2Stream} stream
             */
            function respond404(stream) {
                stream.respond({
                    [H2.HTTP2_HEADER_STATUS]: H2.HTTP_STATUS_NOT_FOUND,
                    [H2.HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8'
                });
                const content = 'Appropriate handler is not found for this request.';
                stream.end(content);
            }

            /**
             * @param {ServerHttp2Stream} stream
             */
            function respond405(stream) {
                stream.respond({
                    [H2.HTTP2_HEADER_STATUS]: H2.HTTP_STATUS_METHOD_NOT_ALLOWED,
                    [H2.HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8'
                });
                stream.end('Only HEAD, GET and POST methods are allowed.');
            }

            /**
             * Write out complete result to the stream.
             * @param {ServerHttp2Stream} stream
             * @param {TeqFw_Core_App_Server_Http2_Stream_Report} report
             */
            function respondComplete(stream, report) {
                if (stream.writable) {
                    if (report.filepath) {
                        stream.respondWithFile(report.filepath, report.headers);
                    } else {
                        stream.respond(report.headers);
                        stream.end(report.output);
                    }
                }
            }

            // MAIN FUNCTIONALITY
            logRequest(headers);    // log request

            // Analyze input and define type of the request (api or static)
            if (hasValidMethod(headers)) {
                try {
                    // init request context (contains all data required for current request processing)
                    const context = Object.assign(
                        new TeqFw_Core_App_Server_Http2_Stream_Context(),
                        {headers, flags, body}
                    );
                    context.shared = new TeqFw_Core_App_Server_Http2_Stream_Shared();
                    let result = new TeqFw_Core_App_Server_Http2_Stream_Report();
                    for (const handler of handlers) {
                        /** @type {TeqFw_Core_App_Server_Http2_Stream_Report} */
                        const report = await handler(context);
                        Object.assign(result.headers, report.headers);  // add additional headers to results
                        Object.assign(context.shared, report.sharedAdditional); // add shared objects to context
                        if (report.output) result.output = report.output;
                        if (report.filepath) result.filepath = report.filepath;
                        if (report.complete) {
                            result.complete = true;
                            break;
                        }
                    }
                    // write out processing result
                    if (result.complete) {
                        respondComplete(stream, result);
                    } else {
                        respond404(stream);
                    }
                } catch (e) {
                    respond500(stream, e);
                }
            } else {
                // Request method is not allowed.
                respond405(stream);
            }
        }

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)

        /**
         * Factory function to create handler for 'Http2Server.stream' events.
         * @returns {Promise<TeqFw_Core_App_Server_Http2_Stream.handler>}
         */
        this.createHandler = async function () {
            // PARSE INPUT & DEFINE WORKING VARS

            /** @type {TeqFw_Core_App_Server_Http2_Handler_Api} */
            const factHndlApi = await container.get('TeqFw_Core_App_Server_Http2_Handler_Api$', this.constructor.name);
            /** @type {TeqFw_Core_App_Server_Http2_Handler_Static} */
            const factHndlStatic = await container.get('TeqFw_Core_App_Server_Http2_Handler_Static$', this.constructor.name);
            /** @type {Fl32_Teq_User_App_Server_Handler_Session} */
            const factHndlUserSession = await container.get('Fl32_Teq_User_App_Server_Handler_Session$', this.constructor.name);

            /** @type {TeqFw_Core_App_Server_Http2_Handler_Factory.handler} */
            const hndlApi = await factHndlApi.createHandler();
            /** @type {TeqFw_Core_App_Server_Http2_Handler_Factory.handler} */
            const hndlStatic = await factHndlStatic.createHandler();
            /** @type {TeqFw_Core_App_Server_Http2_Handler_Factory.handler} */
            const hndlUser = await factHndlUserSession.createHandler();

            // push handlers to registry with orders
            handlers.push(hndlUser);
            handlers.push(hndlApi);
            handlers.push(hndlStatic);

            // DEFINE INNER FUNCTIONS
            /**
             * Handler to process 'stream' events.
             *
             * @param {ServerHttp2Stream} stream
             * @param {Object<String, String>} headers
             * @param {Number} flags
             * @memberOf TeqFw_Core_App_Server_Http2_Stream
             */
            async function handler(stream, headers, flags) {
                try {
                    // vars to collect input data for POSTs
                    const chunks = [];
                    /* Available events for 'Http2Stream':
                    *   - aborted
                    *   - close
                    *   - error
                    *   - frameError
                    *   - ready
                    *   - timeout
                    *   - trailers
                    *   - wantTrailers
                    * events from 'stream.Readable':
                    *   - close
                    *   - data
                    *   - end
                    *   - error
                    *   - pause
                    *   - readable
                    *   - resume
                    * events from 'stream.Writable':
                    *   - close
                    *   - drain
                    *   - error
                    *   - finish
                    *   - pipe
                    *   - unpipe
                    */
                    // collect input data into array of chunks (if exists)
                    stream.on('data', (chunk) => chunks.push(chunk));
                    // continue process after input has been read
                    stream.on('end', () => processRequest(stream, headers, flags, Buffer.concat(chunks).toString()));
                    stream.on('error', (err) => respond500(stream, err));
                } catch (err) {
                    respond500(err, stream);
                }
            }

            // COMPOSE RESULT
            Object.defineProperty(handler, 'name', {value: `${this.constructor.name}.${handler.name}`});
            return handler;
        };
    }

}

export {
    TeqFw_Core_App_Server_Http2_Stream as default,
    TeqFw_Core_App_Server_Http2_Stream_Context as Context,
    TeqFw_Core_App_Server_Http2_Stream_Report as Report,
    TeqFw_Core_App_Server_Http2_Stream_Shared as Shared,
};