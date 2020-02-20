const expect = require('chai').expect;
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('.apply()', function () {
            const emulatedWebpackCompiler = {
                v4: {
                    hooks: {
                        beforeRun: {
                            tapAsync: () => { }
                        },
                        watchRun: {
                            tapAsync: () => { }
                        },
                        afterEmit: {
                            tapAsync: () => { }
                        }
                    }
                },
                v3: {
                    plugin: (hookName) => {
                        if (!([
                            'before-run',
                            'watch-run',
                            'after-emit'
                        ].includes(hookName))) {
                            throw new Error(`Invalid hook name - "${hookName}"`);
                        }
                    }
                },
                invalid: {}
            };

            it('should work with webpack v4', function () {
                const test = () => {
                    const instance = new Plugin({
                        before: {}
                    });

                    instance.apply(emulatedWebpackCompiler.v4);
                };

                expect(test).not.to.throw();
            });

            it('should work with webpack v3', function () {
                const test = () => {
                    const plugin = new Plugin({
                        before: {}
                    });

                    plugin.apply(emulatedWebpackCompiler.v3);
                };

                expect(test).not.to.throw();
            });

            it('should not work with invalid webpack', function () {
                const test = () => {
                    const plugin = new Plugin({
                        before: {}
                    });

                    plugin.apply(emulatedWebpackCompiler.invalid);
                };

                expect(test).to.throw();
            });
        });
    });
});
