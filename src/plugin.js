'use strict';


/**
 * @typedef {Object} TestObject
 * A folder for custom testing of files that should be removed.
 * 
 * @property {String} folder
 * A path to the folder.
 * 
 * @property {(filePath: String) => Boolean} method
 * A method that accepts an absolute file path and must return 
 * boolean value that indicates should be removed that file or not.
 * 
 * @property {Boolean} recursive
 * Should the method be applied to files in subdirectories.
 */

/**
 * @typedef {Object} RemoveParameters
 * A parameters for removing.
 * 
 * @property {String} root
 * A root directory.
 * Not absolute paths will be appended to this.
 * Defaults to `.` (from which directory is called).
 * 
 * @property {Array<String>} include
 * A folders or files for removing.
 * Defaults to `[]`.
 * 
 * @property {Array<String>} exclude
 * A files for excluding.
 * Defaults to `[]`.
 * 
 * @property {Array<TestObject>} test
 * A folders for custom testing.
 * Defaults to `[]`.
 * 
 * @property {Boolean} log
 * Print which folders or files has been removed.
 * Defaults to `true`.
 * 
 * @property {Boolean} emulate
 * Emulate remove process.
 * Print which folders or files will be removed without actually removing them.
 * Ignores `params.log`.
 * Defaults to `false`.
 * 
 * @property {Boolean} allowRootAndOutside
 * Allow remove of a `root` directory or outside the `root` directory.
 * It's kinda safe mode.
 * Don't turn it on, if you don't know what you actually do!
 * Defaults to `false`.
 */

/**
 * @typedef {Object} PluginParameters
 * A parameters for plugin.
 * 
 * @property {RemoveParameters} before
 * Removing before compilation.
 * 
 * @property {RemoveParameters} after
 * Removing after compilation.
 */


const fs = require('fs');
const path = require('path');
const Items = require('./items');
const Utils = require('./utils');
const Terminal = require('./terminal');
const Info = require('./info');


/**
 * A plugin for webpack which removes files and folders before and after compilation.
 */
class Plugin {
    /**
     * Creates an instance of `Plugin`.
     * 
     * @param {PluginParameters} params
     * A parameters for plugin.
     * Contains two keys: `before` (compilation) and `after` (compilation).
     * At least one should be presented.
     * All properties are the same for these two keys.
     */
    constructor(params) {
        params = params || {};

        if (!params.before && !params.after) {
            throw new Error(
                `No "before" or "after" parameters specified. ` +
                'See https://github.com/Amaimersion/remove-files-webpack-plugin#parameters'
            );
        }

        /** @type {RemoveParameters} */
        const defaultParams = {
            root: path.resolve('.'),
            include: [],
            exclude: [],
            test: [],
            log: true,
            emulate: false,
            allowRootAndOutside: false
        };

        this.warnings = [];
        this.errors = [];

        /** @type {RemoveParameters} */
        this.beforeParams = {
            ...defaultParams,
            ...params.before
        };
        /** @type {RemoveParameters} */
        this.afterParams = {
            ...defaultParams,
            ...params.after
        };
    }

    /**
     * "This method is called once by the webpack 
     * compiler while installing the plugin.".
     *
     * @param {Object} compiler
     * "Represents the fully configured webpack environment.".
     */
    apply(compiler) {
        /**
         * webpack 4+ comes with a new plugin system.
         * Check for hooks in order to support old plugin system.
         */
        const applyHook = (compiler, v4Hook, v3Hook, params, method) => {
            if (!params || !Object.keys(params).length) {
                return;
            }

            if (compiler.hooks) {
                compiler.hooks[v4Hook].tapAsync(Info.fullName, method);
            } else {
                compiler.plugin(v3Hook, method);
            }
        };

        applyHook(compiler, 'beforeRun', 'before-run', this.beforeParams, (compiler, callback) => {
            this.handleHook(compiler, callback, this.beforeParams);
        });
        applyHook(compiler, 'afterEmit', 'after-emit', this.afterParams, (compilation, callback) => {
            this.handleHook(compilation, callback, this.afterParams);
        });
    }

    /**
     * Handles `beforeRun` and `afterEmit` hooks.
     *
     * @param {Object} main
     * Can be `compiler` or `compilation` object.
     *
     * @param {Function} callback
     * "Some compilation plugin steps are asynchronous,
     * and pass a callback function that must be invoked
     * when your plugin is finished running.".
     *
     * @param {RemoveParameters} params
     * A parameters for remove.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    handleHook(main, callback, params) {
        this.handleRemove(params);

        Terminal.printMessages(main, this.warnings, 'warnings');
        Terminal.printMessages(main, this.errors, 'errors');

        // This function will executed later if specified both `before` and `after` params.
        this.warnings = [];
        this.errors = [];

        callback();
    }

    /**
     * Synchronously removes folders or files.
     *
     * @param {RemoveParameters} params
     * A parameters for removing.
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
            !Object.keys(items.dicts).length &&
            !Object.keys(items.files).length
        ) {
            this.warnings.push('An items for removing not found.');
            return;
        }

        if (params.emulate) {
            Terminal.printMessage(
                'Following items will be removed in case of not emulation: ',
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

        // trim root for pretty printing.
        if (!params.allowRootAndOutside) {
            items.trimRoot(params.root);
        }

        if (params.log) {
            Terminal.printMessage(
                'Following items have been removed: ',
                items
            );
        }
    }

    /**
     * Gets sorted folders and files for removing.
     *
     * @param {RemoveParameters} params
     * A parameters for remove.
     * Either `this.beforeParams` or `this.afterParams`.
     */
    getItemsForRemoving(params) {
        let items = new Items();

        params.include = this.toAbsolutePaths(params.root, params.include);
        params.exclude = this.toAbsolutePaths(params.root, params.exclude);

        // handle unexplicit files or folders and add it to explicit.
        params.include = params.include.concat(
            this.handleTest(params)
        );

        // handle explicit files or folders.
        for (let item of params.include) {
            if (params.exclude.includes(item)) {
                continue;
            }

            if (
                !params.allowRootAndOutside &&
                !this.isSave(params.root, item)
            ) {
                this.warnings.push(`Unsafe removig of "${item}". Skipped.`);
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
                this.warnings.push(`Invalid stat for "${item}". Skipped.`);
                continue;
            }

            if (items[group].includes(item)) {
                continue;
            }

            items[group].push(item);
        }

        items.cropUnnecessaryItems();

        return items;
    }

    /**
     * Performs a testing of files or folders for removing.
     *
     * @param {RemoveParameters} params
     * A parameters for remove.
     * Either `this.beforeParams` or `this.afterParams`.
     * 
     * @returns {Array<String>}
     * An array of absolute paths of folders or files 
     * that should be removed.
     */
    handleTest(params) {
        const paths = [];

        if (!params.test || !params.test.length) {
            return paths;
        }

        for (let test of params.test) {
            if (!path.isAbsolute(test.folder)) {
                test.folder = path.join(params.root, test.folder);
            }

            if (
                !params.allowRootAndOutside &&
                !this.isSave(params.root, test.folder)
            ) {
                this.warnings.push(`Unsafe removig of "${test.folder}". Skipped.`);
                continue;
            }

            let itemStat = this.getStatSync(test.folder);

            if (!itemStat) {
                continue;
            } else if (!itemStat.isDirectory()) {
                this.warnings.push(`Test folder is not a directory – "${test.folder}". Skipped.`);
                continue;
            }

            const getFilesRecursiveSync = (dictPath) => {
                const files = fs.readdirSync(dictPath);

                for (let file of files) {
                    file = path.join(dictPath, file);
                    const stat = this.getStatSync(file);

                    if (!stat) {
                        continue;
                    } else if (stat.isFile() && test.method(file)) {
                        paths.push(file);
                    } else if (stat.isDirectory() && test.recursive) {
                        getFilesRecursiveSync(file);
                    } else if (!stat.isDirectory() && !stat.isFile()) {
                        this.warnings.push(`Invalid stat for "${file}". Skipped.`);
                    }
                }
            };

            getFilesRecursiveSync(test.folder);
        }

        return paths;
    }

    /**
     * Removes a folder.
     *
     * @param {String} folderPath
     * An absolute path to the folder.
     */
    unlinkFolderSync(folderPath) {
        if (!fs.existsSync(folderPath)) {
            this.warnings.push(`Folder doesn't exists – "${folderPath}". Skipped.`);
            return;
        }

        let files = fs.readdirSync(folderPath);
        files = this.toAbsolutePaths(folderPath, files);

        for (let file of files) {
            const stat = this.getStatSync(file);

            if (!stat) {
                continue;
            }
            else if (stat.isFile()) {
                try {
                    fs.unlinkSync(file);
                } catch (error) {
                    this.errors.push(error.message || error);
                }
            }
            else if (stat.isDirectory()) {
                this.unlinkFolderSync(file);
            }
            else {
                this.warnings.push(`Invalid stat for "${file}". Skipped.`);
            }
        }

        try {
            fs.rmdirSync(folderPath);
        } catch (error) {
            this.errors.push(error.message || error);
        }
    }

    /**
     * Gets a stat for an item.
     *
     * @param {String} path
     * An absolute path to the folder or file.
     *
     * @returns {fs.Stats}
     * An item stat or `undefined` if cannot get.
     *
     * @see https://nodejs.org/api/fs.html#fs_fs_lstatsync_path_options
     */
    getStatSync(path) {
        let stat = undefined;

        try {
            stat = fs.lstatSync(path);
        } catch (error) {
            this.errors.push(error.message || error);
        }

        return stat;
    }

    /**
     * Converts all paths to absolute paths.
     *
     * @param {String} root
     * A root that will be appended to non absolute paths.
     *
     * @param {Array<String>} paths
     * A paths for converting.
     *
     * @returns {Array<String>}
     * An absolute paths.
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
     * Checks a path for safety.
     *
     * Checking for either exit beyond the root 
     * or similarity with the root.
     * A paths before checking should be normalized!
     *
     * @param {String} root
     * A root directory.
     *
     * @param {String} pth
     * A path for checking.
     *
     * @returns {Boolean}
     * `True` – save, 
     * `False` – not save.
     *
     * @example
     * root – 'D:/dist'
     * pth – 'D:/dist/chromium'
     * Returns – true
     *
     * root – 'D:/dist'
     * pth – 'D:/dist'
     * Returns – false
     *
     * root – 'D:/dist'
     * pth – 'D:/'
     * Returns – false
     */
    isSave(root, pth) {
        return new RegExp(`(^${Utils.escape(root)})(.+)`, 'm').test(pth);
    }
}


module.exports = Plugin;
