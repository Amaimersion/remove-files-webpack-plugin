'use strict';


//#region Types

/**
 * @typedef {Object} TestObject
 * A folder for testing of files that should be removed.
 *
 * @property {string} folder
 * A path to the folder.
 *
 * @property {(filePath: string) => boolean} method
 * A method that accepts a file path (`root` + directoryPath + filePath) and
 * returns value that indicates should this file be removed or not.
 *
 * @property {boolean} recursive
 * Apply this method to files in subdirectories.
 */

/**
 * @typedef {Object} RemovingParameters
 * A parameters of removing.
 *
 * @property {string} root
 * A root directory.
 * Not absolute paths will be appended to this.
 * Defaults to `.` (where `package.json` and `node_modules` are located).
 *
 * @property {string[]} include
 * A folders or files for removing.
 * Defaults to `[]`.
 *
 * @property {string[]} exclude
 * A files for excluding.
 * Defaults to `[]`.
 *
 * @property {TestObject[]} test
 * A folders for testing.
 * Defaults to `[]`.
 *
 * @property {boolean} trash
 * Move folders or files to trash (recycle bin)
 * instead of permanent deleting.
 * Defaults to `true`.
 *
 * @property {boolean} log
 * Print messages of "info" level
 * (example: "Which folders or files have been removed").
 * Defaults to `true`.
 *
 * @property {boolean} logWarning
 * Print messages of "warning" level
 * (example: "An items for removing not found").
 * Defaults to `true`.
 *
 * @property {boolean} logError
 * Print messages of "error" level
 * (example: "No such file or directory").
 * Defaults to `false`.
 *
 * @property {boolean} logDebug
 * Print messages of "debug" level
 * (used for debugging).
 * Defaults to `false`.
 *
 * @property {boolean} emulate
 * Emulate remove process.
 * Print which folders or files will be removed without actually removing them.
 * Ignores `log` parameter.
 * Defaults to `false`.
 *
 * @property {boolean} allowRootAndOutside
 * Allow removing of the `root` directory or outside the `root` directory.
 * It's kind of safe mode.
 * Don't turn it on if you don't know what you actually do!
 * Defaults to `false`.
 */

/**
 * @typedef {Object} PluginParameters
 * A parameters for plugin.
 *
 * @property {RemovingParameters} before
 * Removing before compilation.
 *
 * @property {RemovingParameters} after
 * Removing after compilation.
 */

/**
 * @typedef {Object} Compiler
 * Webpack environment.
 */

/**
 * @typedef {Object} Compilation
 * Webpack environment.
 */

//#endregion


const os = require('os');
const fs = require('fs');
const path = require('path');
const trash = require('trash');
const Items = require('./items');
const Utils = require('./utils');
const Logger = require('./logger');
const Info = require('./info');


/**
 * A plugin for webpack that removes files and
 * folders before and after compilation.
 */
class Plugin {
    /**
     * Creates an instance of `Plugin`.
     *
     * @param {PluginParameters} params
     * A plugin parameters.
     * Contains two keys: `before` (compilation) and `after` (compilation).
     * At least one should be presented.
     * All properties are the same for these two keys.
     */
    constructor(params) {
        params = params || {};

        if (!params.before && !params.after) {
            throw new Error(
                'No "before" or "after" parameters specified. ' +
                'See https://github.com/Amaimersion/remove-files-webpack-plugin#parameters'
            );
        }

        this.loggerError = new Logger.ErrorLogger();
        this.loggerWarning = new Logger.WarningLogger();
        this.loggerInfo = new Logger.InfoLogger();
        this.loggerDebug = new Logger.DebugLogger();

        /** @type {RemovingParameters} */
        const defaultParams = {
            root: path.resolve('.'),
            include: [],
            exclude: [],
            test: [],
            trash: true,
            log: true,
            logWarning: true,
            logError: false,
            logDebug: false,
            emulate: false,
            allowRootAndOutside: false
        };

        /** @type {RemovingParameters} */
        this.beforeParams = {
            ...defaultParams,
            ...params.before
        };

        /** @type {RemovingParameters} */
        this.afterParams = {
            ...defaultParams,
            ...params.after
        };
    }

    /**
     * "This method is called once by the webpack
     * compiler while installing the plugin.".
     *
     * @param {Compiler} main
     * "Represents the fully configured webpack environment.".
     *
     * @throws
     * Throws an error if webpack is not able to register the plugin.
     */
    apply(cmplr) {
        this.loggerDebug.add('"apply" method is called');
        this.loggerDebug.add(`platform – "${os.platform()}"`);
        this.loggerDebug.add(`type – "${os.type()}"`);
        this.loggerDebug.add(`release – "${os.release()}"`);
        this.loggerDebug.add(`node – "${process.version}"`);
        this.loggerDebug.add(`cwd – "${process.cwd()}"`);

        /**
         * webpack 4+ comes with a new plugin system.
         * Checking for hooks in order to support old plugin system.
         */
        const applyHook = (compiler, v4Hook, v3Hook, params, method) => {
            if (!params || !Object.keys(params).length) {
                this.loggerDebug.add('Skipped registering because "params" is empty');

                return;
            }

            if (compiler.hooks) {
                compiler.hooks[v4Hook].tapAsync(Info.fullName, method);
                this.loggerDebug.add(`v4 hook registered – "${v4Hook}"`);
            } else if (compiler.plugin) {
                compiler.plugin(v3Hook, method);
                this.loggerDebug.add(`v3 hook registered – "${v3Hook}"`);
            } else {
                throw new Error('webpack is not able to register the plugin');
            }
        };

        applyHook(cmplr, 'beforeRun', 'before-run', this.beforeParams, (compiler, callback) => {
            this.loggerDebug.add('Hook started – "beforeRun"');
            this.handleHook(this.beforeParams, callback);
            this.loggerDebug.add('Hook ended – "beforeRun"');
            this.log(compiler, this.beforeParams);
        });
        applyHook(cmplr, 'watchRun', 'watch-run', this.beforeParams, (compiler, callback) => {
            this.loggerDebug.add('Hook started – "watchRun"');
            this.handleHook(this.beforeParams, callback);
            this.loggerDebug.add('Hook ended – "watchRun"');
            this.log(compiler, this.beforeParams);
        });
        applyHook(cmplr, 'afterEmit', 'after-emit', this.afterParams, (compilation, callback) => {
            this.loggerDebug.add('Hook started – "afterEmit"');
            this.handleHook(this.afterParams, callback);
            this.loggerDebug.add('Hook ended – "afterEmit"');
            this.log(compilation, this.afterParams);
        });
    }

    /**
     * Handles webpack hooks.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     *
     * @param {Function} callback
     * "Some compilation plugin steps are asynchronous,
     * and pass a callback function that must be invoked
     * when your plugin is finished running".
     */
    handleHook(params, callback) {
        this.handleRemove(params);
        callback();
    }

    /**
     * Synchronously removes folders or files.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    handleRemove(params) {
        if (
            !params.include.length &&
            !params.test.length
        ) {
            return;
        }

        const items = this.getItemsForRemoving(params);

        if (
            !Object.keys(items.directories).length &&
            !Object.keys(items.files).length
        ) {
            const message = (
                'An items for ' +
                `${params.trash ? 'removing in trash' : 'permanent removing'}` +
                ' not found'
            );

            this.loggerDebug.add(message);
            this.loggerWarning.add(message);

            return;
        }

        if (params.emulate) {
            const message = (
                'Following items will be ' +
                `${params.trash ? 'removed in trash' : 'permanently removed'}` +
                ' in case of not emulation:'
            );

            this.loggerInfo.add(message, items);

            return;
        }

        for (const file of items.files) {
            try {
                this.unlinkFileSync(file, params.trash);
            } catch (error) {
                this.loggerDebug.add(error.message || error);
                this.loggerError.add(error.message || error);
            }
        }

        for (const dir of items.directories) {
            try {
                this.unlinkFolderSync(dir, params.trash);
            } catch (error) {
                this.loggerDebug.add(error.message || error);
                this.loggerError.add(error.message || error);
            }
        }

        // trim root for pretty printing.
        if (!params.allowRootAndOutside) {
            items.trimRoot(params.root);
        }

        const message = (
            'Following items have been ' +
            `${params.trash ? 'removed in trash' : 'permanently removed'}` +
            ':'
        );

        this.loggerInfo.add(message, items);
    }

    /**
     * Returns sorted folders and files for removing.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    getItemsForRemoving(params) {
        const items = new Items();

        params.include = this.toAbsolutePaths(params.root, params.include);
        params.exclude = this.toAbsolutePaths(params.root, params.exclude);

        // handle unexplicit files or folders, and add it to explicit.
        params.include = params.include.concat(
            this.handleTest(params)
        );

        // handle explicit files or folders.
        for (const item of params.include) {
            if (params.exclude.includes(item)) {
                this.loggerDebug.add(
                    `Skipped, because item excluded – "${item}"`
                );

                continue;
            }

            if (!fs.existsSync(item)) {
                const message = `Skipped, because not exists – "${item}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);

                continue;
            }

            if (
                !params.allowRootAndOutside &&
                !this.isSave(params.root, item)
            ) {
                const message = `Skipped, because unsafe removing – "${item}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);

                continue;
            }

            const stat = this.getStatSync(item);
            let group = undefined;

            if (!stat) {
                this.loggerDebug.add(
                    `Cannot get stat – "${item}"`
                );

                continue;
            } else if (stat.isFile()) {
                group = 'files';
                this.loggerDebug.add(
                    `It is file – "${item}"`
                );
            } else if (stat.isDirectory()) {
                group = 'directories';
                this.loggerDebug.add(
                    `It is directory – "${item}"`
                );
            } else {
                const message = `Skipped, because invalid stat – "${item}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);

                continue;
            }

            if (items[group].includes(item)) {
                continue;
            }

            items[group].push(item);
        }

        this.loggerDebug.add(
            `Directories before cropping – ${items.directories}`
        );
        this.loggerDebug.add(
            `Files before cropping – ${items.files}`
        );

        items.cropUnnecessaryItems();

        this.loggerDebug.add(
            `Directories after cropping – ${items.directories}`
        );
        this.loggerDebug.add(
            `Files after cropping – ${items.files}`
        );

        return items;
    }

    /**
     * Performs a testing of files or folders for removing.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     *
     * @returns {string[]}
     * An array of absolute paths of folders or
     * files that should be removed.
     */
    handleTest(params) {
        /** @type {string[]} */
        const paths = [];

        if (!params.test || !params.test.length) {
            this.loggerDebug.add(
                'Testing skipped, because params.test is empty'
            );

            return paths;
        }

        for (const test of params.test) {
            test.folder = this.toAbsolutePath(
                params.root,
                test.folder
            );

            if (!fs.existsSync(test.folder)) {
                const message = `Skipped, because not exists – "${test.folder}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);

                continue;
            }

            if (
                !params.allowRootAndOutside &&
                !this.isSave(params.root, test.folder)
            ) {
                const message = `Skipped, because unsafe removing – "${test.folder}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);

                continue;
            }

            const itemStat = this.getStatSync(test.folder);

            if (!itemStat) {
                this.loggerDebug.add(
                    `Cannot get stat for ${test.folder}`
                );

                continue;
            } else if (!itemStat.isDirectory()) {
                const message = `Skipped, because test folder not a directory – "${test.folder}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);

                continue;
            }

            /**
             * @param {string} dirPath
             */
            const getFilesRecursiveSync = (dirPath) => {
                /** @type {string[]} */
                let files = [];

                try {
                    files = fs.readdirSync(dirPath);
                } catch (error) {
                    this.loggerDebug.add(error.message || error);
                    this.loggerError.add(error.message || error);

                    return;
                }

                for (let file of files) {
                    file = path.join(dirPath, file);
                    const stat = this.getStatSync(file);

                    if (!stat) {
                        this.loggerDebug.add(
                            `Cannot get stat – "${file}"`
                        );

                        continue;
                    } else if (stat.isFile()) {
                        const passed = test.method(file);

                        if (passed) {
                            paths.push(file);
                            this.loggerDebug.add(
                                `Test passed, added for removing – "${file}"`
                            );
                        } else {
                            this.loggerDebug.add(
                                `Test not passed – "${file}"`
                            );
                        }
                    } else if (stat.isDirectory() && test.recursive) {
                        getFilesRecursiveSync(file);
                    } else if (!stat.isDirectory() && !stat.isFile()) {
                        const message = `Skipped, because invalid stat – "${file}"`;

                        this.loggerDebug.add(message);
                        this.loggerWarning.add(message);
                    }
                }
            };

            getFilesRecursiveSync(test.folder);
        }

        return paths;
    }

    /**
     * Removes a file.
     *
     * @param {string} filePath
     * An absolute path to the file.
     *
     * @param {boolean} inTrash
     * Move item to trash.
     */
    unlinkFileSync(filePath, inTrash) {
        if (!fs.existsSync(filePath)) {
            this.loggerDebug.add(
                `Skipped, because file doesn't exists – "${filePath}"`
            );

            return;
        }

        if (inTrash) {
            trash(filePath).catch((error) => {
                this.loggerError.add(error.message || error);
                this.loggerDebug.add(error.message || error);
            });

            return;
        }

        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            this.loggerError.add(error.message || error);
            this.loggerDebug.add(error.message || error);
        }
    }

    /**
     * Removes a folder.
     *
     * @param {string} folderPath
     * An absolute path to the folder.
     *
     * @param {boolean} inTrash
     * Move item to trash.
     */
    unlinkFolderSync(folderPath, inTrash) {
        if (!fs.existsSync(folderPath)) {
            this.loggerDebug.add(
                `Skipped, because folder doesn't exists – "${folderPath}"`
            );

            return;
        }

        if (inTrash) {
            trash(folderPath).catch((error) => {
                this.loggerError.add(error.message || error);
                this.loggerDebug.add(error.message || error);
            });

            return;
        }

        let files = fs.readdirSync(folderPath);
        files = this.toAbsolutePaths(folderPath, files);

        for (const file of files) {
            const stat = this.getStatSync(file);

            if (!stat) {
                this.loggerDebug.add(
                    `Cannot get stat – "${file}"`
                );

                continue;
            } else if (stat.isFile()) {
                try {
                    this.unlinkFileSync(file, false);
                    this.loggerDebug.add(
                        `File removed – "${file}"`
                    );
                } catch (error) {
                    this.loggerDebug.add(error.message || error);
                    this.loggerError.add(error.message || error);
                }
            } else if (stat.isDirectory()) {
                this.unlinkFolderSync(file, false);
            } else {
                const message = `Skipped, because invalid stat – "${file}"`;

                this.loggerDebug.add(message);
                this.loggerWarning.add(message);
            }
        }

        try {
            fs.rmdirSync(folderPath);
            this.loggerDebug.add(
                `Folder removed – "${folderPath}"`
            );
        } catch (error) {
            this.loggerDebug.add(error.message || error);
            this.loggerError.add(error.message || error);
        }
    }

    /**
     * Gets a stat for an item.
     *
     * @param {string} pth
     * An absolute path to the folder or file.
     *
     * @returns {fs.Stats}
     * An item stat or `undefined` if cannot get.
     *
     * @see https://nodejs.org/api/fs.html#fs_fs_lstatsync_path_options
     */
    getStatSync(pth) {
        let stat = undefined;

        try {
            stat = fs.lstatSync(pth);
        } catch (error) {
            this.loggerDebug.add(error.message || error);
            this.loggerError.add(error.message || error);
        }

        return stat;
    }

    /**
     * Converts path to absolute path (based on provided root).
     *
     - single `\` (Windows) not supported, because JS uses it for escaping.
     *
     * @param {string} root
     * A root that will be appended to non absolute path.
     *
     * @param {string} pth
     * A path for converting.
     *
     * @returns {string}
     * An absolute `pth`.
     */
    toAbsolutePath(root, pth) {
        let newPath = pth;

        if (!path.isAbsolute(pth)) {
            newPath = path.join(root, pth);
            this.loggerDebug.add(
                `"${pth}" converted to "${newPath}"`
            );
        }

        return newPath;
    }

    /**
     * Converts all paths to absolute paths.
     *
     * - see `toAbsolutePath` documentation.
     *
     * @param {string} root
     * A root that will be appended to non absolute paths.
     *
     * @param {string[]} paths
     * A paths for converting.
     *
     * @returns {string[]}
     * An absolute paths.
     */
    toAbsolutePaths(root, paths) {
        const newPaths = [];

        for (const item of paths) {
            newPaths.push(this.toAbsolutePath(
                root,
                item
            ));
        }

        return newPaths;
    }

    /**
     * Checks a path for safety.
     *
     * Checking for either exit beyond the root
     * or similarity with the root.
     *
     * @param {string} root
     * A root directory.
     *
     * @param {string} pth
     * A path for checking.
     *
     * @returns {boolean}
     * `true` – save,
     * `false` – not save.
     *
     * @example
     * root = 'D:/dist'
     * pth = 'D:/dist/chromium'
     * Returns – true
     *
     * root = 'D:/dist'
     * pth = 'D:/dist'
     * Returns – false
     *
     * root = 'D:/dist'
     * pth = 'D:/'
     * Returns – false
     *
     * root = './dist'
     * pth = 'dist/scripts'
     * Returns – true
     *
     * root = '.'
     * pth = './dist/scripts'
     * Returns - true
     *
     * root = 'D:\\Desktop\\test'
     * pth = 'D:\\Desktop\\test.txt'
     * Returns - false
     *
     * root = 'D:/te)st-tes(t and te[s]t {df} df+g.df^g&t'
     * pth = 'D:/te)st-tes(t and te[s]t {df} df+g.df^g&t/chromium'
     * Returns – true
     */
    isSave(root, pth) {
        const format = (string, escape, replaceDoubleSlash) => {
            const result = {
                string: string,
                initiallyFile: false,
                continue: false
            };

            try {
                string = path.resolve(string);
            } catch (error) {
                this.loggerError.add(error.message || error);
                this.loggerDebug.add(error.message || error);

                result.continue = false;

                return result;
            }

            const stat = this.getStatSync(string);

            if (!stat) {
                this.loggerDebug.add(
                    `Cannot get stat – "${string}"`
                );

                result.continue = false;

                return result;
            }

            if (stat.isFile()) {
                result.initiallyFile = true;
                string = path.dirname(string);
            }

            // in order to keep `\\` as string in a path.
            // this should go before actual escaping.
            if (replaceDoubleSlash) {
                string = string.replace(/\\/g, '\\\\');
            }

            // we need to escape special regexp characters
            // in order to treat them as string.
            if (escape) {
                string = Utils.escape(string);
            }

            result.string = string;
            result.continue = true;

            return result;
        };

        /**
         * We should escape root because this will be pasted in RegExp.
         * We shouldn't escape pth because this will be compared as a plain string.
         */
        const rootFormat = format(root, true, true);
        const pthFormat = format(pth, false, true);

        if (
            !rootFormat.continue ||
            !pthFormat.continue
        ) {
            this.loggerDebug.add('Cannot continue');

            return false;
        }

        this.loggerDebug.add('Before formatting:');
        this.loggerDebug.add(`Root – "${root}"`);
        this.loggerDebug.add(`Path – "${pth}"`);

        root = rootFormat.string;
        pth = pthFormat.string;
        let save = false;

        if (pthFormat.initiallyFile) {
            save = new RegExp(`(^${root})`, 'm').test(pth);
        } else {
            save = new RegExp(`(^${root})(.+)`, 'm').test(pth);
        }

        this.loggerDebug.add('After formatting:');
        this.loggerDebug.add(`Root – "${root}"`);
        this.loggerDebug.add(`Path – "${pth}"`);
        this.loggerDebug.add(`Save – "${save}"`);

        return save;
    }

    /**
     * Logs logger messages in console.
     *
     * - after logging logger data will be cleared.
     *
     * @param {Compiler | Compilation} main
     * Current process.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    log(main, params) {
        /**
         * @param {boolean} enabled
         * @param {Logger.Logger} logger
         * @returns {boolean}
         */
        const willBePrinted = (enabled, logger) => (enabled && !logger.isEmpty());
        const wllBPrntd = {
            error: willBePrinted(params.logError, this.loggerError),
            warning: willBePrinted(params.logWarning, this.loggerWarning),
            info: willBePrinted(params.log, this.loggerInfo)
        };

        if (params.logError) {
            this.loggerError.log(
                main,
                true
            );
        }

        if (params.logWarning) {
            this.loggerWarning.log(
                main,
                !(wllBPrntd.error)
            );
        }

        if (params.log) {
            this.loggerInfo.log(
                main,
                !(wllBPrntd.error || wllBPrntd.warning)
            );
        }

        if (params.logDebug) {
            this.loggerDebug.log(
                main,
                !(wllBPrntd.error || wllBPrntd.warning || wllBPrntd.info)
            );
        }

        // this function will be executed later if
        // specified both `before` and `after` params.
        // so, we need to remove old data in order to
        // avoid duplicate messages.
        this.loggerError.clear();
        this.loggerWarning.clear();
        this.loggerInfo.clear();
        this.loggerDebug.clear();
    }
}


module.exports = Plugin;
