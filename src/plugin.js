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
 *
 * @property {PathType} _pathType
 * Type of `path` module.
 * Defaults to `''` (will be selected based on OS).
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
const Fs = require('./fs');
const Path = require('./path');
const Items = require('./items');
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

        this.fs = new Fs();
        this.path = new Path();
        this.loggerError = new Logger.ErrorLogger();
        this.loggerWarning = new Logger.WarningLogger();
        this.loggerInfo = new Logger.InfoLogger();
        this.loggerDebug = new Logger.DebugLogger();

        /** @type {RemovingParameters} */
        const defaultParams = {
            root: this.path.path.resolve('.'),
            include: [],
            exclude: [],
            test: [],
            trash: true,
            log: true,
            logWarning: true,
            logError: false,
            logDebug: false,
            emulate: false,
            allowRootAndOutside: false,
            _pathType: ''
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
        this.loggerDebug.add(`path - "${params._pathType || 'auto'}"`);

        this.path.type = params._pathType;
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

        params.include = this.path.toAbsoluteS(
            params.root,
            params.include,
            (oldPath, newPath) => {
                this.loggerDebug.add(
                    `include: "${oldPath}" converted to "${newPath}"`
                );
            }
        );
        params.exclude = this.path.toAbsoluteS(
            params.root,
            params.exclude,
            (oldPath, newPath) => {
                this.loggerDebug.add(
                    `exclude: "${oldPath}" converted to "${newPath}"`
                );
            }
        );

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

            if (!this.fs.fs.existsSync(item)) {
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

            const stat = this.fs.getStatSync(item);
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
        let paths = [];

        if (!params.test || !params.test.length) {
            this.loggerDebug.add(
                'Testing skipped, because params.test is empty'
            );

            return paths;
        }

        for (const test of params.test) {
            test.folder = this.path.toAbsolute(
                params.root,
                test.folder,
                (oldPath, newPath) => {
                    this.loggerDebug.add(
                        `test: "${oldPath}" converted to "${newPath}"`
                    );
                }
            );

            if (!this.fs.fs.existsSync(test.folder)) {
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

            const itemStat = this.fs.getStatSync(test.folder);

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

            paths = paths.concat(
                this.fs.getFilesSync({
                    pth: test.folder,
                    join: this.path.path.join,
                    recursive: test.recursive,
                    test: test.method,
                    onTestSuccess: (file) => {
                        this.loggerDebug.add(
                            `Test passed, added for removing – "${file}"`
                        );
                    },
                    onTestFail: (file) => {
                        this.loggerDebug.add(
                            `Test not passed, skipped – "${file}"`
                        );
                    },
                    onError: (errorMessage) => {
                        this.loggerDebug.add(errorMessage);
                        this.loggerError.add(errorMessage);
                    }
                })
            );
        }

        return paths;
    }

    /**
     * Removes a file.
     *
     * @param {string} filePath
     * An absolute path to the file.
     *
     * @param {boolean} toTrash
     * Move item to trash.
     */
    unlinkFileSync(filePath, toTrash) {
        this.fs.unlinkFileSync({
            pth: filePath,
            toTrash: toTrash,
            onSuccess: (pth) => {
                this.loggerDebug.add(
                    'file: File' +
                    `${toTrash ? '' : ' permanently'}` +
                    ' removed' +
                    `${toTrash ? ' to trash' : ''}` +
                    ` – ${pth}`
                );
            },
            onError: (errorMessage) => {
                this.loggerError.add(errorMessage);
                this.loggerDebug.add(errorMessage);
            }
        });
    }

    /**
     * Removes a folder.
     *
     * @param {string} folderPath
     * An absolute path to the folder.
     *
     * @param {boolean} toTrash
     * Move item to trash.
     */
    unlinkFolderSync(folderPath, toTrash) {
        this.fs.unlinkFolderSync({
            pth: folderPath,
            toTrash: toTrash,
            toAbsoluteS: (root, files) => this.path.toAbsoluteS(
                root,
                files,
                (oldPath, newPath) => {
                    this.loggerDebug.add(
                        `folder: "${oldPath}" converted to "${newPath}"`
                    );
                }
            ),
            onFileSuccess: (pth) => {
                this.loggerDebug.add(
                    'folder: File' +
                    `${toTrash ? '' : ' permanently'}` +
                    ' removed' +
                    `${toTrash ? ' to trash' : ''}` +
                    ` – ${pth}`
                );
            },
            onFileError: (errorMessage) => {
                this.loggerError.add(errorMessage);
                this.loggerDebug.add(errorMessage);
            },
            onFolderSuccess: (pth) => {
                this.loggerDebug.add(
                    'folder: Folder' +
                    `${toTrash ? '' : ' permanently'}` +
                    ' removed' +
                    `${toTrash ? ' to trash' : ''}` +
                    ` – ${pth}`
                );
            },
            onFolderError: (errorMessage) => {
                this.loggerError.add(errorMessage);
                this.loggerDebug.add(errorMessage);
            }
        });
    }

    /**
     * Checks a path for safety.
     *
     * - checks for either exit beyond the root
     * or identicality with the root.
     * - see `Path.isSave()` documentation for more.
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
    */
    isSave(root, pth) {
        this.loggerDebug.add('Started checking for safety');
        this.loggerDebug.add(`Root – "${root}"`);
        this.loggerDebug.add(`Path – "${pth}"`);

        let save = false;

        try {
            save = this.path.isSave(
                root,
                pth,
                (comparedRoot, comparedPth) => {
                    this.loggerDebug.add(`Compared root – "${comparedRoot}"`);
                    this.loggerDebug.add(`Compared path – "${comparedPth}"`);
                }
            );
        } catch (error) {
            this.loggerDebug.add(error.message || error);
            this.loggerError.add(error.message || error);

            return save;
        }

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
