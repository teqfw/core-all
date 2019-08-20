/**
 * Server side logger. Used by all objects on server side.
 */
const LEVEL_DEBUG = 1;
const LEVEL_INFO = 2;
const LEVEL_WARN = 3;
const LEVEL_ERROR = 4;
const TEQ_FW_LOG_MARKERS = "teqFwLogMarkers";

export default class TeqFw_Core_App_Logger {

    constructor() {

        /**
         * Internal queue to save log data (FIFO).
         *
         * https://stackoverflow.com/a/53966257/4073821
         */
        class LogQueue extends Map {
            constructor() {
                super();
                this.insertionIndex = 0;
                this.removalIndex = 0;
            }

            /**
             * Put log record into the queue.
             *
             * @param element
             */
            queue(element) {
                this.set(this.insertionIndex, element);
                this.insertionIndex++;
            }

            /**
             * Get last queued item.
             *
             * @return {Object}
             */
            getLast() {
                const result = this.get(this.insertionIndex - 1);
                return result;
            }

            /**
             * Get log record from queue.
             *
             * @return {Object}
             */
            dequeue() {
                const result = this.get(this.removalIndex);
                if (typeof result !== "undefined") {
                    this.delete(this.removalIndex);
                    this.removalIndex++;
                }
                return result;
            }
        }

        /**
         * Internal queue to temporary save log data before processing.
         *
         * @type {LogQueue}
         * @private
         */
        const _queue = new LogQueue();

        const _transports = [];

        /**
         * Place log record in queue, then process queue against existing transports.
         *
         * @private
         * @param {Number} level
         * @param {string|Object} first
         * @param {string|Object} [second]
         * @param {Object} [third]
         */
        function write(level, first, second, third) {
            const record = {};
            // TODO: use "process.hrtime()" to get microtime
            record.date = (new Date()).getTime(); // int, UTC
            record.level = level;
            record.markers = {};

            if (arguments.length === 2) {
                if (typeof first === "string") {
                    // debug("message")
                    record.message = first;
                } else {
                    // OK, it is not a first argument in this function but first argument in public wrapper.
                    throw "Logger error. String message is expected as first argument!";
                }
            } else if (arguments.length === 3) {
                if ((typeof first === "object") && (typeof second === "string")) {
                    // debug(this, message)
                    if (first[TEQ_FW_LOG_MARKERS] !== undefined) {
                        record.markers = first[TEQ_FW_LOG_MARKERS];
                    }
                    record.message = second;
                } else if (typeof first === "string") {
                    // debug(message, details)
                    record.message = first;
                    record.details = second;
                } else {
                    // OK, it is not a first & second argument in this function, but (see upper)).
                    throw "Logger error. Check first & second arguments (should be object/string or string/object)!";
                }
            } else if (arguments.length === 4) {
                if (
                    (typeof first === "object") &&
                    (typeof second === "string") &&
                    (typeof third === "object")
                ) {
                    // debug(this, message, details)
                    if (first[TEQ_FW_LOG_MARKERS] !== undefined) {
                        record.markers = first[TEQ_FW_LOG_MARKERS];
                    }
                    record.message = second;
                    record.details = third;
                } else {
                    throw "Logger error. Check arguments types (object/string/object are expected)!";
                }
            } else {
                // OK, it is 4 arguments max are expected, but (see upper)).
                throw "Logger error. Max 3 arguments are expected!";
            }
            _queue.queue(record);
            // print or save logs in queue
            process_queue();
        }

        /**
         * Temporal implementation of the log output, for console only.
         */
        function process_queue() {
            /* process queue if transports list is not empty */
            if (_transports.length > 0) {
                /* compose batch with log messages to process */
                const batch = [];
                let item = _queue.dequeue();
                while (item !== undefined) {
                    batch.push(item);
                    item = _queue.dequeue();
                }
                /* process batch against transports */
                if (batch.length > 0) {
                    /* make async processing */
                    for (const one of _transports) {
                        one.process(batch);
                    }
                }
            }
        }

        /**
         * @memberOf TeqFw_Core_App_Logger.prototype
         */
        this.debug = function () {
            const params = Array.prototype.slice.call(arguments);
            params.unshift(LEVEL_DEBUG);
            write.apply(this, params);
        };

        /**
         * @memberOf TeqFw_Core_App_Logger.prototype
         */
        this.info = function () {
            const params = Array.prototype.slice.call(arguments);
            params.unshift(LEVEL_INFO);
            write.apply(this, params);
        };

        /**
         * @memberOf TeqFw_Core_App_Logger.prototype
         */
        this.warn = function () {
            const params = Array.prototype.slice.call(arguments);
            params.unshift(LEVEL_WARN);
            write.apply(this, params);
        };

        /**
         * @memberOf TeqFw_Core_App_Logger.prototype
         */
        this.error = function () {
            const params = Array.prototype.slice.call(arguments);
            params.unshift(LEVEL_ERROR);
            write.apply(this, params);
        };

        /**
         * @memberOf TeqFw_Core_App_Logger.prototype
         */
        this.getLast = function () {
            return _queue.getLast();
        };

        /**
         * Add transport to logger.
         *
         * @param {Object} transport
         * @memberOf TeqFw_Core_App_Logger.prototype
         */
        this.addTransport = function (transport) {
            _transports.push(transport);
        };
    }
}