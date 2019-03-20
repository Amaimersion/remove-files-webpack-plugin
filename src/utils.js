'use strict';


/**
 * Some utils.
 */
class Utils {
    /**
     * Escapes a string.
     *
     * @param {String} string
     * A string for escaping.
     *
     * @returns {String}
     * Escaped string.
     */
    static escape(string) {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
}


module.exports = Utils;
