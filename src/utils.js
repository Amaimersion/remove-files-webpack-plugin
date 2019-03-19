'use strict';


class Utils {
    /**
     * Escapes a string
     *
     * @param {String} string
     * A string for escaping.
     *
     * @returns {String}
     * Escaped string.
     */
    static escapeString(string) {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
}


module.exports = Utils;
