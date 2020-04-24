// Type definitions for remove-files-webpack-plugin 1.4
// Project: https://github.com/Amaimersion/remove-files-webpack-plugin/blob/master/README.md
// Definitions by: Sergey Kuznetsov <https://github.com/Amaimersion>
// Definitions: https://github.com/Amaimersion/remove-files-webpack-plugin
// TypeScript Version: 3.7

import { Plugin, Compiler } from "webpack";

/**
 * A plugin for webpack that removes files and
 * folders before and after compilation.
 */
declare class RemovePlugin extends Plugin {
    constructor(parameters: PluginParameters);
    apply(compiler: Compiler): void;
}

/**
 * A parameters of plugin.
 */
interface PluginParameters {
    /**
     * Executes once before "normal" compilation.
     */
    before?: RemoveParameters;

    /**
     * Executes every time before "watch" compilation.
     */
    watch?: RemoveParameters;

    /**
     * Executes once after "normal" compilation and
     * every time after "watch" compilation.
     */
    after?: RemoveParameters;
}

/**
 * A parameters of removing.
 */
interface RemoveParameters {
    /**
     * A root directory.
     * Not absolute paths will be appended to this.
     *
     * Defaults to `.` (where package.json and
     * node_modules are located).
     */
    root?: string;

    /**
     * A folders and files for removing.
     *
     * Defaults to `[]`.
     */
    include?: ReadonlyArray<string>;

    /**
     * A folders and files for excluding.
     *
     * Defaults to `[]`.
     */
    exclude?: ReadonlyArray<string>;

    /**
     * A folders for testing.
     *
     * Defaults to `[]`.
     */
    test?: ReadonlyArray<TestObject>;

    /**
     * If specified, will be called before removing.
     * Absolute paths of folders and files that will be removed
     * will be passed into this function.
     * If returned value is `true`, then
     * remove process will be canceled.
     * Will be not called if items for removing 
     * not found or `emulate` is on.
     * Defaults to `undefined`.
     */
    beforeRemove?: (
        absoluteFoldersPaths: string[],
        absoluteFilesPaths: string[]
    ) => boolean;

    /**
     * If specified, will be called after removing.
     * Absolute paths of folders and files that have been removed
     * will be passed into this function.
     * Defaults to `undefined`.
     */
    afterRemove?: (
        absoluteFoldersPaths: string[],
        absoluteFilesPaths: string[]
    ) => void;

    /**
     * Move folders and files to trash (recycle bin)
     * instead of permanent removing.
     *
     * Defaults to `false`.
     */
    trash?: boolean;

    /**
     * Print messages of "info" level
     * (example: "Which folders or files have been removed").
     *
     * Defaults to `true`.
     */
    log?: boolean;

    /**
     * Print messages of "warning" level
     * (example: "An items for removing not found").
     *
     * Defaults to `true`.
     */
    logWarning?: boolean;

    /**
     * Print messages of "error" level
     * (example: "No such file or directory").
     *
     * Defaults to `false`.
     */
    logError?: boolean;

    /**
     * Print messages of "debug" level
     * (used for debugging).
     *
     * Defaults to `false`.
     */
    logDebug?: boolean;

    /**
     * Emulate remove process.
     * Print which folders and files will be removed
     * without actually removing them.
     * Ignores `log` parameter.
     *
     * Defaults to `false`.
     */
    emulate?: boolean;

    /**
     * Allow removing of `root` directory or outside `root` directory.
     * It is kind of safe mode.
     * **Don't turn it on if you don't know what you actually do!**
     *
     * Defaults to `false`.
     */
    allowRootAndOutside?: boolean;
}

/**
 * A folder for testing of items (folders and files) that should be removed.
 */
interface TestObject {
    /**
     * A path to the folder (relative to `root`).
     */
    folder: string;

    /**
     * A method that accepts an item path (`root` + folderPath + fileName) and
     * returns value that indicates should this item be removed or not.
     */
    method: (absolutePath: string) => boolean;

    /**
     * Apply this method to all items in subdirectories.
     *
     * Defaults to `false`.
     */
    recursive?: boolean;
}

export = RemovePlugin;
