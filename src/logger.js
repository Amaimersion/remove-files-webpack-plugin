'use strict';


//#region Types

/**
 * @typedef {(
 * 'info' |
 * 'debug' |
 * 'warning' |
 * 'error'
 * )} MessageGroup
 * Group of message.
 */

/**
 * @typedef {Object} Message
 * A message object.
 *
 * @property {string} message
 * A message data.
 *
 * @property {MessageGroup} group
 * A message group.
 *
 * @property {Terminal.Items[]} [items]
 * An items for printing.
 * Optional.
 */

//#endregion


const Terminal = require('./terminal');


/**
 * Logs messages of different levels.
 */
class Logger {
    /**
     * Creates an instance of `Logger`.
     */
    constructor() {
        /** @type {Message[]} */
        this.data = [];
    }

    /**
     * Adds message in log.
     *
     * @param {string} message
     * Message for printing.
     * **You shouldn't include new line symbols
     * in one message, because new line symbol
     * depend on the OS. Use several `add` instead.**
     *
     * @param {Terminal.Items} [items]
     * Optional.
     * An items for printing.
     */
    add(message, items = undefined) {
        this.data.push({
            message: message,
            items: items,
            group: this.group
        });
    }

    /**
     * Clears a log.
     */
    clear() {
        this.data = [];
    }

    /**
     * Prints all messages.
     *
     * @param {Object} prcss
     * `compiler` or `compilation` object.
     *
     * @param {boolean} newLineStart
     * Print new line before all messages will be printed.
     * Defaults to `true`.
     */
    log(prcss, newLineStart = true) {
        let messages = [];

        for (const data of this.data) {
            if (data.message) {
                messages.push(
                    Terminal.generateMessage(
                        data.message,
                        this.generateProperties
                    )
                );
            }

            if (data.items) {
                messages = messages.concat(
                    Terminal.generateItemsMessage(
                        data.items
                    )
                );
            }
        }

        Terminal.printMessages(
            prcss,
            messages,
            this.group,
            {
                newLineStart: newLineStart
            }
        );
    }

    /**
     * @returns {boolean}
     * Logger is empty or not.
     */
    isEmpty() {
        return !this.data.length;
    }
}


/**
 * Logs messages of info level.
 */
class InfoLogger extends Logger {
    /**
     * @returns {MessageGroup}
     * Group of message.
     */
    get group() {
        return 'info';
    }

    /**
     * @returns {Terminal.GenerateProperties}
     * Generate properties.
     */
    get generateProperties() {
        return {
            color: 'white'
        };
    }
}


/**
 * Logs messages of debug level.
 */
class DebugLogger extends Logger {
    /**
     * @returns {MessageGroup}
     * Group of message.
     */
    get group() {
        return 'debug';
    }

    /**
     * @returns {Terminal.GenerateProperties}
     * Generate properties.
     */
    get generateProperties() {
        return {
            color: 'magenta'
        };
    }
}


/**
 * Logs messages of warning level.
 */
class WarningLogger extends Logger {
    /**
     * @returns {MessageGroup}
     * Group of message.
     */
    get group() {
        return 'warning';
    }

    /**
     * @returns {Terminal.GenerateProperties}
     * Generate properties.
     */
    get generateProperties() {
        return {
            color: 'yellow'
        };
    }
}


/**
 * Logs messages of error level.
 */
class ErrorLogger extends Logger {
    /**
     * @returns {MessageGroup}
     * Group of message.
     */
    get group() {
        return 'error';
    }

    /**
     * @returns {Terminal.GenerateProperties}
     * Generate properties.
     */
    get generateProperties() {
        return {
            color: 'red'
        };
    }
}


module.exports = {
    Logger: Logger,
    InfoLogger: InfoLogger,
    DebugLogger: DebugLogger,
    WarningLogger: WarningLogger,
    ErrorLogger: ErrorLogger
};
