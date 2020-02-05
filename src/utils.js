'use strict';


//#region Types

/**
 * @typedef {Object} GetDirNameParams
 *
 * @property {string} pth
 * A path for handling.
 *
 * @property {boolean} escapeForRegExp
 * Escape returned path (special Regular Expression characters)
 * in order to treat them as string in RegExp.
 *
 * @property {boolean} replaceDoubleSlash
 * Replace `\\` with `\\\\` in returned path
 * in order to keep `\\` as string in a path.
 *
 * @property {boolean} resolve
 * Resolve `pth` using `path.resolve`.
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


/**
 * Small utils which don't deserve separate class.
 */
class Utils {
    /**
     * Escapes a string for pasting in RegExp.
     *
     * - means `\` will be in RegExp, like this
     * `/D:\/\(test/`.
     *
     * @param {string} string
     * A string for escaping.
     *
     * @returns {string}
     * Escaped string.
     */
    static escapeForRegExp(string) {
        return string.replace(
            // eslint-disable-next-line no-useless-escape
            /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
            '\\$&'
        );
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
     * Throws an error if occurs.
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
    static getDirName(params) {
        /** @type {GetDirNameReturn} */
        const result = {
            dirName: params.pth,
            initiallyIsFile: false
        };

        let pth = (
            params.resolve ?
                path.resolve(params.pth) :
                params.pth
        );
        const stat = fs.lstatSync(pth);

        if (!stat) {
            throw new Error(`Cannot get stat – "${pth}"`);
        }

        if (stat.isFile()) {
            result.initiallyIsFile = true;
            pth = path.dirname(pth);
        }

        // this should go before actual escaping.
        if (params.replaceDoubleSlash) {
            pth = pth.replace(/\\/g, '\\\\');
        }

        if (params.escapeForRegExp) {
            pth = this.escapeForRegExp(pth);
        }

        result.dirName = pth;

        return result;
    }
}


module.exports = Utils;
