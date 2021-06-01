// Type definitions for remove-files-webpack-plugin 1.4
// Project: https://github.com/Amaimersion/remove-files-webpack-plugin/blob/master/README.md
// Definitions by: Sergey Kuznetsov <https://github.com/Amaimersion>
// Definitions: https://github.com/Amaimersion/remove-files-webpack-plugin
// TypeScript Version: 3.7

import {Compiler} from "webpack";

/**
 * A plugin for webpack that removes files and
 * folders before and after compilation.
 */
declare class RemovePlugin {
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
     * Defaults to `.` (where "package.json" and
     * "node_modules" are located).
     *
     * Namespace: all.
     */
    root?: string;

    /**
     * A folders or files for removing.
     *
     * Defaults to `[]`.
     *
     * Namespace: all.
     */
    include?: ReadonlyArray<string>;

    /**
     * A folders or files for excluding.
     *
     * Defaults to `[]`.
     *
     * Namespace: all.
     */
    exclude?: ReadonlyArray<string>;

    /**
     * A folders for testing.
     *
     * Defaults to `[]`.
     *
     * Namespace: all.
     */
    test?: ReadonlyArray<TestObject>;

    /**
     * If specified, will be called before removing.
     * Absolute paths of folders and files that will be removed
     * will be passed into this function.
     * If returned value is `true`, then
     * remove process will be canceled.
     * Will be not called if items for removing
     * not found, `emulate: true` or `skipFirstBuild: true`.
     *
     * Defaults to `undefined`.
     *
     * Namespace: all.
     */
    beforeRemove?: (
        absoluteFoldersPaths: string[],
        absoluteFilesPaths: string[]
    ) => boolean;

    /**
     * If specified, will be called after removing.
     * Absolute paths of folders and files that have been
     * removed will be passed into this function.
     * Will be not called if `emulate: true` or `skipFirstBuild: true`.
     *
     * Defaults to `undefined`.
     *
     * Namespace: all.
     */
    afterRemove?: (
        absoluteFoldersPaths: string[],
        absoluteFilesPaths: string[]
    ) => void;

    /**
     * Move folders and files to the trash (recycle bin)
     * instead of permanent removing.
     * **It is an async operation and you won't be
     * able to control an execution chain along with
     * other webpack plugins!**
     * `afterRemove` callback behavior is undefined
     * (it can be executed before, during or after actual execution).
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    trash?: boolean;

    /**
     * Print messages of "info" level
     * (example: "Which folders or files have been removed").
     *
     * Defaults to `true`.
     *
     * Namespace: all.
     */
    log?: boolean;

    /**
     * Print messages of "warning" level
     * (example: "An items for removing not found").
     *
     * Defaults to `true`.
     *
     * Namespace: all.
     */
    logWarning?: boolean;

    /**
     * Print messages of "error" level
     * (example: "No such file or directory").
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    logError?: boolean;

    /**
     * Print messages of "debug" level
     * (used for debugging).
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    logDebug?: boolean;

    /**
     * Emulate remove process.
     * Print which folders and files will be removed
     * without actually removing them.
     * Ignores `log` parameter.
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    emulate?: boolean;

    /**
     * Allow removing of `root` directory or outside `root` directory.
     * It is kind of safe mode.
     * **Don't turn it on if you don't know what you actually do!**
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    allowRootAndOutside?: boolean;

    /**
     * Change parameters based on webpack configuration.
     * Following webpack parameters are supported:
     * `stats` (controls logging).
     * These webpack parameters have priority over
     * the plugin parameters.
     * See webpack documentation for more -
     * https://webpack.js.org/configuration
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    readWebpackConfiguration?: boolean;

    /**
     * First build will be skipped.
     *
     * Defaults to `false`.
     *
     * Namespace: `watch`.
     */
    skipFirstBuild?: boolean;

    /**
     * For first build `before` parameters will be applied,
     * for subsequent builds `watch` parameters will be applied.
     *
     * Defaults to `false`.
     *
     * Namespace: `watch`.
     */
    beforeForFirstBuild?: boolean;
}

/**
 * A folder for testing of items (folders or files) that should be removed.
 */
interface TestObject {
    /**
     * A path to the folder (relative to `root`).
     *
     * Namespace: all.
     */
    folder: string;

    /**
     * A method that accepts an item path (`root` + folderPath + fileName) and
     * returns value that indicates should this item be removed or not.
     *
     * Namespace: all.
     */
    method: (absolutePath: string) => boolean;

    /**
     * Apply this method to all items in subdirectories.
     *
     * Defaults to `false`.
     *
     * Namespace: all.
     */
    recursive?: boolean;
}

export = RemovePlugin;
