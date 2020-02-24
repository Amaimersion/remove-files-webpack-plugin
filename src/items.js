'use strict';


const Path = require('./path');


/**
 * Contains directories and files.
 *
 * - available through `directories` and
 * `files` properties respectively.
 */
class Items {
    /**
     * Creates an instance of `Items`.
     */
    constructor() {
        /**
         * @type {string[]}
         * */
        this._directories = [];

        /**
         * @type {string[]}
         * */
        this._files = [];
    }

    /**
     * @returns {string[]}
     * Directories.
     */
    get directories() {
        return this._directories;
    }

    /**
     * Sets directories.
     *
     * @param {string[]} value
     * Value to set.
     */
    set directories(value) {
        this._directories = value;
    }

    /**
     * @returns {string[]}
     * Files.
     */
    get files() {
        return this._files;
    }

    /**
     * Sets files.
     *
     * @param {string[]} value
     * Value to set.
     */
    set files(value) {
        this._files = value;
    }

    /**
     * Removes unnecessary folders and files.
     *
     * - it removes children directories or files
     * whose parents will be removed;
     * - changes `this.directories` and `this.files`.
     *
     * @example
     * Input:
     * directories: [
     *   'D:/dist/styles/css',
     *   'D:/dist/js/scripts',
     *   'D:/dist/styles',
     *   'D:/test',
     *   'C:/test/test_1'
     * ]
     * files: [
     *   'D:/dist/styles/popup.css',
     *   'D:/dist/styles/popup.css.map',
     *   'D:/dist/manifest.json',
     *   'D:/test.txt',
     *   'D:/dist/js/scripts/test.js'
     * ]
     *
     * Output:
     * // there is no point in 'D:/dist/styles/css'
     * // because entire 'D:/dist/styles' will be removed.
     * directories: [
     *   'D:/dist/js/scripts',
     *   'D:/dist/styles',
     *   'D:/test',
     *   'C:/test/test_1'
     * ]
     * // there is no point in 'D:/dist/styles/popup.css' and
     * // 'D:/dist/styles/popup.css.map' because entire 'D:/dist/styles'
     * // will be removed.
     * // there is no point in 'D:/dist/js/scripts/test.js' because entire
     * // 'D:/dist/js/scripts' will be removed.
     * files: [
     *   'D:/dist/manifest.json',
     *   'D:/test.txt'
     * ]
     */
    removeUnnecessary() {
        if (!this.directories.length) {
            return;
        }

        /** @type {Set<string>} */
        const unnecessaryIndexes = new Set();

        /** @type {string[]} */
        const rightDirectories = [];

        /** @type {string[]} */
        const rightFiles = [];

        /**
         * @param {string[]} firstGroup
         * @param {string[]} secondGroup
         * @param {Set<string>} indexes
         */
        const addToUnnecessaryIndexes = (firstGroup, secondGroup, indexes) => {
            const path = new Path();

            for (const itemFirst of firstGroup) {
                for (const indexSecond in secondGroup) {
                    if (path.isSave(itemFirst, secondGroup[indexSecond])) {
                        indexes.add(indexSecond);
                    }
                }
            }
        };

        /**
         * @param {string[]} rightGroup
         * @param {string[]} itemsGroup
         * @param {Set<string>} indexes
         */
        const addToRightGroup = (rightGroup, itemsGroup, indexes) => {
            for (const itemIndex in itemsGroup) {
                if (!indexes.has(itemIndex)) {
                    rightGroup.push(itemsGroup[itemIndex]);
                }
            }
        };

        addToUnnecessaryIndexes(
            this.directories,
            this.directories,
            unnecessaryIndexes
        );
        addToRightGroup(
            rightDirectories,
            this.directories,
            unnecessaryIndexes
        );

        unnecessaryIndexes.clear();

        addToUnnecessaryIndexes(
            rightDirectories,
            this.files,
            unnecessaryIndexes
        );
        addToRightGroup(
            rightFiles,
            this.files,
            unnecessaryIndexes
        );

        this.directories = rightDirectories.slice();
        this.files = rightFiles.slice();
    }

    /**
     * Trims a root.
     *
     * - changes `this.directories` and `this.files`.
     *
     * @param {string} root
     * A root value that should be removed.
     */
    removeRoot(root) {
        const method = (value) => {
            if (value.indexOf(root) === 0) {
                value = value.replace(root, '');
            }

            return value;
        };

        this.directories = this.directories.map(method);
        this.files = this.files.map(method);
    }

    /**
     * Sorts items in ascending, ASCII character order.
     *
     * - changes `this.directories` and `this.files`.
     */
    sort() {
        this.directories = this.directories.sort();
        this.files = this.files.sort();
    }
}


module.exports = Items;
