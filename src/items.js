'use strict';


const Utils = require('./utils');


/**
 * Contains directories and files.
 * 
 * Available through `dicts` and 
 * `files` properties respectively.
 */
class Items {
    constructor() {
        this.dicts = [];
        this.files = [];
    }

    /**
     * Crops unecessary folders or files.
     *
     * It's clears childrens dicts or files,
     * whose parents will be removed.
     * 
     * Warning: it changes `this.dicts` and `this.files`.
     *
     * @example
     * this = {
     *   dicts: [
     *     'D:/dist/styles/css',
     *     'D:/dist/js/scripts',
     *     'D:/dist/styles'
     *   ];
     *   files: [
     *     'D:/dist/styles/popup.css',
     *     'D:/dist/styles/popup.css.map',
     *     'D:/dist/manifest.json'
     *   ];
     * };
     *
     * After cropUnnecessaryItems() will be:
     * this = {
     *   dicts: [
     *     'D:/dist/js/scripts',
     *     'D:/dist/styles'
     *   ];
     *   files: [
     *     'D:/dist/manifest.json'
     *   ];
     * };
     *
     * Because full styles folder will be removed.
     */
    cropUnnecessaryItems() {
        if (!this.dicts.length) {
            return;
        }

        const rightItems = new Items();
        let unnecessaryIndexes = new Set();

        const addToUnnecessaryIndexes = (firstGroup, secondGroup, indexes) => {
            for (let item of firstGroup) {
                item = Utils.escape(item);
                const regexp = new RegExp(`(^${item})(.+)`, 'm');

                for (let i in secondGroup) {
                    if (regexp.test(secondGroup[i])) {
                        indexes.add(i);
                    }
                }
            }
        };

        const addToRightGroup = (rightGroup, itemsGroup, indexes) => {
            for (let index in itemsGroup) {
                if (!indexes.has(index)) {
                    rightGroup.push(itemsGroup[index]);
                }
            }
        };

        addToUnnecessaryIndexes(this.dicts, this.dicts, unnecessaryIndexes);
        addToRightGroup(rightItems.dicts, this.dicts, unnecessaryIndexes);

        unnecessaryIndexes.clear();

        addToUnnecessaryIndexes(rightItems.dicts, this.files, unnecessaryIndexes);
        addToRightGroup(rightItems.files, this.files, unnecessaryIndexes);

        this.dicts = rightItems.dicts.slice();
        this.files = rightItems.files.slice();
    }

    /**
     * Trims a root.
     * 
     * Used only for pretty printing!
     * 
     * Warning: it changes `this.dicts` and `this.files`.
     * 
     * @param {String} root
     * A root value that should be trimmed.
     */
    trimRoot(root) {
        const method = (value) => value.replace(root, '');

        this.dicts = this.dicts.map(method);
        this.files = this.files.map(method);
    }
}


module.exports = Items;
