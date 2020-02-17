'use strict';


//#region Types

/**
 * @typedef {(
 * 'red' |
 * 'green' |
 * 'yellow' |
 * 'blue' |
 * 'magenta' |
 * 'cyan' |
 * 'white'
 * )} TerminalColor
 * Available color that can be used in terminal.
 */

/**
 * @typedef {Object} GenerateProperties
 * A properties for formatting of message that will be generated.
 *
 * @property {boolean} endDot
 * Dot character will be appended to the end of message, if not already presented.
 * Defaults to `false`.
 *
 * @property {TerminalColor} color
 * A desired color of message.
 * Defaults to `white`.
 */

/**
 * @typedef {Object} PrintProperties
 * A properties for formatting of print process.
 *
 * @property {boolean} pluginName
 * Plugin name will be appended to the start of message.
 * It will be in `cyan` color.
 * Defaults to `true`.

 * @property {boolean} newLineStart
 * New line character will be appended to the start of message.
 * Defaults to `true`.
 *
 * @property {boolean} newLineEnd
 * New line character will be appended to the end of message.
 * Defaults to `true`.
 */

/**
 * @typedef {Object} Items
 * Contains both files and folders paths.
 *
 * @property {string[]} files
 * Files paths.
 *
 * @property {string[]} directories
 * Folders paths.
 */

//#endregion


const Info = require('./info');


/**
 * Operations with terminal.
 */
class Terminal {
    /**
     * Tab symbol.
     */
    static get tab() {
        return ' ';
    }

    /**
     * Colorizes a message.
     *
     * - ANSI escape sequences is used for colors.
     *
     * @param {string} message
     * A message for colorizing.
     *
     * @param {TerminalColor} color
     * A desired color.
     *
     * @returns {string}
     * A colorized string.
     *
     * @see https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color#answer-41407246
     * @see http://bluesock.org/~willkg/dev/ansi.html
     */
    static colorize(message, color) {
        message = `m${message}`;

        switch (color) {
            case 'red':
                message = `31${message}`;
                break;

            case 'green':
                message = `32${message}`;
                break;

            case 'yellow':
                message = `33${message}`;
                break;

            case 'blue':
                message = `34${message}`;
                break;

            case 'magenta':
                message = `35${message}`;
                break;

            case 'cyan':
                message = `36${message}`;
                break;

            default:
            case 'white':
                message = `37${message}`;
                break;
        }

        message = `\x1b[${message}\x1b[0m`;

        return message;
    }

    /**
     * Generates a message for terminal.
     *
     * @param {string} message
     * A raw message.
     *
     * @param {GenerateProperties} [params]
     * A properties of the message.
     *
     * @returns {string}
     * A modified message.
     */
    static generateMessage(message, params = {}) {
        params = {
            ...{
                endDot: false,
                color: 'white'
            },
            ...params
        };

        if (
            params.endDot &&
            message.charAt(message.length - 1) !== '.'
        ) {
            message += '.';
        }

        if (params.color) {
            message = this.colorize(message, params.color);
        }

        return message;
    }

    /**
     * Generates an items message for
     * printing in terminal.
     *
     * @param {Items} items
     * An items for printing.
     *
     * @returns {string[]}
     * Generated messages.
     */
    static generateItemsMessage(items) {
        const tabCount = 2;
        let tab = '';

        for (let i = 0; i !== tabCount; i++) {
            tab += this.tab;
        }

        const messages = [];

        /**
         * @param {string[]} itms
         * @param {string} name
         */
        const generate = (itms, name) => {
            if (!itms.length) {
                return;
            }

            /** @type {GenerateProperties} */
            const commonParams = {
                endDot: false
            };

            messages.push(
                this.generateMessage(
                    `${tab}${name}:`,
                    {
                        ...commonParams,
                        color: 'yellow'
                    }
                )
            );

            for (const item of itms) {
                messages.push(
                    this.generateMessage(
                        `${tab}${tab}${item}`,
                        {
                            ...commonParams,
                            color: 'green'
                        }
                    )
                );
            }
        };

        generate(items.directories, 'folders');
        generate(items.files, 'files');

        return messages;
    }

    /**
     * Prints a messages in terminal.
     *
     * @param {Object} main
     * Can be `compiler` or `compilation` object.
     *
     * @param {string[]} messages
     * A messages for printing.
     *
     * @param {Logger.MessageGroup} group
     * A group of messages.
     *
     * @param {PrintProperties} [params]
     * A properties of the print process.
     */
    static printMessages(_main, messages, group, params = {}) {
        if (!messages.length) {
            return;
        }

        /** @type {PrintProperties} */
        params = {
            ...{
                pluginName: true,
                newLineStart: true,
                newLineEnd: true
            },
            ...params
        };

        /** @type {Console} */
        let logger = {};

        /* https://github.com/Amaimersion/remove-files-webpack-plugin/issues/12
        if (main.getLogger) {
            logger = main.getLogger(Info.fullName);
        } else if (main.getInfrastructureLogger) {
            logger = main.getInfrastructureLogger(Info.fullName);
        } else {
            logger = console;
        }
        */

        logger = console;
        let loggerMethod = 'log';

        switch (group) {
            case 'info':
                loggerMethod = 'info';
                break;

            case 'debug':
                loggerMethod = 'log';
                break;

            case 'warning':
                loggerMethod = 'warn';
                break;

            case 'error':
                loggerMethod = 'error';
                break;
        }

        if (params.newLineStart) {
            logger[loggerMethod]('');
        }

        if (params.pluginName) {
            logger[loggerMethod](
                `${this.colorize(`${Info.fullName}:`, 'cyan')}`
            );
        }

        for (const message of messages) {
            logger[loggerMethod](message);
        }

        if (params.newLineEnd) {
            logger[loggerMethod]('');
        }
    }
}


module.exports = Terminal;
