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
                this.timeout(1000);

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
                }, 800);
            });

            it('should remove folders and files', function () {
                const instance = new Plugin({
                    watch: {
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

                instance.handleRemove(instance.watchParams);

                const folderExists = fs.existsSync('./plugin_test_remove/test2');
                const fileExists = fs.existsSync('./plugin_test_remove/test2.txt');

                expect(folderExists).to.equal(false);
                expect(fileExists).to.equal(false);
            });

            it('should remove folders and files to trash', function (done) {
                // trash removing is async, not sync.
                this.timeout(1000);

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
                }, 800);
            });

            it('should call beforeRemove and afterRemove', function () {
                let beforeRemoveIsCalled = false;
                let afterRemoveIsCalled = false;
                const instance = new Plugin({
                    before: {
                        root: './plugin_test_remove',
                        trash: false,
                        include: [
                            'test4.txt',
                            'test5.txt',
                            'test4'
                        ],
                        beforeRemove: (folders, files) => {
                            expect(folders).to.have.lengthOf(1);
                            expect(files).to.have.lengthOf(2);

                            beforeRemoveIsCalled = true;
                        },
                        afterRemove: (folders, files) => {
                            expect(folders).to.have.lengthOf(1);
                            expect(files).to.have.lengthOf(2);

                            afterRemoveIsCalled = true;
                        }
                    }
                });

                instance.handleRemove(instance.beforeParams);

                const folderExists = fs.existsSync('./plugin_test_remove/test4');
                const filesExists = (
                    fs.existsSync('./plugin_test_remove/test4.txt') &&
                    fs.existsSync('./plugin_test_remove/test5.txt')
                );

                expect(beforeRemoveIsCalled).to.equal(true);
                expect(afterRemoveIsCalled).to.equal(true);
                expect(folderExists).to.equal(false);
                expect(filesExists).to.equal(false);
            });

            it('should call beforeRemove and cancel removing', function () {
                let beforeRemoveIsCalled = false;
                const instance = new Plugin({
                    watch: {
                        root: './plugin_test_remove',
                        trash: false,
                        include: [
                            'test6.txt'
                        ],
                        beforeRemove: (folders, files) => {
                            expect(folders).to.have.lengthOf(0);
                            expect(files).to.have.lengthOf(1);

                            beforeRemoveIsCalled = true;

                            return true;
                        }
                    }
                });

                instance.handleRemove(instance.watchParams);

                const fileExists = fs.existsSync('./plugin_test_remove/test6.txt');

                expect(beforeRemoveIsCalled).to.equal(true);
                expect(fileExists).to.equal(true);
            });
        });
    });
});
