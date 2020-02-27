const expect = require('chai').expect;
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('.handleTest()', function () {
            it('should return empty list if test parameters not specified', function () {
                const instance = new Plugin({
                    before: {}
                });
                const result = instance.handleTest(instance.beforeParams);

                expect(result).to.have.lengthOf(0);
            });

            it('should return empty list if test parameters is empty', function () {
                const instance = new Plugin({
                    after: {
                        test: []
                    }
                });
                const result = instance.handleTest(instance.afterParams);

                expect(result).to.have.lengthOf(0);
            });

            it('should skip not existed folders', function () {
                const instance = new Plugin({
                    before: {
                        test: [
                            {
                                folder: './plugin_test/not exists',
                                method: () => true
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.beforeParams);

                expect(result).to.have.lengthOf(0);
            });

            it('should skip folders that not actually folders', function () {
                const instance = new Plugin({
                    before: {
                        test: [
                            {
                                folder: './plugin_test/test.txt',
                                method: () => true
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.beforeParams);

                expect(result).to.have.lengthOf(0);
            });

            it('should not allow unsafe removing', function () {
                const instance = new Plugin({
                    after: {
                        root: '.',
                        allowRootAndOutside: false,
                        test: [
                            {
                                folder: 'D:/plugin_test',
                                method: () => true
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.afterParams);

                expect(result).to.have.lengthOf(0);
            });

            it('should allow unsafe removing', function () {
                const instance = new Plugin({
                    watch: {
                        root: '.',
                        allowRootAndOutside: true,
                        test: [
                            {
                                folder: 'D:/plugin_test',
                                method: () => true
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.watchParams);

                expect(result).not.to.have.lengthOf(0);
            });

            it('should handle unrecursive mode', function () {
                const instance = new Plugin({
                    before: {
                        test: [
                            {
                                folder: './plugin_test',
                                recursive: false,
                                method: (absoluteItemPath) => absoluteItemPath.includes('.txt')
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.beforeParams);

                expect(result).to.have.lengthOf(2);
            });

            it('should handle recursive mode', function () {
                const instance = new Plugin({
                    after: {
                        test: [
                            {
                                folder: 'plugin_test',
                                recursive: true,
                                method: (absoluteItemPath) => (
                                    absoluteItemPath.includes('.jpg') ||
                                    absoluteItemPath.includes('.png')
                                )
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.afterParams);

                expect(result).to.have.lengthOf(2);
            });

            it('should handle several tests', function () {
                const instance = new Plugin({
                    watch: {
                        root: '.',
                        allowRootAndOutside: true,
                        test: [
                            {
                                folder: 'plugin_test',
                                recursive: false,
                                method: (absoluteItemPath) => absoluteItemPath.includes('.txt')
                            },
                            {
                                folder: 'plugin_test/test',
                                recursive: false,
                                method: (absoluteItemPath) => absoluteItemPath.includes('.png')
                            },
                            {
                                folder: 'D:/plugin_test',
                                method: () => true
                            }
                        ]
                    }
                });
                const result = instance.handleTest(instance.watchParams);

                expect(result).to.have.lengthOf(5);
            });
        });
    });
});
