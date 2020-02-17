'use strict';


//#region Types

/**
 * @typedef {Object} UnlinkFileParams
 *
 * @property {string} pth
 * An absolute path to the file.
 *
 * @property {boolean} [toTrash]
 * Move item to trash.
 * Defaults to `true`.
 *
 * @property {(pth: string) => any} [onSuccess]
 * Will be called if file successfully removed.
 * Defaults to `undefined`.
 *
 * @property {(error: string) => any} [onError]
 * Will be called if error occurs.
 * Defaults to `undefined`.
 */

/**
 * @typedef {Object} UnlinkFolderParams
 *
 * @property {string} pth
 * An absolute path to the folder.
 *
 * @property {(root: string, files: string[]) => string[]} toAbsoluteS
 * Converts paths to absolute paths.
 *
 * @property {boolean} [toTrash]
 * Move item to trash.
 * Defaults to `true`.
 *
 * @property {(filePath: string) => any} [onFileSuccess]
 * Will be called if file successfully removed.
 * Defaults to `undefined`.
 *
 * @property {(error: string) => any} [onFileError]
 * Will be called if error occurred during file removing.
 * Defaults to `undefined`.
 *
 * @property {(folderPath: string) => any} [onFolderSuccess]
 * Will be called if folder successfully removed.
 * Defaults to `undefined`.
 *
 * @property {(error: string) => any} [onFolderError]
 * Will be called if error occurred during folder removing.
 * Defaults to `undefined`.
 */

/**
 * @typedef {Object} GetFilesParams
 *
 * @property {string} pth
 * An absolute path to the folder.
 *
 * @property {(root: string, pth: string) => string[]} join
 * Joins provided root and path together.
 *
 * @property {boolean} [recursive]
 * Looks through all nested folders.
 * Defaults to `false`.
 *
 * @property {(absoluteFilePath: string) => boolean} [test]
 * If provided, will be called, and file path will be added to
 * result in case of `true`, otherwise file path will be skipped.
 * Defaults to `undefined`.
 *
 * @property {(error: string) => any} [onError]
 * Will be called if error occurs.
 * Defaults to `undefined`.
 *
 * @property {(absoluteFilePath: string) => any} [onTestSuccess]
 * Will be called if test passed.
 * Defaults to `undefined`.
 *
 * @property {(absoluteFilePath: string) => any} [onTestFail]
 * Will be called if test failed.
 * Defaults to `undefined`.
 */

//#endregion


const fs = require('fs');
const trash = require('trash');


/**
 * Wrapper for Node `fs` module.
 */
class Fs {
    /**
     * Returns `fs` module.
     *
     * @returns {fs}
     * `fs` module.
     */
    get fs() {
        return fs;
    }

    /**
     * Gets a stat for an item.
     *
     * @param {string} pth
     * An absolute path to the folder or file.
     *
     * @param {(error: string) => any} onError
     * Will be called if error occurs.
     * Defaults to `undefined`.
     *
     * @returns {fs.Stats}
     * An item stat or `undefined` if cannot get.
     */
    getStatSync(pth, onError = undefined) {
        let stat = undefined;

        try {
            stat = this.fs.lstatSync(pth);
        } catch (error) {
            if (onError) {
                onError(error.message || error);
            }
        }

        return stat;
    }

    /**
     * Removes a file.
     *
     * - don't throws an error if file not exists.
     * - in case of removing in trash
     * this becomes an async function and you
     * should use callbacks.
     *
     * @param {UnlinkFileParams} params
     * See `UnlinkFileParams` documentation.
     */
    unlinkFileSync(params) {
        /** @type {UnlinkFileParams} */
        params = {
            pth: '',
            toTrash: true,
            onSuccess: undefined,
            onError: undefined,
            ...params
        };

        if (params.toTrash) {
            trash(params.pth)
                .then(() => {
                    if (params.onSuccess) {
                        params.onSuccess(params.pth);
                    }
                })
                .catch((error) => {
                    if (params.onError) {
                        params.onError(error.message || error);
                    }
                });

            return;
        }

        try {
            this.fs.unlinkSync(params.pth);

            if (params.onSuccess) {
                params.onSuccess(params.pth);
            }
        } catch (error) {
            if (params.onError) {
                params.onError(error.message || error);
            }
        }
    }

    /**
     * Removes a folder.
     *
     * - in case of removing in trash
     * this becomes an async function and you
     * should use callbacks.
     * - in case of removing in trash
     * don't throws an error if folder not exists.
     *
     * @param {UnlinkFolderParams} params
     * See `UnlinkFolderParams` documentation.
     */
    unlinkFolderSync(params) {
        /** @type {UnlinkFolderParams} */
        params = {
            pth: '',
            toAbsoluteS: undefined,
            toTrash: true,
            onFileSuccess: undefined,
            onFileError: undefined,
            onFolderSuccess: undefined,
            onFolderError: undefined,
            ...params
        };

        if (params.toTrash) {
            trash(params.pth)
                .then(() => {
                    if (params.onFolderSuccess) {
                        params.onFolderSuccess(params.pth);
                    }
                })
                .catch((error) => {
                    if (params.onFolderError) {
                        params.onFolderError(error.message || error);
                    }
                });

            return;
        }

        let content = this.fs.readdirSync(params.pth);
        content = params.toAbsoluteS(params.pth, content);

        for (const item of content) {
            const stat = this.getStatSync(item);

            if (!stat) {
                if (params.onFileError) {
                    params.onFileError(`Skipped, because cannot get stat - "${item}"`);
                }

                continue;
            } else if (stat.isFile()) {
                this.unlinkFileSync({
                    pth: item,
                    toTrash: params.toTrash,
                    onSuccess: params.onFileSuccess,
                    onError: params.onFileError
                });
            } else if (stat.isDirectory()) {
                this.unlinkFolderSync({
                    ...params,
                    ...{
                        pth: item
                    }
                });
            } else {
                if (params.onFileError) {
                    params.onFileError(`Skipped, because invalid stat – "${item}"`);
                }

                continue;
            }
        }

        try {
            fs.rmdirSync(params.pth);

            if (params.onFolderSuccess) {
                params.onFolderSuccess(params.pth);
            }
        } catch (error) {
            if (params.onFolderError) {
                params.onFolderError(error.message || error);
            }
        }
    }

    /**
     * Gets list of absolute file paths.
     *
     * @param {GetFilesParams} params
     * See `GetFilesParams` documentation.
     *
     * @returns {string[]}
     * Absolute file paths.
     */
    getFilesSync(params) {
        /** @type {UnlinkFileParams} */
        params = {
            pth: '',
            join: undefined,
            recursive: false,
            test: undefined,
            onError: undefined,
            onTestSuccess: undefined,
            onTestFail: undefined,
            ...params
        };

        /** @type {string[]} */
        const items = this.fs.readdirSync(params.pth);

        /** @type {string[]} */
        let result = [];

        for (let item of items) {
            item = params.join(params.pth, item);
            const stat = this.getStatSync(item);

            if (!stat) {
                if (params.onFileError) {
                    params.onFileError(`Skipped, because cannot get stat - "${item}"`);
                }

                continue;
            } else if (stat.isFile()) {
                let passed = true;

                if (params.test) {
                    passed = params.test(item);

                    if (passed && params.onTestSuccess) {
                        params.onTestSuccess(item);
                    } else if (!passed && params.onTestFail) {
                        params.onTestFail(item);
                    }
                }

                if (passed) {
                    result.push(item);
                }
            } else if (stat.isDirectory() && params.recursive) {
                result = result.concat(
                    this.getFilesSync({
                        ...params,
                        ...{
                            pth: item
                        }
                    })
                );
            } else if (!stat.isDirectory() && !stat.isFile()) {
                if (params.onFileError) {
                    params.onFileError(`Skipped, because invalid stat – "${item}"`);
                }

                continue;
            }
        }

        return result;
    }
}


module.exports = Fs;
