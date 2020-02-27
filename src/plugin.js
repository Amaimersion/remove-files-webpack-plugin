'use strict';


//#region Types

/**
 * @typedef {Object} TestObject
 * A folder for testing of folders and files that should be removed.
 *
 * @property {string} folder
 * A path to the folder (relative to `root`).
 *
 * @property {(absolutePath: string) => boolean} method
 * A method that accepts an item path (`root` + folderPath + fileName) and
 * returns value that indicates should this item be removed or not.
 *
 * @property {boolean} recursive
 * Apply this method to all items in subdirectories.
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
 * A folders and files for removing.
 * Defaults to `[]`.
 *
 * @property {string[]} exclude
 * A folders and files for excluding.
 * Defaults to `[]`.
 *
 * @property {TestObject[]} test
 * A folders for testing.
 * Defaults to `[]`.
 *
 * @property {(
 *  absoluteFoldersPaths: string[],
 *  absoluteFilesPaths: string[]
 * ) => boolean} beforeRemove
 * If specified, will be called before removing.
 * Absolute paths of folders and files that will be removed
 * will be passed into this function.
 * If returned value is `true`, then
 * remove process will be canceled.
 * Will be not called if `emulate` is on.
 * Defaults to `undefined`.
 *
 * @property {(
 *  absoluteFoldersPaths: string[],
 *  absoluteFilesPaths: string[]
 * ) => void} afterRemove
 * If specified, will be called after removing.
 * Absolute paths of folders and files that have been removed
 * will be passed into this function.
 * Defaults to `undefined`.
 *
 * @property {boolean} trash
 * Move folders and files to trash (recycle bin)
 * instead of permanent deleting.
 * Defaults to `false`.
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
 * Print which folders and files will be removed without actually removing them.
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
const process = require('process');
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
            trash: false,
            beforeRemove: undefined,
            afterRemove: undefined,
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
        const debugName = 'apply: ';

        this.loggerDebug.add(
            debugName +
            '"apply" method is called'
        );
        this.loggerDebug.add(
            debugName +
            `platform – "${os.platform()}"`
        );
        this.loggerDebug.add(
            debugName +
            `type – "${os.type()}"`
        );
        this.loggerDebug.add(
            debugName +
            `release – "${os.release()}"`
        );
        this.loggerDebug.add(
            debugName +
            `node – "${process.version}"`
        );
        this.loggerDebug.add(
            debugName +
            `cwd – "${process.cwd()}"`
        );
        this.loggerDebug.add(
            debugName +
            `before parameters – "${JSON.stringify(this.beforeParams)}"`
        );
        this.loggerDebug.add(
            debugName +
            `after parameters – "${JSON.stringify(this.afterParams)}"`
        );

        /**
         * webpack 4+ comes with a new plugin system.
         * Checking for hooks in order to support old plugin system.
         */
        const applyHook = (compiler, v4Hook, v3Hook, params) => {
            if (!params || !Object.keys(params).length) {
                this.loggerDebug.add(
                    debugName +
                    'skipped registering, because "params" is empty'
                );

                return;
            }

            const method = (compilerOrCompilation, callback) => {
                this.loggerDebug.add(`${debugName}hook started – "${v4Hook}"`);
                this.handleHook(params, callback);
                this.loggerDebug.add(`${debugName}hook ended – "${v4Hook}"`);
                this.log(compilerOrCompilation, params);
                this.clear(params);
            };

            if (compiler.hooks) {
                compiler.hooks[v4Hook].tapAsync(Info.fullName, method);
                this.loggerDebug.add(
                    debugName +
                    `v4 hook registered – "${v4Hook}"`
                );
            } else if (compiler.plugin) {
                compiler.plugin(v3Hook, method);
                this.loggerDebug.add(
                    debugName +
                    `v3 hook registered – "${v3Hook}"`
                );
            } else {
                throw new Error('webpack is not able to register the plugin');
            }
        };

        applyHook(cmplr, 'beforeRun', 'before-run', this.beforeParams);
        applyHook(cmplr, 'watchRun', 'watch-run', this.beforeParams);
        applyHook(cmplr, 'afterEmit', 'after-emit', this.afterParams);
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
        const debugName = 'handle-hook: ';

        this.path.type = params._pathType;

        this.loggerDebug.add(
            debugName +
            `path – "${this.path.type || 'auto'}"`
        );
        this.handleRemove(params);

        callback();
    }

    /**
     * Removes folders or files.
     *
     * - if `trash` is on, then it will be async removing.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    handleRemove(params) {
        const debugName = 'handle-remove: ';

        if (
            !params.include.length &&
            !params.test.length
        ) {
            /**
             * I think we shouldn't add warning message in warning
             * logger, because this can be intended behavior.
             */

            this.loggerDebug.add(
                debugName +
                'include and test is empty'
            );

            return;
        }

        /**
         * After that call values of `params` properties will be changed.
         * It is bad pattern, but intended behavior.
         */
        const items = this.getItemsForRemoving(params);
        const enablePrettyPrinting = () => {
            items.sort();

            if (params.allowRootAndOutside) {
                return;
            }

            let root = params.root;

            // we removed only relative items, so,
            // we don't want print absolute paths.
            if (!root.endsWith(this.path.path.sep)) {
                root += this.path.path.sep;
            }

            items.removeRoot(root);
        };

        if (
            !Object.keys(items.directories).length &&
            !Object.keys(items.files).length
        ) {
            const message = (
                'An items for ' +
                `${params.trash ? 'removing in trash' : 'permanent removing'}` +
                ' not found'
            );

            this.loggerDebug.add(`${debugName}${message}`);
            this.loggerWarning.add(message);

            return;
        }

        if (params.emulate) {
            const message = (
                'Following items will be ' +
                `${params.trash ? 'removed in trash' : 'permanently removed'}` +
                ' in case of not emulation:'
            );

            enablePrettyPrinting();
            this.loggerInfo.add(message, items);

            return;
        }

        if (params.beforeRemove) {
            this.loggerDebug.add(
                debugName +
                'user beforeRemove is called'
            );

            const shouldStop = params.beforeRemove(
                items.directories,
                items.files
            );

            if (shouldStop) {
                const message = 'Stopped by user';

                this.loggerDebug.add(`${debugName}${message}`);
                this.loggerInfo.add(message);

                return;
            }
        }

        for (const file of items.files) {
            try {
                this.unlinkFileSync(file, params.trash);
            } catch (error) {
                const message = error.message || error;

                this.loggerDebug.add(`${debugName}${message}`);
                this.loggerError.add(message);
            }
        }

        for (const directory of items.directories) {
            try {
                this.unlinkFolderSync(directory, params.trash);
            } catch (error) {
                const message = error.message || error;

                this.loggerDebug.add(`${debugName}${message}`);
                this.loggerError.add(message);
            }
        }

        if (params.afterRemove) {
            this.loggerDebug.add(
                debugName +
                'user afterRemove is called'
            );

            params.afterRemove(
                items.directories,
                items.files
            );
        }

        enablePrettyPrinting();

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
     *
     * @returns {Items}
     * An items for removing.
     */
    getItemsForRemoving(params) {
        const debugName = 'get-items-for-removing: ';
        const handleRoot = (root) => {
            this.loggerDebug.add(
                debugName +
                `root before handling – "${root}"`
            );

            root = this.path.path.resolve(root);

            this.loggerDebug.add(
                debugName +
                `root after handling – "${root}"`
            );

            return root;
        };
        const normalize = (items, name) => {
            this.loggerDebug.add(
                debugName +
                `${name} before handling – [${items}]`
            );

            items = items.map((pth) => this.path.path.normalize(pth));
            items = this.path.toAbsoluteS(
                params.root,
                items
            );

            this.loggerDebug.add(
                debugName +
                `${name} after handling – [${items}]`
            );

            return items;
        };
        const checkExistence = (items, name) => {
            this.loggerDebug.add(
                debugName +
                `${name} before existence check – [${items}]`
            );

            items = items.filter((pth) => {
                const exists = this.fs.fs.existsSync(pth);

                if (!exists) {
                    const message = `Skipped, because not exists – "${pth}"`;

                    this.loggerWarning.add(message);
                    this.loggerDebug.add(`${debugName}${message}`);
                }

                return exists;
            });

            this.loggerDebug.add(
                debugName +
                `${name} after existence check – [${items}]`
            );

            return items;
        };
        const handleTest = (items, name) => {
            this.loggerDebug.add(
                debugName +
                `${name} before testing – [${items}]`
            );

            items = items.concat(
                this.handleTest(params)
            );

            this.loggerDebug.add(
                debugName +
                `${name} after testing – [${items}]`
            );

            return items;
        };
        const filter = (include, exclude, name) => {
            this.loggerDebug.add(
                debugName +
                `${name} before filtering – [${include}]`
            );

            include = include.filter((includeItem, index) => {
                // duplicates check.
                if (include.indexOf(includeItem) !== index) {
                    this.loggerDebug.add(
                        debugName +
                        `duplicate – "${includeItem}"`
                    );

                    return false;
                }

                if (exclude.includes(includeItem)) {
                    this.loggerDebug.add(
                        debugName +
                        `explicitly excluded – "${includeItem}"`
                    );

                    return false;
                }

                // for cases like `include: ['/test']; exclude: ['/test/test']`.
                // i.e., we trying to delete "root" of excluded item.
                const keepRootInExcluded = !(exclude.every((excludeItem) => {
                    const save = this.path.isSave(includeItem, excludeItem);

                    if (save) {
                        this.loggerDebug.add(
                            debugName +
                            `unexplicitly excluded – "${includeItem}" because of – "${excludeItem}"`
                        );
                    }

                    return !save;
                }));

                if (keepRootInExcluded) {
                    return false;
                }

                if (
                    !params.allowRootAndOutside &&
                    !this.isSave(params.root, includeItem)
                ) {
                    const message = `Skipped, because unsafe removing – "${includeItem}"`;

                    this.loggerDebug.add(`${debugName}${message}`);
                    this.loggerWarning.add(message);

                    return false;
                }

                return true;
            });

            this.loggerDebug.add(
                debugName +
                `${name} after filtering – [${include}]`
            );

            return include;
        };

        // order is matter.
        params.root = handleRoot(params.root);
        params.include = normalize(params.include, 'include');
        params.exclude = normalize(params.exclude, 'exclude');
        params.include = checkExistence(params.include, 'include');
        params.exclude = checkExistence(params.exclude, 'exclude');
        params.include = handleTest(params.include, 'include');
        params.include = filter(params.include, params.exclude, 'include');

        const items = new Items();

        for (const item of params.include) {
            /** @type {'files' | 'directories'} */
            let group = undefined;
            const stat = this.fs.getStatSync(item);

            if (!stat) {
                this.loggerDebug.add(
                    debugName +
                    `skipped, because cannot get stat – "${item}"`
                );

                continue;
            } else if (stat.isFile()) {
                group = 'files';
            } else if (stat.isDirectory()) {
                group = 'directories';
            } else {
                const message = `Skipped, because invalid stat – "${item}"`;

                this.loggerDebug.add(`${debugName}${message}`);
                this.loggerWarning.add(message);

                continue;
            }

            items[group].push(item);
        }

        this.loggerDebug.add(
            debugName +
            `directories before cropping – ${items.directories}`
        );
        this.loggerDebug.add(
            debugName +
            `files before cropping – ${items.files}`
        );

        items.removeUnnecessary();

        this.loggerDebug.add(
            debugName +
            `directories after cropping – ${items.directories}`
        );
        this.loggerDebug.add(
            debugName +
            `files after cropping – ${items.files}`
        );

        return items;
    }

    /**
     * Performs a testing of files and folders for removing.
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     *
     * @returns {string[]}
     * An array of absolute paths of folders and
     * files that should be removed.
     */
    handleTest(params) {
        /** @type {string[]} */
        let paths = [];
        const debugName = 'handle-test: ';

        if (
            !params.test ||
            !params.test.length
        ) {
            this.loggerDebug.add(
                debugName +
                'testing skipped, because params.test is empty'
            );

            return paths;
        }

        params.root = this.path.path.resolve(params.root);

        for (const test of params.test) {
            test.folder = this.path.path.normalize(test.folder);
            test.folder = this.path.toAbsolute(
                params.root,
                test.folder,
                (oldPath, newPath) => {
                    this.loggerDebug.add(
                        debugName +
                        `"${oldPath}" converted to "${newPath}"`
                    );
                }
            );

            if (!this.fs.fs.existsSync(test.folder)) {
                const message = `Skipped, because not exists – "${test.folder}"`;

                this.loggerDebug.add(`${debugName}${message}`);
                this.loggerWarning.add(message);

                continue;
            }

            const itemStat = this.fs.getStatSync(test.folder);

            if (!itemStat) {
                this.loggerDebug.add(
                    debugName +
                    `skipped, because cannot get stat – "${test.folder}"`
                );

                continue;
            } else if (!itemStat.isDirectory()) {
                const message = `Skipped, because test folder not a directory – "${test.folder}"`;

                this.loggerDebug.add(`${debugName}${message}`);
                this.loggerWarning.add(message);

                continue;
            }

            paths = paths.concat(
                this.fs.getItemsSync({
                    pth: test.folder,
                    join: this.path.path.join,
                    recursive: test.recursive,
                    test: (absolutePath) => {
                        if (
                            !params.allowRootAndOutside &&
                            !this.isSave(params.root, absolutePath)
                        ) {
                            const message = `Skipped, because unsafe removing – "${absolutePath}"`;

                            this.loggerDebug.add(`${debugName}${message}`);
                            this.loggerWarning.add(message);

                            return false;
                        }

                        return test.method(absolutePath);
                    },
                    onTestSuccess: (file) => {
                        this.loggerDebug.add(
                            debugName +
                            `test passed, added for removing – "${file}"`
                        );
                    },
                    onTestFail: (file) => {
                        this.loggerDebug.add(
                            debugName +
                            `test not passed, skipped – "${file}"`
                        );
                    },
                    onItemError: (errorMessage) => {
                        this.loggerDebug.add(`${debugName}${errorMessage}`);
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
     * - if `toTrash` is on, then it will be async removing.
     *
     * @param {string} absoluteFilePath
     * An absolute path to the file.
     *
     * @param {boolean} toTrash
     * Move item to trash.
     */
    unlinkFileSync(absoluteFilePath, toTrash) {
        const debugName = 'unlink-file-sync: ';

        this.fs.unlinkFileSync({
            pth: absoluteFilePath,
            toTrash: toTrash,
            rightTrashCallbacks: false,
            onSuccess: (pth) => {
                this.loggerDebug.add(
                    debugName +
                    'File' +
                    `${toTrash ? '' : ' permanently'}` +
                    ' removed' +
                    `${toTrash ? ' to trash' : ''}` +
                    ` – ${pth}`
                );
            },
            onError: (errorMessage) => {
                this.loggerError.add(errorMessage);
                this.loggerDebug.add(`${debugName}${errorMessage}`);
            }
        });
    }

    /**
     * Removes a folder.
     *
     * - if `toTrash` is on, then it will be async removing.
     *
     * @param {string} absoluteFolderPath
     * An absolute path to the folder.
     *
     * @param {boolean} toTrash
     * Move item to trash.
     */
    unlinkFolderSync(absoluteFolderPath, toTrash) {
        const debugName = 'unlink-folder-sync: ';

        this.fs.unlinkFolderSync({
            pth: absoluteFolderPath,
            toTrash: toTrash,
            rightTrashCallbacks: false,
            toAbsoluteS: (root, files) => this.path.toAbsoluteS(
                root,
                files,
                (oldPath, newPath) => {
                    this.loggerDebug.add(
                        debugName +
                        `"${oldPath}" converted to "${newPath}"`
                    );
                }
            ),
            onFileSuccess: (pth) => {
                this.loggerDebug.add(
                    debugName +
                    'File' +
                    `${toTrash ? '' : ' permanently'}` +
                    ' removed' +
                    `${toTrash ? ' to trash' : ''}` +
                    ` – ${pth}`
                );
            },
            onFileError: (errorMessage) => {
                this.loggerError.add(errorMessage);
                this.loggerDebug.add(`${debugName}${errorMessage}`);
            },
            onFolderSuccess: (pth) => {
                this.loggerDebug.add(
                    debugName +
                    'Folder' +
                    `${toTrash ? '' : ' permanently'}` +
                    ' removed' +
                    `${toTrash ? ' to trash' : ''}` +
                    ` – ${pth}`
                );
            },
            onFolderError: (errorMessage) => {
                this.loggerError.add(errorMessage);
                this.loggerDebug.add(`${debugName}${errorMessage}`);
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
        const debugName = 'is-save: ';

        this.loggerDebug.add(
            debugName +
            `root – "${root}"`
        );
        this.loggerDebug.add(
            debugName +
            `path – "${pth}"`
        );

        let save = false;

        try {
            save = this.path.isSave(
                root,
                pth,
                (comparedRoot, comparedPth) => {
                    this.loggerDebug.add(
                        debugName +
                        `compared root – "${comparedRoot}"`
                    );
                    this.loggerDebug.add(
                        debugName +
                        `compared path – "${comparedPth}"`
                    );
                }
            );
        } catch (error) {
            const message = error.message || error;

            this.loggerDebug.add(`${debugName}${message}`);
            this.loggerError.add(message);

            return save;
        }

        this.loggerDebug.add(
            debugName +
            `save – "${save}"`
        );

        return save;
    }

    /**
     * Logs logger messages in console.
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
    }

    /**
     * Clears collected data (include, exclude, loggers, etc.).
     *
     * - it is needed because same instance of plugin
     * can be executed several times (if specified both `before`
     * and `after` params, or if in watch mode).
     *
     * @param {RemovingParameters} params
     * A parameters of removing.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    clear(params) {
        params.include = [];
        params.exclude = [];

        this.loggerError.clear();
        this.loggerWarning.clear();
        this.loggerInfo.clear();
        this.loggerDebug.clear();
    }
}


module.exports = Plugin;
