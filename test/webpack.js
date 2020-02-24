class EmulatedWebpackCompilerV4 {
    constructor() {
        this.hooks = {
            beforeRun: {
                tapAsync: (_pluginName, method) => {
                    this._register('beforeRun', method);
                },
                run: undefined
            },
            watchRun: {
                tapAsync: (_pluginName, method) => {
                    this._register('watchRun', method);
                },
                run: undefined
            },
            afterEmit: {
                tapAsync: (_pluginName, method) => {
                    this._register('afterEmit', method);
                },
                run: undefined
            }
        };
    }

    _register(hookName, method) {
        this.hooks[hookName].run = () => {
            method({}, () => { });
        };
    }

    _run(hookName) {
        this.hooks[hookName].run();
    }

    runBeforeRun() {
        this._run('beforeRun');
    }

    runWatchRun() {
        this._run('watchRun');
    }

    runAfterEmit() {
        this._run('afterEmit');
    }

    runAllHooks() {
        this.runBeforeRun();
        this.runWatchRun();
        this.runAfterEmit();
    }
}


class EmulatedWebpackCompilerV3 {
    constructor() {
        this.plugin = this._register;
        this._hooks = {
            'before-run': {
                run: undefined
            },
            'watch-run': {
                run: undefined
            },
            'after-emit': {
                run: undefined
            }
        };
    }

    _register(hookName, method) {
        if (!([
            'before-run',
            'watch-run',
            'after-emit'
        ].includes(hookName))) {
            throw new Error(`Invalid hook name - "${hookName}"`);
        }

        this._hooks[hookName].run = () => {
            method({}, () => { });
        };
    }

    _run(hookName) {
        this._hooks[hookName].run();
    }

    runBeforeRun() {
        this._run('before-run');
    }

    runWatchRun() {
        this._run('watch-run');
    }

    runAfterEmit() {
        this._run('after-emit');
    }

    runAllHooks() {
        this.runBeforeRun();
        this.runWatchRun();
        this.runAfterEmit();
    }
}


exports.EmulatedWebpackCompiler = {
    v4: EmulatedWebpackCompilerV4,
    v3: EmulatedWebpackCompilerV3
};
