'use strict';


const Utils = require('./utils');


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
        this.directories = [];

        /**
         * @type {string[]}
         * */
        this.files = [];
    }

    /**
     * Directories.
     */
    static get directories() {
        return this.directories;
    }

    /**
     * Files.
     */
    static get files() {
        return this.files;
    }

    /**
     * Crops unecessary folders and files.
     *
     * - it's clears childrens directories or files,
     * whose parents will be removed;
     * - changes `this.directories` and `this.files`.
     *
     * @example
     * this = {
     *   directories: [
     *     'D:/dist/styles/css',
     *     'D:/dist/js/scripts',
     *     'D:/dist/styles'
     *   ],
     *   files: [
     *     'D:/dist/styles/popup.css',
     *     'D:/dist/styles/popup.css.map',
     *     'D:/dist/manifest.json'
     *   ]
     * };
     *
     * After cropUnnecessaryItems() will be:
     * this = {
     *   directories: [
     *     'D:/dist/js/scripts',
     *     'D:/dist/styles'
     *   ],
     *   files: [
     *     'D:/dist/manifest.json'
     *   ]
     * };
     *
     * because entire styles folder will be removed.
     */
    cropUnnecessaryItems() {
        if (!this.directories.length) {
            return;
        }

        const rightItems = new Items();
        const unnecessaryIndexes = new Set();

        /**
         * @param {string[]} firstGroup
         * @param {string[]} secondGroup
         * @param {Set<string>} indexes
         */
        const addToUnnecessaryIndexes = (firstGroup, secondGroup, indexes) => {
            for (let itemFirst of firstGroup) {
                itemFirst = Utils.escape(itemFirst);
                const regexp = new RegExp(`(^${itemFirst})(.+)`, 'm');

                for (const itemSecond in secondGroup) {
                    if (regexp.test(secondGroup[itemSecond])) {
                        indexes.add(itemSecond);
                    }
                }
            }
        };

        /**
         * @param {string[]} firstGroup
         * @param {string[]} secondGroup
         * @param {Set<string>} indexes
         */
        const addToRightGroup = (rightGroup, itemsGroup, indexes) => {
            for (const index in itemsGroup) {
                if (!indexes.has(index)) {
                    rightGroup.push(itemsGroup[index]);
                }
            }
        };

        addToUnnecessaryIndexes(this.directories, this.directories, unnecessaryIndexes);
        addToRightGroup(rightItems.directories, this.directories, unnecessaryIndexes);

        unnecessaryIndexes.clear();

        addToUnnecessaryIndexes(rightItems.directories, this.files, unnecessaryIndexes);
        addToRightGroup(rightItems.files, this.files, unnecessaryIndexes);

        this.directories = rightItems.directories.slice();
        this.files = rightItems.files.slice();
    }

    /**
     * Trims a root.
     *
     * - should be used only for pretty printing;
     * - changes `this.directories` and `this.files`.
     *
     * @param {string} root
     * A root value that should be trimmed.
     */
    trimRoot(root) {
        const method = (value) => value.replace(root, '');

        this.directories = this.directories.map(method);
        this.files = this.files.map(method);
    }
}


module.exports = Items;
