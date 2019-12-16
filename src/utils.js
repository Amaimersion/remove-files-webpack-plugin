'use strict';


/**
 * Small utils which don't deserve separate class.
 */
class Utils {
    /**
     * Escapes a string.
     *
     * @param {string} string
     * A string for escaping.
     *
     * @returns {string}
     * Escaped string.
     */
    static escape(string) {
        return string.replace(
            // eslint-disable-next-line no-useless-escape
            /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
            '\\$&'
        );
    }
}


module.exports = Utils;
