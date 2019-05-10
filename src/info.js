'use strict';


/**
 * Information about the plugin.
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
        return '1.1.3';
    }

    /**
     * Name with version.
     */
    static get fullName() {
        return `${this.name}@${this.version}`;
    }
}


module.exports = Info;
