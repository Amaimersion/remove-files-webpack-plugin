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
 * Defaults to `false`.
 *
 * @property {boolean} [rightTrashCallbacks]
 * Callbacks not works as expected, because trash is async.
 * We have to assume that trash working without errors,
 * because there is no more way to call success callback.
 * If `true`, then callbacks will be added in promise,
 * otherwise will be called (only success callbacks) before finising.
 * Defaults to `false`.
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
 * Defaults to `false`.
 *
 * @property {boolean} [rightTrashCallbacks]
 * Callbacks not works as expected, because trash is async.
 * We have to assume that trash working without errors,
 * because there is no more way to call success callback.
 * If `true`, then callbacks will be added in promise,
 * otherwise will be called (only success callbacks) before finising.
 * Defaults to `false`.
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
 * @typedef {Object} GetItemsParams
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
 * @property {(absolutePath: string) => boolean} [test]
 * If provided, will be called, and item path will be added to
 * result in case of `true`, otherwise item path will be skipped.
 * Defaults to `undefined`.
 *
 * @property {(error: string) => any} [onItemError]
 * Will be called if item error occurs.
 * Defaults to `undefined`.
 *
 * @property {(absolutePath: string) => any} [onTestSuccess]
 * Will be called if test passed.
 * Defaults to `undefined`.
 *
 * @property {(absolutePath: string) => any} [onTestFail]
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
     * - in case of moving to the trash this becomes an
     * async function and you should use callbacks
     * (consider `rightTrashCallbacks` parameter).
     *
     * @param {UnlinkFileParams} params
     * See `UnlinkFileParams` documentation.
     */
    unlinkFileSync(params) {
        /** @type {UnlinkFileParams} */
        params = {
            pth: '',
            toTrash: false,
            rightTrashCallbacks: false,
            onSuccess: undefined,
            onError: undefined,
            ...params
        };
        const onSuccess = () => {
            if (params.onSuccess) {
                params.onSuccess(params.pth);
            }
        };
        const onError = (message) => {
            if (params.onError) {
                params.onError(message);
            }
        };

        if (params.toTrash) {
            if (params.rightTrashCallbacks) {
                trash(params.pth)
                    .then(() => onSuccess())
                    .catch((error) => onError(error.message || error));
            } else {
                onSuccess();
                trash(params.pth)
                    .catch((error) => {
                        throw error;
                    });
            }

            return;
        }

        try {
            this.fs.unlinkSync(params.pth);
            onSuccess();
        } catch (error) {
            onError(error.message || error);
        }
    }

    /**
     * Removes a folder.
     *
     * - in case of moving to the trash this becomes an
     * async function and you should use callbacks
     * (consider `rightTrashCallbacks` parameter).
     * - in case of moving to the trash
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
            toTrash: false,
            rightTrashCallbacks: false,
            onFileSuccess: undefined,
            onFileError: undefined,
            onFolderSuccess: undefined,
            onFolderError: undefined,
            ...params
        };
        const onFileError = (message) => {
            if (params.onFileError) {
                params.onFileError(message);
            }
        };
        const onFolderSuccess = () => {
            if (params.onFolderSuccess) {
                params.onFolderSuccess(params.pth);
            }
        };
        const onFolderError = (message) => {
            if (params.onFolderError) {
                params.onFolderError(message);
            }
        };

        if (params.toTrash) {
            if (params.rightTrashCallbacks) {
                trash(params.pth)
                    .then(() => onFolderSuccess())
                    .catch((error) => onFolderError(error.message || error));
            } else {
                onFolderSuccess();

                trash(params.pth).catch((error) => {
                    throw error;
                });
            }

            return;
        }

        let content = this.fs.readdirSync(params.pth);
        content = params.toAbsoluteS(params.pth, content);

        for (const item of content) {
            const stat = this.getStatSync(item);

            if (!stat) {
                onFileError(`Skipped, because unable to get stat - "${item}"`);

                continue;
            } else if (stat.isFile()) {
                this.unlinkFileSync({
                    pth: item,
                    toTrash: params.toTrash,
                    rightTrashCallbacks: params.rightTrashCallbacks,
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
                onFileError(`Skipped, because of invalid stat – "${item}"`);

                continue;
            }
        }

        try {
            fs.rmdirSync(params.pth);
            onFolderSuccess();
        } catch (error) {
            onFolderError(error.message || error);
        }
    }

    /**
     * Gets list of absolute items paths.
     *
     * - if item is unnecessary,
     * it still will be returned.
     *
     * @param {GetItemsParams} params
     * See `GetItemsParams` documentation.
     *
     * @returns {string[]}
     * Absolute folders and files paths.
     */
    getItemsSync(params) {
        /** @type {GetItemsParams} */
        params = {
            pth: '',
            join: undefined,
            recursive: false,
            test: undefined,
            onItemError: undefined,
            onTestSuccess: undefined,
            onTestFail: undefined,
            ...params
        };
        const onItemError = (message) => {
            if (params.onItemError) {
                params.onItemError(message);
            }
        };
        const onTestSuccess = (message) => {
            if (params.onTestSuccess) {
                params.onTestSuccess(message);
            }
        };
        const onTestFail = (message) => {
            if (params.onTestFail) {
                params.onTestFail(message);
            }
        };

        /** @type {string[]} */
        const items = this.fs.readdirSync(params.pth);

        /** @type {string[]} */
        let result = [];

        for (let item of items) {
            item = params.join(params.pth, item);
            const stat = this.getStatSync(item);

            if (!stat) {
                onItemError(`Skipped, because unable to get stat - "${item}"`);

                continue;
            } else if (stat.isFile()) {
                let passed = true;

                if (params.test) {
                    passed = params.test(item);

                    if (passed) {
                        onTestSuccess(item);
                    } else {
                        onTestFail(item);
                    }
                }

                if (passed) {
                    result.push(item);
                }
            } else if (stat.isDirectory()) {
                let passed = false;

                if (params.test) {
                    passed = params.test(item);

                    if (passed) {
                        onTestSuccess(item);
                    } else {
                        onTestFail(item);
                    }
                }

                if (passed) {
                    result.push(item);
                }

                if (params.recursive) {
                    result = result.concat(
                        this.getItemsSync({
                            ...params,
                            ...{
                                pth: item
                            }
                        })
                    );
                }
            } else {
                onItemError(`Skipped, because of invalid stat – "${item}"`);

                continue;
            }
        }

        return result;
    }
}


module.exports = Fs;
