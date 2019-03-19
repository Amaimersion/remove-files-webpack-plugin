'use strict';


const Info = require('./info');


class Console {
    /**
     * Generates a message for terminal.
     *
     * @param {String} message
     * The raw message.
     *
     * @param {{pluginName: true, endDot: true, newLine: false, color: 'white'}} params
     * The modifications for a message.
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
            }, ...params
        };

        if (params.pluginName) {
            message = `${Info.pluginName}: ${message}`;
        }

        if (params.endDot && message.charAt(message.length - 1) !== '.') {
            message += '.';
        }

        if (params.newLine) {
            message += '\n';
        }

        /**
         * ANSI escape sequences for colors.
         *
         * @see https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color#answer-41407246
         * @see http://bluesock.org/~willkg/dev/ansi.html
         */
        switch (params.color) {
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
                throw new Error('Invalid color.')
        }

        return message;
    }

    /**
     * Prints a message.
     *
     * @param {String} message
     * The message for printing.
     *
     * @param {Array<Items>} items
     * Optionally.
     * The items for printing.
     */
    static printLogMessage(message, items) {
        console.log(
            '\n' +
            Console.generateMessage(Info.pluginName, {
                pluginName: false, endDot: false, newLine: false, color: 'cyan'
            }) +
            ': ' +
            `${message}`
        );

        if (items) {
            this.printItems(items);
        }

        console.log('');
    }

    /**
     * Prints an items.
     *
     * @param {Array<Items>} items
     * The items for printing.
     */
    static printItems(items) {
        let tabSymbol = ' ';
        let tabNumber = 2;
        let tab = '';

        for (let i = 0; i != tabNumber; i++) {
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

            console.log(Console.generateMessage(
                `${tab}${name}:`,
                { ...commonParams, color: 'yellow' }
            ));

            for (let item of itms) {
                console.log(Console.generateMessage(
                    `${tab}${tab}${item}`,
                    { ...commonParams, color: 'green' }
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
                main[groupName].push(Console.generateMessage(
                    message,
                    messageParams.compilation
                ));
            } else {
                console.log(
                    Console.generateMessage(
                        `${logName} in ${Info.pluginName}: `,
                        messageParams.compiler
                    ) +
                    Console.generateMessage(
                        message,
                        messageParams.compiler
                    )
                );
            }
        }
    }
}


module.exports = Console;
