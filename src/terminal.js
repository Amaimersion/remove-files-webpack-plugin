'use strict';


/**
 * @typedef {('red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white')} TerminalColor
 * Available color that can be used in terminal.
 */

/**
 * @typedef {Object} TerminalProperties
 * A properties for formatting of a message that will be printed in terminal.
 * 
 * @property {boolean} pluginName 
 * In the start of a message will be appended a plugin name.
 * Defaults to `true`.
 * 
 * @property {boolean} endDot
 * In the end of a message will be appended a dot, if not present.
 * Defaults to `true`.
 * 
 * @property {boolean} newLine
 * In the end of a message will be appended a new line symbol.
 * Defaults to `false`.
 * 
 * @property {TerminalColor} color
 * A desired color of a message.
 * Defaults to `white`.
 */

/**
 * @typedef {Object} Items
 * Contains a files and folders paths.
 * 
 * @property {Array<String>} files
 * Files paths.
 * 
 * @property {Array<String>} dicts
 * A folders paths.
 */


const os = require('os');
const Info = require('./info');


/**
 * Operations with terminal.
 */
class Terminal {
    /**
     * Generates a message for terminal using specified parameters.
     *
     * @param {String} message
     * A raw message.
     *
     * @param {TerminalProperties} params
     * A modifications for the message.
     *
     * @returns {String}
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
     * Colorizes a message using ANSI escape sequences for colors.
     * 
     * @param {String} message
     * A message for colorizing.
     * 
     * @param {TerminalColor} color
     * A desired color.
     * 
     * @returns {String}
     * A colorized string.
     * 
     * @see https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color#answer-41407246
     * @see http://bluesock.org/~willkg/dev/ansi.html
     */
    static colorize(message, color) {
        switch (color) {
            case 'red':
                message = `\x1b[31m${message}\x1b[0m`;
                break;
            case 'green':
                message = `\x1b[32m${message}\x1b[0m`;
                break;
            case 'yellow':
                message = `\x1b[33m${message}\x1b[0m`;
                break;
            case 'blue':
                message = `\x1b[34m${message}\x1b[0m`;
                break;
            case 'magenta':
                message = `\x1b[35m${message}\x1b[0m`;
                break;
            case 'cyan':
                message = `\x1b[36m${message}\x1b[0m`;
                break;
            case 'white':
                message = `\x1b[37m${message}\x1b[0m`;
                break;
            default:
                throw new Error('Invalid color.');
        }

        return message;
    }

    /**
     * Prints a message in terminal.
     *
     * @param {String} message
     * A message for printing.
     *
     * @param {Array<Items>} [items]
     * Optional.
     * An items for printing.
     */
    static printMessage(message, items) {
        console.log(
            os.EOL +
            this.colorize(Info.fullName, 'cyan') +
            ': ' +
            message
        );

        if (items) {
            this.printItems(items);
        }

        console.log('');
    }

    /**
     * Prints an items in terminal.
     *
     * @param {Array<Items>} items
     * An items for printing.
     */
    static printItems(items) {
        let tabSymbol = ' ';
        let tabCount = 2;
        let tab = '';

        for (let i = 0; i != tabCount; i++) {
            tab += tabSymbol;
        }

        const prntItms = (itms, name) => {
            if (!itms.length) {
                return;
            }

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

            for (let item of itms) {
                console.log(this.generateMessage(
                    `${tab}${tab}${item}`,
                    {
                        ...commonParams,
                        color: 'green'
                    }
                ));
            }
        };

        prntItms(items.dicts, 'folders');
        prntItms(items.files, 'files');
    }

    /**
     * Prints a messages in terminal.
     * 
     * @param {Object} main
     * Can be `compiler` or `compilation` object.
     * 
     * @param {Array<String>} messages
     * A messages for printing.
     * 
     * @param {('warnings' | 'errors')} groupName
     * A group of messages. 
     * Can be either `warnings` or `errors`.
     * If `main` contains this property, then all
     * messages will be apended to `main[groupName]`.
     * This allow us to use standard webpack log, instead of custom.
     */
    static printMessages(main, messages, groupName) {
        if (!messages.length) {
            return;
        }

        const logName = (groupName === "errors" ? 'ERROR' : 'WARNING');
        const mainIsCompilation = !!main[groupName];

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

        for (let message of messages) {
            if (mainIsCompilation) {
                main[groupName].push(this.generateMessage(
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
