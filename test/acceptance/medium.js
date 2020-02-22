const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const Webpack = require('../webpack');
const RemovePlugin = require('../..');


describe('acceptance', function () {
    describe('medium', function () {
        const logs = {
            log: false,
            logWarning: true,
            logError: true,
            logDebug: false
        };
        const exists = (...paths) => {
            return (
                fs.existsSync(
                    path.resolve(
                        ...paths
                    )
                )
            );
        }

        it('should pass example № 1', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: './acceptance_test_remove',
                    include: [
                        './dist1'
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const beforeIsSuccess = (
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist1'
                )
            );

            expect(beforeIsSuccess).to.equal(true);
        });

        it('should pass example № 2', function (done) {
            this.timeout(1000);

            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                after: {
                    root: './acceptance_test_remove/dist2',
                    include: [
                        'manifest.json',
                        'maps'
                    ],
                    trash: true,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runAfterEmit();

            setTimeout(() => {
                const afterIsSuccess = (
                    !exists(
                        '.',
                        'acceptance_test_remove',
                        'dist2',
                        'manifest.json'
                    ) &&
                    !exists(
                        '.',
                        'acceptance_test_remove',
                        'dist2',
                        'maps'
                    ) &&
                    exists(
                        '.',
                        'acceptance_test_remove',
                        'dist2',
                        'test.txt'
                    )
                );

                if (afterIsSuccess) {
                    done()
                } else {
                    done(new Error("After is not success"));
                }
            }, 800);
        });

        it('should pass example № 3', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: './acceptance_test_remove',
                    include: [
                        'dist3/manifest.json',
                        './dist3/maps'
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const beforeIsSuccess = (
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist3',
                    'manifest.json'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist3',
                    'maps'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist3',
                    'test.txt'
                )
            );

            expect(beforeIsSuccess).to.equal(true);
        });

        it('should pass example № 4', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                after: {
                    root: './acceptance_test_remove',
                    test: [
                        {
                            folder: 'dist4/styles',
                            method: (absoluteItemPath) => {
                                return new RegExp(/\.map$/, 'm').test(absoluteItemPath);
                            },
                            recursive: true
                        }
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runAfterEmit();

            const afterIsSuccess = (
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'test.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'styles',
                    '1.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'styles',
                    '1.map.css'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'styles',
                    'test1',
                    '1.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'styles',
                    'test1',
                    'test.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'styles',
                    'test1',
                    'test2',
                    'test file.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist4',
                    'styles',
                    'test1',
                    'test2',
                    'test.txt'
                )
            );

            expect(afterIsSuccess).to.equal(true);
        });

        it('should pass example № 5', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                after: {
                    root: './acceptance_test_remove/dist5',
                    test: [
                        {
                            folder: './styles',
                            method: (absoluteItemPath) => {
                                return new RegExp(/\.css\.map$/, 'm').test(absoluteItemPath);
                            }
                        },
                        {
                            folder: './scripts',
                            method: (absoluteItemPath) => {
                                return new RegExp(/\.js\.map$/, 'm').test(absoluteItemPath);
                            },
                            recursive: true
                        }
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runAfterEmit();

            const afterIsSuccess = (
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'test.txt'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'styles',
                    '1.css'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'styles',
                    '1.css.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'styles',
                    'test 1',
                    '1.css'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'styles',
                    'test 1',
                    '1.css.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'scripts',
                    '1.js'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'scripts',
                    '1.js.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'scripts',
                    'test 1',
                    '1.js'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'scripts',
                    'test 1',
                    '1.js.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'scripts',
                    'test 1',
                    'test 2',
                    '1.js'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist5',
                    'scripts',
                    'test 1',
                    'test 2',
                    '1.js.map'
                )
            );

            expect(afterIsSuccess).to.equal(true);
        });

        it('should pass example № 6', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: './acceptance_test_remove/dist6',
                    test: [
                        {
                            folder: './maps',
                            method: () => true,
                            recursive: true
                        }
                    ],
                    exclude: [
                        './maps/main.map.js'
                    ],
                    ...logs
                },
                after: {
                    root: './acceptance_test_remove',
                    test: [
                        {
                            folder: 'dist6/styles',
                            method: (absoluteItemPath) => {
                                return new RegExp(/\.css\.map$/, 'm').test(absoluteItemPath);
                            }
                        }
                    ],
                    exclude: [
                        'dist6/styles/popup.css.map'
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();
            webpack.runAfterEmit();

            const beforeIsSuccess = (
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'maps',
                    'test'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'test.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'maps',
                    '1.map.js'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'maps',
                    '2.map.js'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'maps',
                    'main.map.js'
                )
            );
            const afterIsSuccess = (
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    'test'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    '1.css'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    '1.css.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    'popup.css'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    'popup.css.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    'test',
                    '1.css'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'dist6',
                    'styles',
                    'test',
                    '1.css.map'
                )
            );

            expect(beforeIsSuccess).to.equal(true);
            expect(afterIsSuccess).to.equal(true);
        });

        it('should pass example № 7', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: './acceptance_test_remove',
                    include: [
                        'D:/acceptance_test_remove/test3.txt'
                    ],
                    trash: true,
                    emulate: true,
                    allowRootAndOutside: true,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const beforeIsSuccess = (
                exists(
                    'D:/acceptance_test_remove/test3.txt'
                )
            );

            expect(beforeIsSuccess).to.equal(true);
        });

        it('should pass example № 8', function () {
            const callbackCalled = {
                beforeRemove: false,
                afterRemove: false
            };
            const foldersCount = {
                rightCount: 2,
                beforeRemoveIsRight: false,
                afterRemoveIsRight: false
            };
            const filesCount = {
                rightCount: 1,
                beforeRemoveIsRight: false,
                afterRemoveIsRight: false
            };
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                after: {
                    root: './acceptance_test_remove/dist8',
                    test: [
                        {
                            folder: '.',
                            method: () => true,
                            recursive: true
                        }
                    ],
                    beforeRemove: (absoluteFoldersPaths, absoluteFilesPaths) => {
                        callbackCalled.beforeRemove = true;

                        if (absoluteFoldersPaths.length === foldersCount.rightCount) {
                            foldersCount.beforeRemoveIsRight = true;
                        }

                        if (absoluteFilesPaths.length === filesCount.rightCount) {
                            filesCount.beforeRemoveIsRight = true;
                        }
                    },
                    afterRemove: (absoluteFoldersPaths, absoluteFilesPaths) => {
                        callbackCalled.afterRemove = true;

                        if (absoluteFoldersPaths.length === foldersCount.rightCount) {
                            foldersCount.afterRemoveIsRight = true;
                        }

                        if (absoluteFilesPaths.length === filesCount.rightCount) {
                            filesCount.afterRemoveIsRight = true;
                        }
                    },
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runAfterEmit();

            expect(callbackCalled.beforeRemove).to.equal(true);
            expect(foldersCount.beforeRemoveIsRight).to.equal(true);
            expect(filesCount.beforeRemoveIsRight).to.equal(true);
            expect(callbackCalled.afterRemove).to.equal(true);
            expect(foldersCount.afterRemoveIsRight).to.equal(true);
            expect(filesCount.afterRemoveIsRight).to.equal(true);
        });
    });
});
