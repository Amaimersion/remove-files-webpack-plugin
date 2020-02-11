'use strict';


//#region Types

/**
 * @typedef {'' | 'win32' | 'posix'} PathType
 * Type of `path` module.
 */

/**
 * @typedef {Object} GetDirNameParams
 *
 * @property {string} pth
 * A path for handling.
 *
 * @property {boolean} escapeForRegExp
 * Escape special Regular Expression characters in returned
 * path in order to treat them as string in RegExp.
 *
 * @property {boolean} replaceDoubleSlash
 * Replace `\\` with `\\\\` in returned path
 * in order to keep `\\` as string in a path.
 *
 * @property {boolean} resolve
 * Resolve `pth` using `path.resolve()`.
 */

/**
 * @typedef {Object} GetDirNameReturn
 *
 * @property {string} dirName
 * Directory name of handled path.
 *
 * @property {boolean} initiallyIsFile
 * `pth` initially was a file.
 */

//#endregion


const fs = require('fs');
const path = require('path');
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
         * @type {PathType}
         * */
        this._type = '';
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
            this._type ?
                path[this._type] :
                path
        );
    }

    /**
     * Specifies type of `path` module.
     *
     * @param {PathType} type
     * Type of `path` module.
     */
    use(type) {
        this._type = type;
    }

    /**
     * Converts provided path to absolute path
     * (based on provided root).
     *
     * - **single `\` (Windows) not supported,
     * because JS uses it for escaping.**
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
     * old path will changed.
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
     * Extracts directory name.
     *
     * - if it is file, then handled directory
     * will be returned, else handled
     * provided path will be returned.
     *
     * @param {GetDirNameParams} params
     * See `GetDirNameParams` documentation.
     *
     * @returns {GetDirNameReturn}
     * See `GetDirNameReturn` documentation.
     *
     * @throws
     * Throws an error if provided path not exists.
     *
     * @example
     * params = {
     *  pth: 'D:\\dist\\chromium\\file.txt',
     *  escapeForRegExp: false,
     *  replaceDoubleSlash: true
     * }
     * Returns
     * {
     *  dirName: 'D:\\\\dist\\\\chromium',
     *  initiallyIsFile: true
     * }
     *
     * params = {
     *  pth: 'D:/dist/chromium',
     *  escapeForRegExp: false,
     *  replaceDoubleSlash: false
     * }
     * Returns
     * {
     *  dirName: 'D:/dist/chromium',
     *  initiallyIsFile: false
     * }
     */
    getDirName(params) {
        /** @type {GetDirNameReturn} */
        const result = {
            dirName: params.pth,
            initiallyIsFile: false
        };

        let pth = (
            params.resolve ?
                this.path.resolve(params.pth) :
                params.pth
        );
        const stat = fs.lstatSync(pth);

        if (!stat) {
            throw new Error(`Cannot get stat – "${pth}"`);
        }

        if (stat.isFile()) {
            result.initiallyIsFile = true;
            pth = this.path.dirname(pth);
        }

        // this should go before actual escaping.
        if (params.replaceDoubleSlash) {
            pth = pth.replace(/\\/g, '\\\\');
        }

        if (params.escapeForRegExp) {
            pth = Utils.escapeForRegExp(pth);
        }

        result.dirName = pth;

        return result;
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
        /**
         * - we should escape root because
         * this will be pasted in RegExp.
         * - we shouldn't escape pth because
         * this will be compared as a plain string.
         */
        const rootDir = this.getDirName({
            pth: root,
            escapeForRegExp: true,
            replaceDoubleSlash: true,
            resolve: true
        });
        const pthDir = this.getDirName({
            pth: pth,
            escapeForRegExp: false,
            replaceDoubleSlash: true,
            resolve: true
        });

        if (onCompare) {
            onCompare(
                rootDir.dirName,
                pthDir.dirName
            );
        }

        return new RegExp(
            `(^${rootDir.dirName})${pthDir.initiallyIsFile ? '' : '(.+)'}`,
            'm'
        ).test(pthDir.dirName);
    }
}


module.exports = Path;
