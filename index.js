/**
 * @module RemoveFilesWebpackPlugin
 * @version 1.0.0
 * @file A plugin for webpack which removes files and folders before and after compilation.
 * @author Sergey Kuznetsov <https://github.com/Amaimersion>
 * @license MIT
 * @see https://github.com/Amaimersion/remove-files-webpack-plugin
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Contains directories and files.
 */
class Items {
    constructor() {
        this.dicts = [];
        this.files = [];
    }
}

class RemoveFilesWebpackPlugin {
    /**
     * Creates an instance of RemoveFilesWebpackPlugin.
     *
     * @param {Object} params
     *
     * @param {String} params.root
     * The root directory.
     * A not absolute paths will appends to this.
     * Defaults to `__dirname`.
     *
     * @param {Array<String>} params.include
     * The folders/fils for remove.
     * Defaults to `[]`.
     *
     * @param {Array<String>} params.exclude
     * The files for exclude.
     * Defaults to `[]`.
     *
     * @param {Array<{folder: String, method: (filePath) => Boolean, recursive: Boolean}>} params.test
     * The folders for custom testing.
     * Defaults to `[]`.
     *
     * @param {Boolean} params.log
     * Print which folders/files has been removed.
     * Defaults to `true`.
     *
     * @param {Boolean} params.emulate
     * Emulate remove.
     * Print which folders/files will be removed without actually removing them.
     * Ignores `params.log`.
     * Defaults to `false`.
     *
     * @param {Boolean} params.allowRootAndOutside
     * Allow remove a root directory and outside the root directory.
     * It's kinda safe mode.
     * Don't turn on it, if you don't know what you actually want!
     * Defaults to `false`.
     */
    constructor(params) {
        params = params || {};
        const defaultParams = {
            root: __dirname,
            include: [],
            exclude: [],
            test: [],
            log: true,
            emulate: false,
            allowRootAndOutside: false
        };

        if (!params.before && !params.after) {
            throw new Error(`No "before" or "after" parameters specified.`)
        }

        this.pluginName = 'remove-files-plugin';
        this.warnings = [];
        this.errors = [];
        this.beforeParams = {...defaultParams, ...params.before};
        this.afterParams = {...defaultParams, ...params.after};
    }

    /**
     * "This method is called once by the webpack compiler while installing the plugin".
     *
     * @param {Object} compiler
     * "Represents the fully configured webpack environment".
     */
    apply(compiler) {
        /**
         * webpack 4+ comes with a new plugin system.
         * Check for hooks in order to support old plugin system.
         */
        const applyHook = (compiler, hook, params, method) => {
            if (!params || !Object.keys(params).length) {
                return;
            }

            if (compiler.hooks) {
                compiler.hooks[hook].tapAsync(this.pluginName, method);
            } else {
                compiler.plugin(hook, method);
            }
        };

        applyHook(compiler, 'beforeRun', this.beforeParams, (compiler, callback) => {
            this.handleHook(compiler, callback, this.beforeParams);
        });
        applyHook(compiler, 'afterEmit', this.afterParams, (compilation, callback) => {
            this.handleHook(compilation, callback, this.afterParams);
        });
    }

    /**
     * Handles "beforeRun/afterEmit" hook.
     *
     * @param {Object} main
     * Can be "compiler/compilation" object.
     *
     * @param {Function} callback
     * "Some compilation plugin steps are asynchronous,
     * and pass a callback function that must be invoked
     * when your plugin is finished running".
     *
     * @param {Object} params
     * The parameters for remove
     * Either `this.beforeParams` or `this.afterParams`.
     */
    handleHook(main, callback, params) {
        this.handleRemove(params);

        const addMessagesToGroup = (main, messages, groupName, logName) => {
            if (!messages.length) {
                return;
            }

            const messageParams = {
                if: {
                    endDot: false,
                    color: logName.toUpperCase() === 'ERROR' ? 'red' : 'yellow'
                },
                else: {
                    pluginName: false,
                    endDot: false,
                    color: logName.toUpperCase() === 'ERROR' ? 'red' : 'yellow'
                }
            };

            for (let message of messages) {
                // if main === compilation.
                if (main[groupName]) {
                    main[groupName].push(this.generateMessage(
                        message,
                        messageParams.if
                    ));
                // if main === compiler.
                } else {
                    console.log(
                        this.generateMessage(
                            `${logName} in ${this.pluginName}: `,
                            messageParams.else
                        ) +
                        this.generateMessage(
                            message,
                            messageParams.else
                        )
                    );
                }
            }
        }

        addMessagesToGroup(main, this.warnings, 'warnings', 'WARNING');
        addMessagesToGroup(main, this.errors, 'errors', 'ERROR');

        // This can be executed later if specified both before and after params.
        this.warnings = [];
        this.errors = [];

        callback();
    }

    /**
     * Removes folders/files.
     *
     * @param {Object} params
     * The parameters for remove.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    handleRemove(params) {
        const items = this.getItemsForRemove(params);

        if (
            !Object.keys(items.dicts).length &&
            !Object.keys(items.files).length
        ) {
            this.warnings.push('The items for remove is not found.');
            return;
        }

        if (params.emulate) {
            this.printLogMessage(
                'The following items will be removed in case of not emulate: ',
                items
            );
            return;
        }

        for (let dict of items.dicts) {
            this.unlinkFolderSync(dict);
        }

        for (let file of items.files) {
            fs.unlinkSync(file);
        }

        if (params.log) {
            this.printLogMessage(
                'The following items has been removed: ',
                items
            );
        }
    }

    /**
     * Gets sorted folders/files for removing.
     *
     * @param {Object} params
     * The parameters for remove.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    getItemsForRemove(params) {
        let items = new Items();

        params.include = this.toAbsolutePaths(params.root, params.include);
        params.exclude = this.toAbsolutePaths(params.root, params.exclude);

        if (params.test && params.test.length) {
            for (let test of params.test) {
                if (!path.isAbsolute(test.folder)) {
                    test.folder = path.join(params.root, test.folder);
                }

                if (!params.allowRootAndOutside && !this.isSave(params.root, test.folder)) {
                    continue;
                }

                let itemStat = this.getStatSync(test.folder);

                if (!itemStat) {
                    continue;
                } else if (!itemStat.isDirectory()) {
                    this.warnings.push(`Test folder is not directory - ${test.folder}`)
                    continue;
                } else if (!itemStat.isDirectory() && !itemStat.isFile()) {
                    this.warnings.push(`Invalid stat for the ${test.folder}`);
                    continue;
                }

                const getFilesRecursiveSync = (dict) => {
                    const files = fs.readdirSync(dict);

                    for (let file of files) {
                        file = path.join(dict, file);
                        const stat = this.getStatSync(file);

                        if (!stat) {
                            continue;
                        } else if (stat.isFile() && test.method(file)) {
                            params.include.push(file);
                        } else if (stat.isDirectory() && test.recursive) {
                            getFilesRecursiveSync(file);
                        } else if (!stat.isDirectory() && !stat.isFile()) {
                            this.warnings.push(`Invalid stat for the ${file}`);
                        }
                    }
                };

                getFilesRecursiveSync(test.folder);
            }
        }

        for (let item of params.include) {
            if (params.exclude.includes(item)) {
                continue;
            }

            if (!params.allowRootAndOutside && !this.isSave(params.root, item)) {
                continue;
            }

            const stat = this.getStatSync(item);
            let group = undefined;

            if (!stat) {
                continue;
            } else if (stat.isFile()) {
                group = 'files';
            } else if (stat.isDirectory()) {
                group = 'dicts';
            } else {
                this.warnings.push(`Invalid stat for the ${item}`);
                continue;
            }

            if (items[group].includes(item)) {
                continue;
            }

            items[group].push(item);
        }

        items = this.cropUnnecessaryItems(items);

        return items;
    }

    /**
     * Crops unecessary folders/files.
     *
     * It's clears childrens dicts/files,
     * whose parents will be removing.
     *
     * @param {Items} items
     * A folders/files.
     *
     * @example
     * items = {
     *  dicts: [
     *    'D:/dist/styles/css',
     *    'D:/dist/js/scripts',
     *    'D:/dist/styles'
     *  ];
     *  files: [
     *    'D:/dist/styles/popup.css',
     *    'D:/dist/styles/popup.css.map',
     *    'D:/dist/manifest.json'
     *  ];
     * };
     *
     * Returns:
     * items = {
     *  dicts: [
     *    'D:/dist/js/scripts',
     *    'D:/dist/styles'
     *  ];
     *  files: [
     *    'D:/dist/manifest.json'
     *  ];
     * };
     *
     * Because full styles folder will be removed.
     */
    cropUnnecessaryItems(items) {
        if (!items.dicts.length) {
            return items;
        }

        const rightItems = new Items();
        let unnecessaryIndexes = new Set();

        const addToUnnecessaryIndexes = (firstGroup, secondGroup, indexes) => {
            for (let item of firstGroup) {
                item = this.toEscapeString(item);
                const regexp = new RegExp(`(^${item})(.+)`, 'm');

                for (let i in secondGroup) {
                    if (regexp.test(secondGroup[i])) {
                        indexes.add(i);
                    }
                }
            }
        };

        const addToRightGroup = (rightGroup, itemsGroup, indexes) => {
            for (let index in itemsGroup) {
                if (!indexes.has(index)) {
                    rightGroup.push(itemsGroup[index]);
                }
            }
        };

        addToUnnecessaryIndexes(items.dicts, items.dicts, unnecessaryIndexes);
        addToRightGroup(rightItems.dicts, items.dicts, unnecessaryIndexes);

        unnecessaryIndexes.clear();

        addToUnnecessaryIndexes(rightItems.dicts, items.files, unnecessaryIndexes);
        addToRightGroup(rightItems.files, items.files, unnecessaryIndexes);

        return rightItems;
    }

    /**
     * Gets a stat for an item.
     *
     * @param {String} path
     * An absolute path to the folder/file.
     *
     * @returns {fs.Stats}
     *
     * @see https://nodejs.org/api/fs.html#fs_fs_lstatsync_path
     */
    getStatSync(path) {
        let stat = undefined;

        try {
            stat = fs.lstatSync(path);
        } catch (error) {
            this.errors.push(error.message);
        }

        return stat;
    }

    /**
     * Removes a folder.
     *
     * Expects that the check for exists has already been done.
     *
     * @param {String} folderPath
     * An absolute path to the folder.
     */
    unlinkFolderSync(folderPath) {
        let files = fs.readdirSync(folderPath);
        files = this.toAbsolutePaths(folderPath, files);

        for (let file of files) {
            const stat = this.getStatSync(file);

            if (!stat) {
                continue;
            } else if (stat.isFile()) {
                fs.unlinkSync(file);
            } else if (stat.isDirectory()) {
                this.unlinkFolderSync(file);
            } else {
                this.warnings.push(`Invalid stat for the ${file}`)
            }
        }

        fs.rmdirSync(folderPath);
    }

    /**
     * Converts all paths to absolute paths.
     *
     * @param {String} root
     * The root that will be appended to non absolute paths.
     *
     * @param {Array<String>} paths
     * A paths for converting.
     *
     * @returns {Array<String>}
     * An absolute  paths.
     */
    toAbsolutePaths(root, paths) {
        const newPaths = [];

        for (let item of paths) {
            if (!path.isAbsolute(item)) {
                item = path.join(root, item);
            }

            newPaths.push(item);
        }

        return newPaths;
    }

    /**
     * Escapes a string
     *
     * @param {String} string
     * The string for escaping.
     *
     * @returns {String}
     * Escaped string.
     */
    toEscapeString(string) {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

    /**
     * Checks a path for safety.
     *
     * Checking for either exit or in of the root.
     *
     * @param {String} root
     * The main directory.
     *
     * @param {String} pth
     * The path for checking.
     *
     * @returns {Boolean}
     * True - save, False - not save.
     *
     * @example
     * root - 'D:/dist'
     * pth - 'D:/dist/chromium'
     * Returns - true
     *
     * root - 'D:/dist'
     * pth - 'D:/dist'
     * Returns - false
     *
     * root - 'D:/dist'
     * pth - 'D:/'
     * Returns - false
     */
    isSave(root, pth) {
        return new RegExp(`(^${this.toEscapeString(root)})(.+)`, 'm').test(pth);
    }

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
    generateMessage(message, params) {
        params = {...{
            pluginName: true,
            endDot: true,
            newLine: false,
            color: 'white'
        }, ...params};

        if (params.pluginName) {
            message = `${this.pluginName}: ${message}`;
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
        switch(params.color) {
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
    printLogMessage(message, items) {
        console.log(
            '\n' +
            this.generateMessage(this.pluginName, {
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
    printItems(items) {
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

            console.log(this.generateMessage(
                `${tab}${name}:`,
                {...commonParams, color: 'yellow'}
            ));

            for (let item of itms) {
                console.log(this.generateMessage(
                    `${tab}${tab}${item}`,
                    {...commonParams, color: 'green'}
                ));
            }
        };

        prntItms(items.dicts, 'folders');
        prntItms(items.files, 'files');
    }
}

module.exports = RemoveFilesWebpackPlugin;
