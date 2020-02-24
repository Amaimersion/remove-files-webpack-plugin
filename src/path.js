'use strict';


//#region Types

/**
 * @typedef {'' | 'win32' | 'posix'} PathType
 * Type of `path` module.
 */

//#endregion


const path = require('path');
const Fs = require('./fs');
const Utils = require('./utils');


/**
 * Wrapper for Node `path` module.
 */
class Path {
    /**
     * Creates an instance of `Path`.
     */
    constructor() {
        /**
         * `fs` module.
         */
        this.fs = new Fs();

        /**
         * @type {PathType}
         * */
        this._type = '';
    }

    /**
     * Returns current `path` type.
     *
     * @returns {string}
     * Current `path` type.
     */
    get type() {
        return this._type;
    }

    /**
     * Sets type of `path` module.
     *
     * @param {PathType} value
     * Type of `path` module.
     */
    set type(value) {
        this._type = value;
    }

    /**
     * Returns `path` module with
     * specified type.
     *
     * - if type is not specified,
     * then it will be auto picked.
     *
     * @returns {path.PlatformPath}
     * `path` module.
     */
    get path() {
        return (
            this.type ?
                path[this.type] :
                path
        );
    }

    /**
     * Converts provided path to absolute path
     * (based on provided root).
     *
     * - **single `\` (Windows) not supported,
     * because JS uses it for escaping.**
     * - normalizes paths that has been converted.
     *
     * @param {string} root
     * A root that will be appended to non absolute path.
     *
     * @param {string} pth
     * A path for converting.
     *
     * @param {(
     *  oldPath: string,
     *  newPath: string
     * ) => any} onChange
     * If specified, will be called when
     * provided path changes.
     *
     * @returns {string}
     * An absolute `pth`.
     */
    toAbsolute(root, pth, onChange = undefined) {
        let newPath = pth;

        if (!this.path.isAbsolute(pth)) {
            newPath = this.path.join(root, pth);

            if (onChange) {
                onChange(pth, newPath);
            }
        }

        return newPath;
    }

    /**
     * Converts all paths to absolute paths.
     *
     * - see `toAbsolute()` documentation.
     *
     * @param {string} root
     * @param {string[]} pth
     * @param {(
     *  oldPath: string,
     *  newPath: string
     * ) => any} onChange
     *
     * @returns {string[]}
     */
    toAbsoluteS(root, paths, onChange = undefined) {
        const newPaths = [];

        for (const item of paths) {
            newPaths.push(
                this.toAbsolute(
                    root,
                    item,
                    onChange
                )
            );
        }

        return newPaths;
    }

    /**
     * Checks a path for safety.
     *
     * - checks for either exit beyond the root
     * or identicality with the root.
     *
     * @param {string} root
     * A root directory.
     *
     * @param {string} pth
     * A path for checking.
     *
     * @param {(
     *  comparedRoot: string,
     *  comparedPth: string
     * ) => any} onCompare
     * If specified, will be called when
     * comparation occurs.
     *
     * @returns {boolean}
     * `true` – save,
     * `false` – not save.
     *
     * @throws
     * Throws an error if occurs
     * (for example, if file or folder not exists).
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
     * pth = 'D:\\te)st-tes(t and te[s]t {df} df+g.df^g&t/chromium'
     * Returns – true
     *
     * root = 'D:/test/../chromium'
     * pth = 'D:\\chromium/file.txt'
     * Returns – true
     */
    isSave(root, pth, onCompare = undefined) {
        root = this.path.resolve(root);
        pth = this.path.resolve(pth);

        if (!this.fs.fs.existsSync(root)) {
            throw new Error(`Root not exists – ${root}`);
        }

        if (!this.fs.fs.existsSync(pth)) {
            throw new Error(`Pth not exists – ${pth}`);
        }

        const parsedRoot = this.path.parse(root);
        const parsedPth = this.path.parse(pth);

        if (onCompare) {
            onCompare(
                root,
                pth
            );
        }

        /**
         * Cases which unable to handle with RegExp.
         */
        if (
            /**
             * 'D:/' and 'D:/test'
             */
            !parsedRoot.base &&
            parsedRoot.root === parsedPth.root &&
            parsedPth.base
        ) {
            return true;
        }

        const pthIsFile = !!parsedPth.ext;
        root = Utils.escapeForRegExp(root);

        return new RegExp(
            `(^${root})${pthIsFile ? '([/\\\\]|$)' : '([/\\\\]+)'}`,
            'm'
        ).test(pthIsFile ? this.path.dirname(pth) : pth);
    }
}


module.exports = Path;
