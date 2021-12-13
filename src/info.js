'use strict';


/**
 * Information about plugin.
 */
class Info {
    /**
     * Name of plugin.
     */
    static get name() {
        return 'remove-files-plugin';
    }

    /**
     * Version of plugin.
     */
    static get version() {
        return '1.5.0';
    }

    /**
     * Name with version.
     */
    static get fullName() {
        return `${this.name}@${this.version}`;
    }
}


module.exports = Info;
