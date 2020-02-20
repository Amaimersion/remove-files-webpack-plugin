const fs = require('fs');
const expect = require('chai').expect;
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('.handleRemove()', function () {
            it('should not remove when emulate parameter is on', function () {
                const instance = new Plugin({
                    before: {
                        root: './plugin_test_remove',
                        allowRootAndOutside: false,
                        emulate: true,
                        trash: false,
                        include: [
                            'test1.txt',
                            'test1'
                        ]
                    }
                });

                instance.handleRemove(instance.beforeParams);

                const folderExists = fs.existsSync('./plugin_test_remove/test1');
                const fileExists = fs.existsSync('./plugin_test_remove/test1.txt');

                expect(folderExists).to.equal(true);
                expect(fileExists).to.equal(true);
            });

            it('should not remove when both emulate and trash parameters is on', function (done) {
                // trash removing is async, not sync.
                this.timeout(4000);

                const instance = new Plugin({
                    after: {
                        root: './plugin_test_remove',
                        allowRootAndOutside: false,
                        emulate: true,
                        trash: true,
                        include: [
                            'test1.txt',
                            'test1'
                        ]
                    }
                });

                instance.handleRemove(instance.afterParams);

                setTimeout(() => {
                    const folderExists = fs.existsSync('./plugin_test_remove/test1');
                    const fileExists = fs.existsSync('./plugin_test_remove/test1.txt');

                    if (folderExists && fileExists) {
                        done();
                    } else {
                        if (!folderExists) {
                            done(new Error('Folder not exists'));
                        } else {
                            done(new Error('File not exists'));
                        }
                    }
                }, 2000);
            });

            it('should remove folders and files', function () {
                const instance = new Plugin({
                    before: {
                        root: './plugin_test_remove',
                        allowRootAndOutside: false,
                        emulate: false,
                        trash: false,
                        test: [
                            {
                                folder: '.',
                                method: (pth) => pth.includes('test2.txt')
                            },
                            {
                                folder: '.',
                                method: (pth) => pth.includes('test2')
                            }
                        ]
                    }
                });

                instance.handleRemove(instance.beforeParams);

                const folderExists = fs.existsSync('./plugin_test_remove/test2');
                const fileExists = fs.existsSync('./plugin_test_remove/test2.txt');

                expect(folderExists).to.equal(false);
                expect(fileExists).to.equal(false);
            });

            it('should remove folders and files to trash', function (done) {
                // trash removing is async, not sync.
                this.timeout(4000);

                const instance = new Plugin({
                    after: {
                        root: './plugin_test_remove',
                        allowRootAndOutside: false,
                        emulate: false,
                        trash: true,
                        test: [
                            {
                                folder: '.',
                                method: (pth) => pth.includes('test3.txt')
                            },
                            {
                                folder: '.',
                                method: (pth) => pth.includes('test3')
                            }
                        ]
                    }
                });

                instance.handleRemove(instance.afterParams);

                setTimeout(() => {
                    const folderExists = fs.existsSync('./plugin_test_remove/test3');
                    const fileExists = fs.existsSync('./plugin_test_remove/test3.txt');

                    if (!folderExists && !fileExists) {
                        done();
                    } else {
                        if (folderExists) {
                            done(new Error('Folder exists'));
                        } else {
                            done(new Error('File exists'));
                        }
                    }
                }, 2000);
            });
        });
    });
});
