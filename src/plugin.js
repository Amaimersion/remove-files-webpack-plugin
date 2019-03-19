'use strict';


const fs = require('fs');
const path = require('path');
const Items = require('./items');
const Utils = require('./utils');
const Terminal = require('./terminal');
const Info = require('./info');


class Plugin {
    /**
     * Creates an instance of Plugin.
     *
     * @param {Object} params
     * Contains two keys: `before` (compilation) and `after` (compilation).
     * All next properties are the same for these two keys.
     *
     * @param {String} params.root
     * A root directory.
     * Not absolute paths will be appended to this.
     * Defaults to `.` (from which directory is called).
     *
     * @param {Array<String>} params.include
     * A folders/files for remove.
     * Defaults to `[]`.
     *
     * @param {Array<String>} params.exclude
     * A files for exclude.
     * Defaults to `[]`.
     *
     * @param {Array<{folder: String, method: (filePath) => Boolean, recursive: Boolean}>} params.test
     * A folders for custom testing.
     * Defaults to `[]`.
     *
     * @param {Boolean} params.log
     * Print which folders/files has been removed.
     * Defaults to `true`.
     *
     * @param {Boolean} params.emulate
     * Emulate remove process.
     * Print which folders/files will be removed without actually removing them.
     * Ignores `params.log`.
     * Defaults to `false`.
     *
     * @param {Boolean} params.allowRootAndOutside
     * Allow remove of a `root` directory or outside the `root` directory.
     * It's kinda safe mode.
     * Don't turn it on, if you don't know what you actually do!
     * Defaults to `false`.
     */
    constructor(params) {
        params = params || {};

        if (!params.before && !params.after) {
            throw new Error(
                `No "before" or "after" parameters specified. ` +
                'See https://github.com/Amaimersion/remove-files-webpack-plugin#options'
            );
        }

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
        this.beforeParams = {
            ...defaultParams,
            ...params.before
        };
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
        const applyHook = (compiler, hook, params, method) => {
            if (!params || !Object.keys(params).length) {
                return;
            }

            if (compiler.hooks) {
                compiler.hooks[hook].tapAsync(Info.fullName, method);
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
     * @param {Object} params
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
     * @param {Object} params
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
            Terminal.printMessage(
                'The following items has been removed: ',
                items
            );
        }
    }

    /**
     * Gets sorted folders and files for removing.
     *
     * @param {Object} params
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
                this.warnings.push(`Unsafe removig of ${item}. Skipped.`);
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
                this.warnings.push(`Invalid stat for ${item}`);
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
     * @param {Object} params
     * A parameters for remove.
     * Either `this.beforeParams` or `this.afterParams`.
     * 
     * @returns {Array<String>}
     * An array of absolute paths of folders or files that 
     * should be removed.
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
                this.warnings.push(`Unsafe removig of ${item}. Skipped.`);

                continue;
            }

            let itemStat = this.getStatSync(test.folder);

            if (!itemStat) {
                continue;
            } else if (!itemStat.isDirectory()) {
                this.warnings.push(`Test folder is not a directory – ${test.folder}. Skipped.`);
                continue;
            } else if (!itemStat.isDirectory() && !itemStat.isFile()) {
                this.warnings.push(`Invalid stat for ${test.folder}`);
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
                        this.warnings.push(`Invalid stat for ${file}`);
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
            this.warnings.push(`Folder ${folderPath} doesn't exists.`);

            return;
        }

        let files = fs.readdirSync(folderPath);
        files = this.toAbsolutePaths(folderPath, files);

        for (let file of files) {
            const stat = this.getStatSync(file);

            if (!stat) {
                // error message already writed.
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
                this.warnings.push(`Invalid stat for ${file}`);
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
     * An absolute path to the folder/file.
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
     * The root directory.
     *
     * @param {String} pth
     * The path for checking.
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
