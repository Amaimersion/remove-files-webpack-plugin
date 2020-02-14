'use strict';


/**
 * Small utils which don't deserve separate class.
 */
class Utils {
    /**
     * Escapes a string for pasting in RegExp.
     *
     * - means `\` will be in RegExp, like this
     * `/D:\/\(test/`.
     * - you should insert result in RegExp like
     * a string, not like expression.
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
}


module.exports = Utils;
