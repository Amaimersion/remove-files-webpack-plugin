const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const Webpack = require('../webpack');
const RemovePlugin = require('../..');


describe('acceptance', function () {
    describe('small', function () {
        const logs = {
            log: false,
            logWarning: true,
            logError: true,
            logDebug: false
        };

        it('should run beforeRun hook without trash', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    include: [
                        './acceptance_test_remove/test1.txt',
                        './acceptance_test_remove/test1'
                    ],
                    trash: false,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const fileExists = fs.existsSync(
                path.resolve(
                    '.',
                    'acceptance_test_remove',
                    'test1.txt'
                )
            );
            const folderExists = fs.existsSync(
                path.resolve(
                    '.',
                    'acceptance_test_remove',
                    'test1'
                )
            );

            expect(fileExists).to.equal(false);
            expect(folderExists).to.equal(false);
        });

        it('should run watchRun hook with trash', function (done) {
            this.timeout(1000);

            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    include: [
                        './acceptance_test_remove/test2.txt',
                        './acceptance_test_remove/test2'
                    ],
                    trash: true,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runWatchRun();

            setTimeout(() => {
                const fileExists = fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test2.txt'
                    )
                );
                const folderExists = fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test2'
                    )
                );

                if (fileExists) {
                    done(new Error('File exists'));
                } else if (folderExists) {
                    done(new Error('Folder exists'));
                } else {
                    done();
                }
            }, 800);
        });

        it('should run afterEmit hook without trash', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                after: {
                    include: [
                        './acceptance_test_remove/test3.txt',
                        './acceptance_test_remove/test3'
                    ],
                    trash: false,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runAfterEmit();

            const fileExists = fs.existsSync(
                path.resolve(
                    '.',
                    'acceptance_test_remove',
                    'test3.txt'
                )
            );
            const folderExists = fs.existsSync(
                path.resolve(
                    '.',
                    'acceptance_test_remove',
                    'test3'
                )
            );

            expect(fileExists).to.equal(false);
            expect(folderExists).to.equal(false);
        });

        it('should run afterEmit hook with trash', function (done) {
            this.timeout(1000);

            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                after: {
                    include: [
                        './acceptance_test_remove/test4.txt',
                        './acceptance_test_remove/test4'
                    ],
                    trash: true,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runAfterEmit();

            setTimeout(() => {
                const fileExists = fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test4.txt'
                    )
                );
                const folderExists = fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test4'
                    )
                );

                if (fileExists) {
                    done(new Error('File exists'));
                } else if (folderExists) {
                    done(new Error('Folder exists'));
                } else {
                    done();
                }
            }, 800);
        });

        it('should run both beforeRun and afterEmit hooks', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    include: [
                        './acceptance_test_remove/test5.txt',
                        './acceptance_test_remove/test5'
                    ],
                    trash: false,
                    ...logs
                },
                after: {
                    include: [
                        './acceptance_test_remove/test6.txt',
                        './acceptance_test_remove/test6'
                    ],
                    trash: false,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();
            webpack.runAfterEmit();

            const filesExists = (
                fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test5.txt'
                    )
                ) ||
                fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test6.txt'
                    )
                )
            );
            const foldersExists = fs.existsSync(
                fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test5'
                    )
                ) ||
                fs.existsSync(
                    path.resolve(
                        '.',
                        'acceptance_test_remove',
                        'test6'
                    )
                )
            );

            expect(filesExists).to.equal(false);
            expect(foldersExists).to.equal(false);
        });

        it('should remove file that is outside the root', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: '.',
                    include: [
                        'D:/acceptance_test_remove/test1.txt'
                    ],
                    allowRootAndOutside: true,
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const fileExists = fs.existsSync(
                'D:/acceptance_test_remove/test1.txt'
            );

            expect(fileExists).to.equal(false);
        });

        it('should not remove file that is outside the root', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: '.',
                    include: [
                        'D:/acceptance_test_remove/test2.txt'
                    ],
                    allowRootAndOutside: false,
                    ...logs,
                    logWarning: false
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const fileExists = fs.existsSync(
                'D:/acceptance_test_remove/test2.txt'
            );

            expect(fileExists).to.equal(true);
        });

        it('should not remove root', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: '.',
                    include: [
                        '.'
                    ],
                    allowRootAndOutside: false,
                    beforeRemove: (folders) => {
                        if (folders.length || files.length) {
                            throw new Error("Dangerous!");
                        }
                    },
                    ...logs,
                    logWarning: false
                }
            });

            instance.apply(webpack);

            const run = () => {
                webpack.runBeforeRun();
            };

            expect(run).not.to.throw();
        });

        it('should not conflict when both include and test are provided', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: './acceptance_test_remove/test7',
                    include: [
                        'test',
                        'test.txt'
                    ],
                    test: [
                        {
                            folder: '.',
                            method: () => true,
                            recursive: true
                        }
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const fileExists = fs.existsSync(
                path.resolve(
                    '.',
                    'acceptance_test_remove',
                    'test7',
                    'test.txt'
                )
            );
            const folderExists = fs.existsSync(
                path.resolve(
                    '.',
                    'acceptance_test_remove',
                    'test7',
                    'test'
                )
            );

            expect(fileExists).to.equal(false);
            expect(folderExists).to.equal(false);
        });
    });
});
