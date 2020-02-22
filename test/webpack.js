class EmulatedWebpackCompilerV4 {
    constructor() {
        this.hooks = {
            beforeRun: {
                tapAsync: this._tapAsync
            },
            watchRun: {
                tapAsync: this._tapAsync
            },
            afterEmit: {
                tapAsync: this._tapAsync
            }
        };
    }

    _tapAsync(_pluginName, method) {
        method({}, () => { });
    }
}


class EmulatedWebpackCompilerV3 {
    constructor() {
        this.plugin = this._plugin;
    }

    _plugin(hookName, method) {
        if (!([
            'before-run',
            'watch-run',
            'after-emit'
        ].includes(hookName))) {
            throw new Error(`Invalid hook name - "${hookName}"`);
        }

        method({}, () => { });
    }
}


exports.EmulatedWebpackCompiler = {
    v4: EmulatedWebpackCompilerV4,
    v3: EmulatedWebpackCompilerV3
};
