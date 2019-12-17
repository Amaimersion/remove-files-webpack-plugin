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
 * @typedef {Object} TerminalProperties
 * A properties for formatting of a message that will be printed in terminal.
 *
 * @property {boolean} pluginName
 * Plugin name will be appended to the start of message.
 * Defaults to `true`.
 *
 * @property {boolean} endDot
 * Dot character will be appended to the end of message, if not already presented.
 * Defaults to `true`.
 *
 * @property {boolean} newLine
 * New line character will be appended to the end of message.
 * Defaults to `false`.
 *
 * @property {TerminalColor} color
 * A desired color of message.
 * Defaults to `white`.
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


const os = require('os');
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
     * Generates a message for terminal.
     *
     * @param {string} message
     * A raw message.
     *
     * @param {TerminalProperties} params
     * A properties of the message.
     *
     * @returns {string}
     * A modified message.
     */
    static generateMessage(message, params) {
        params = {
            ...{
                pluginName: true,
                endDot: true,
                newLine: false,
                color: 'white'
            },
            ...params
        };

        if (params.pluginName) {
            message = `${Info.fullName}: ${message}`;
        }

        if (
            params.endDot &&
            message.charAt(message.length - 1) !== '.'
        ) {
            message += '.';
        }

        if (params.newLine) {
            message += os.EOL;
        }

        message = this.colorize(message, params.color);

        return message;
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
     * Prints a message in terminal.
     *
     * @param {string} message
     * A message for printing.
     *
     * @param {Items[]} [items]
     * Optional.
     * An items for printing.
     */
    static printMessage(message, items) {
        console.log(
            `${os.EOL + this.colorize(Info.fullName, 'cyan')}: ${message}`
        );

        if (items) {
            this.printItems(items);
        }

        console.log('');
    }

    /**
     * Prints an items in terminal.
     *
     * @param {Items[]} items
     * An items for printing.
     */
    static printItems(items) {
        const tabCount = 2;
        let tab = '';

        for (let i = 0; i !== tabCount; i++) {
            tab += this.tab;
        }

        /**
         * @param {string[]} itms
         * @param {string} name
         */
        const prntItms = (itms, name) => {
            if (!itms.length) {
                return;
            }

            /** @type {TerminalProperties} */
            const commonParams = {
                pluginName: false,
                endDot: false
            };

            console.log(this.generateMessage(
                `${tab}${name}:`,
                {
                    ...commonParams,
                    color: 'yellow'
                }
            ));

            for (const item of itms) {
                console.log(this.generateMessage(
                    `${tab}${tab}${item}`,
                    {
                        ...commonParams,
                        color: 'green'
                    }
                ));
            }
        };

        prntItms(items.directories, 'folders');
        prntItms(items.files, 'files');
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
     * @param {'warnings' | 'errors'} group
     * A group of messages.
     * Can be either `warnings` or `errors`.
     * If `main` contains this property, then all
     * messages will be apended to `main[group]`.
     * This allow to use standard webpack log, instead of custom.
     */
    static printMessages(main, messages, group) {
        if (!messages.length) {
            return;
        }

        const logName = (group === 'errors' ? 'ERROR' : 'WARNING');
        const mainIsCompilation = !!main[group];

        /** @type {Object.<string, TerminalProperties>} */
        const messageParams = {
            compilation: {
                endDot: false,
                color: logName === 'ERROR' ? 'red' : 'yellow'
            },
            compiler: {
                pluginName: false,
                endDot: false,
                color: logName === 'ERROR' ? 'red' : 'yellow'
            }
        };

        for (const message of messages) {
            if (mainIsCompilation) {
                main[group].push(this.generateMessage(
                    message,
                    messageParams.compilation
                ));
            } else {
                console.log(
                    this.generateMessage(
                        `${logName} in ${Info.fullName}: `,
                        messageParams.compiler
                    ) +
                    this.generateMessage(
                        message,
                        messageParams.compiler
                    )
                );
            }
        }
    }
}


module.exports = Terminal;
