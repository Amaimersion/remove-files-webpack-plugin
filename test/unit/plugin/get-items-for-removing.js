const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('.getItemsForRemoving()', function () {
            const toAbsolute = (items) => path.resolve('.', ...items);

            it('should correctly handle include', function () {
                const instance = new Plugin({
                    before: {
                        include: [
                            './plugin_test/test',
                            './plugin_test\\test.txt',
                            'plugin_test\\test.jpg'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([
                    toAbsolute(['plugin_test', 'test'])
                ]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test.jpg'])
                ]);
            });

            it('should correctly handle test', function () {
                const instance = new Plugin({
                    after: {
                        test: [
                            {
                                folder: './plugin_test',
                                recursive: false,
                                method: (absoluteItemPath) => {
                                    return (
                                        absoluteItemPath === toAbsolute(['plugin_test', 'test.txt']) ||
                                        absoluteItemPath === toAbsolute(['plugin_test', 'test.jpg'])
                                    );
                                }
                            }
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.afterParams);

                expect(result.directories).to.have.members([]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test.jpg'])
                ]);
            });

            it('should correctly handle exclude', function () {
                const instance = new Plugin({
                    before: {
                        root: 'plugin_test',
                        include: [
                            'test.txt',
                            'test test.txt'
                        ],
                        test: [
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => {
                                    return (
                                        absoluteItemPath.includes('.png') ||
                                        absoluteItemPath.includes('.jpg')
                                    );
                                }
                            }
                        ],
                        exclude: [
                            'test',
                            'test test.txt'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test.jpg']),
                    toAbsolute(['plugin_test', 'test', 'test.png'])
                ]);
            });

            it('should skip not existed folders or files', function () {
                const instance = new Plugin({
                    before: {
                        include: [
                            './plugin_test/test',
                            './plugin_test/not exists',
                            './plugin_test/not exists.txt'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([
                    toAbsolute(['plugin_test', 'test'])
                ]);
            });

            it('should skip unsafe folders or files', function () {
                const instance = new Plugin({
                    before: {
                        allowRootAndOutside: false,
                        include: [
                            path.resolve('.'),
                            'D:\\plugin_test/test.txt',
                            'D:/plugin_test\\test'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([]);
                expect(result.files).to.have.members([]);
            });

            it('should allow unsafe folders or files', function () {
                const instance = new Plugin({
                    before: {
                        allowRootAndOutside: true,
                        include: [
                            '.',
                            'D:\\plugin_test/test.txt',
                            'D:/plugin_test\\test'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([
                    path.resolve('.'),
                    'D:\\plugin_test\\test'
                ]);
                expect(result.files).to.have.members([
                    'D:\\plugin_test\\test.txt'
                ]);
            });

            it('should skip unnecessary folders or files', function () {
                const instance = new Plugin({
                    after: {
                        root: 'plugin_test',
                        include: [
                            'test.txt',
                            './test',
                            '.\\test\\test',
                            './test/test.txt',
                            '.\\test/test.png'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.afterParams);

                expect(result.directories).to.have.members([
                    toAbsolute(['plugin_test', 'test'])
                ]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt'])
                ]);
            });

            it('should handle tricky paths', function () {
                const instance = new Plugin({
                    after: {
                        root: './plugin_test\\..',
                        allowRootAndOutside: false,
                        include: [
                            '.',
                            'plugin_test\\test\\../test.txt',
                            '.\\plugin_test/test test.txt'
                        ],
                        test: [
                            {
                                folder: 'plugin_test',
                                recursive: false,
                                method: (absoluteItemPath) => absoluteItemPath.includes('.txt')
                            },
                            {
                                folder: './plugin_test\\../plugin_test\\test\\',
                                recursive: false,
                                method: () => true
                            }
                        ],
                        exclude: [
                            './plugin_test/../plugin_test/test test.txt',
                            'plugin_test\\test/test.png'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.afterParams);

                expect(result.directories).to.have.members([
                    toAbsolute(['plugin_test', 'test', 'test'])
                ]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test', 'test.txt'])
                ]);
            });

            it('should handle test with folders and files', function () {
                const instance = new Plugin({
                    after: {
                        root: 'plugin_test',
                        allowRootAndOutside: false,
                        include: [],
                        test: [
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => fs.statSync(absoluteItemPath).isDirectory()
                            },
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => fs.statSync(absoluteItemPath).isFile()
                            }
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.afterParams);

                expect(result.directories).to.have.members([
                    toAbsolute(['plugin_test', 'test'])
                ]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test test.txt']),
                    toAbsolute(['plugin_test', 'test.jpg'])
                ]);
            });

            it('should handle test № 1 with folders, files and exclude', function () {
                const instance = new Plugin({
                    before: {
                        root: 'plugin_test',
                        allowRootAndOutside: false,
                        include: [],
                        test: [
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => fs.statSync(absoluteItemPath).isDirectory()
                            },
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => fs.statSync(absoluteItemPath).isFile()
                            }
                        ],
                        exclude: [
                            './test test.txt',
                            './test/test'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test.jpg']),
                    toAbsolute(['plugin_test', 'test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test', 'test.png']),
                    toAbsolute(['plugin_test', 'test', 'test', 'test.bin'])
                ]);
            });

            it('should handle test № 2 with folders, files and exclude', function () {
                const instance = new Plugin({
                    before: {
                        root: 'plugin_test',
                        allowRootAndOutside: false,
                        include: [],
                        test: [
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => fs.statSync(absoluteItemPath).isDirectory()
                            },
                            {
                                folder: '.',
                                recursive: true,
                                method: (absoluteItemPath) => fs.statSync(absoluteItemPath).isFile()
                            }
                        ],
                        exclude: [
                            './test test.txt',
                            './test'
                        ]
                    }
                });
                const result = instance.getItemsForRemoving(instance.beforeParams);

                expect(result.directories).to.have.members([
                    toAbsolute(['plugin_test', 'test', 'test'])
                ]);
                expect(result.files).to.have.members([
                    toAbsolute(['plugin_test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test.jpg']),
                    toAbsolute(['plugin_test', 'test', 'test.txt']),
                    toAbsolute(['plugin_test', 'test', 'test.png'])
                ]);
            });
        });
    });
});
