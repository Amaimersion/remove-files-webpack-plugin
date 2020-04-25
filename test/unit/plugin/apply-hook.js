const expect = require('chai').expect;
const Webpack = require('../../webpack');
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('.applyHook()', function () {
            it('"beforeForFirstBuild" works only in "watch"', function () {
                const webpackV4 = new Webpack.EmulatedWebpackCompiler.v4();
                let applied = false;
                const instance = new Plugin({
                    before: {
                        include: [
                            './plugin_test_remove/apply-hook/test1.txt'
                        ],
                        beforeRemove: () => {
                            applied = true;
                        }
                    },
                    after: {
                        include: [
                            './plugin_test_remove/apply-hook/test1.txt'
                        ],
                        beforeForFirstBuild: true,
                        log: false
                    }
                });

                instance.apply(webpackV4);
                webpackV4.runAfterEmit();

                expect(applied).to.equal(false);
            });

            it('"beforeForFirstBuild: true" applies "before" for first build', function () {
                const webpackV4 = new Webpack.EmulatedWebpackCompiler.v4();
                let applied = false;
                const instance = new Plugin({
                    before: {
                        include: [
                            './plugin_test_remove/apply-hook/test2.txt'
                        ],
                        beforeRemove: () => {
                            applied = true;
                        },
                        log: false
                    },
                    watch: {
                        beforeForFirstBuild: true
                    }
                });

                instance.apply(webpackV4);
                webpackV4.runWatchRun();

                expect(applied).to.equal(true);
            });

            it('"beforeForFirstBuild: false" not applies "before" for first build', function () {
                const webpackV4 = new Webpack.EmulatedWebpackCompiler.v4();
                let applied = true;
                const instance = new Plugin({
                    before: {
                        include: [
                            './plugin_test_remove/apply-hook/test3.txt'
                        ]
                    },
                    watch: {
                        include: [
                            './plugin_test_remove/apply-hook/test3.txt'
                        ],
                        beforeForFirstBuild: false,
                        beforeRemove: () => {
                            applied = false;
                        },
                        log: false
                    }
                });

                instance.apply(webpackV4);
                webpackV4.runWatchRun();

                expect(applied).to.equal(false);
            });

            it('"beforeForFirstBuild: true" applies "before" only for first build', function () {
                const webpackV4 = new Webpack.EmulatedWebpackCompiler.v4();
                const result = [];
                const instance = new Plugin({
                    before: {
                        include: [
                            './plugin_test_remove/apply-hook/test4.txt'
                        ],
                        beforeRemove: () => {
                            result.push("before");
                        },
                        log: false
                    },
                    watch: {
                        include: [
                            './plugin_test_remove/apply-hook/test5.txt'
                        ],
                        beforeForFirstBuild: true,
                        beforeRemove: () => {
                            result.push("watch");
                        },
                        log: false
                    }
                });

                instance.apply(webpackV4);
                webpackV4.runWatchRun();
                webpackV4.runWatchRun();

                expect(result).to.have.ordered.members(["before", "watch"]);
            });

            it('"skipFirstBuild: true" skips first build', function () {
                const webpackV4 = new Webpack.EmulatedWebpackCompiler.v4();
                let removed = false;
                const instance = new Plugin({
                    watch: {
                        include: [
                            './plugin_test_remove/apply-hook/test6.txt'
                        ],
                        skipFirstBuild: true,
                        afterRemove: () => {
                            removed = true;
                        }
                    }
                });

                instance.apply(webpackV4);
                webpackV4.runWatchRun();

                expect(removed).to.equal(false);
            });
        });
    });
});
