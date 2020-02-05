/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-empty-function */
/* eslint-disable no-new */
/* eslint-disable no-undef */


'use strict';


const fs = require('fs');
const expect = require('chai').expect;
const RemovePlugin = require('../src/index');
const Utils = require('../src/utils');


before(() => {
    fs.mkdirSync('D:/(test/test test/test', {
        recursive: true
    });
    fs.mkdirSync('D:/(test/test', {
        recursive: true
    });
    fs.mkdirSync('D:/test test/test', {
        recursive: true
    });
    fs.mkdirSync('D:/dist/chromium', {
        recursive: true
    });
    fs.mkdirSync('./dist/scripts', {
        recursive: true
    });
    fs.mkdirSync('D:/te)st-tes(t and te[s]t {df} df+g.df^g&t/chromium', {
        recursive: true
    });
    fs.mkdirSync('D:/test/../chromium', {
        recursive: true
    });
    fs.mkdirSync('D:/test test', {
        recursive: true
    });
    fs.mkdirSync('/test/dist', {
        recursive: true
    });
    fs.mkdirSync('/test test/dist', {
        recursive: true
    });
    fs.mkdirSync('D:\\Desktop\\test\\');
    fs.writeFileSync('D:/(test/test test/test/file .txt.txt');
    fs.writeFileSync('D:/(test/test/file .txt.txt');
    fs.writeFileSync('D:\\Desktop\\test.txt');
    fs.writeFileSync('D:/test/file.txt');
    fs.writeFileSync('D:/chromium/file.txt');
});


after(() => {
    fs.rmdirSync('D:/(test', {
        recursive: true
    });
    fs.rmdirSync('D:/test test', {
        recursive: true
    });
    fs.rmdirSync('D:/dist', {
        recursive: true
    });
    fs.rmdirSync('./dist', {
        recursive: true
    });
    fs.rmdirSync('D:/te)st-tes(t and te[s]t {df} df+g.df^g&t', {
        recursive: true
    });
    fs.rmdirSync('D:/chromium', {
        recursive: true
    });
    fs.rmdirSync('D:/test test', {
        recursive: true
    });
    fs.rmdirSync('/test', {
        recursive: true
    });
    fs.rmdirSync('/test test', {
        recursive: true
    });
    fs.rmdirSync('D:\\Desktop\\test\\', {
        recursive: true
    });
    fs.unlinkSync('D:\\Desktop\\test.txt');
});


describe('usage', () => {
    it('cannot be created without parameters', () => {
        const create = () => {
            new RemovePlugin();
        };

        expect(create).to.throw();
    });

    it('cannot be created without either "before" or "after" parameters', () => {
        const create = () => {
            new RemovePlugin({
                test: {}
            });
        };

        expect(create).to.throw();
    });

    it('can be created with "before" parameter', () => {
        const create = () => {
            new RemovePlugin({
                before: {}
            });
        };

        create();
    });

    it('can be created with "after" parameter', () => {
        const create = () => {
            new RemovePlugin({
                after: {}
            });
        };

        create();
    });

    it('can be created with both "before" and "after" parameters', () => {
        const create = () => {
            new RemovePlugin({
                before: {},
                after: {}
            });
        };

        create();
    });
});


describe('webpack', () => {
    const emulatedWebpackCompilerV4 = {
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
    };
    const emulatedWebpackCompilerV3 = {
        plugin: (hookName) => {
            if (!([
                'before-run',
                'watch-run',
                'after-emit'
            ].includes(hookName))) {
                throw new Error(`Invalid hook name - "${hookName}"`);
            }
        }
    };

    it('works with v4', () => {
        const create = () => {
            const plugin = new RemovePlugin({
                before: {}
            });

            plugin.apply(emulatedWebpackCompilerV4);
        };

        create();
    });

    it('works with v3', () => {
        const create = () => {
            const plugin = new RemovePlugin({
                before: {}
            });

            plugin.apply(emulatedWebpackCompilerV3);
        };

        create();
    });

    it('not works with invalid webpack', () => {
        const create = () => {
            const plugin = new RemovePlugin({
                before: {}
            });

            plugin.apply({});
        };

        expect(create).to.throw();
    });
});


describe('file system', () => {
    describe('windows', () => {
        const instance = new RemovePlugin({
            before: {}
        });

        describe('converting to absolute path', () => {
            it('double backslash', () => {
                const correct = 'C:\\test\\test-test\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test\\test-test', 'tE sT\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('single slash', () => {
                const correct = 'C:\\test\\test-test\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:/test/test-test', 'tE sT/big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('double backslash, single slash and relative dot', () => {
                const correct = 'C:\\test\\test-test\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test/test-test\\', './tE sT\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('double backslash, single slash and relative dots', () => {
                const correct = 'C:\\test\\test-test\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test/test-test\\', './tE sT/..\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('already absolute with double backslash', () => {
                const correct = '\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test\\test-test', '\\tE sT\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('already absolute with single slash', () => {
                const correct = '/tE sT/big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test\\test-test', '/tE sT/big + file.name.txt');

                expect(result).to.equal(correct);
            });
        });

        describe('directory name extracting', () => {
            it('nonexistent file', () => {
                const get = () => Utils.getDirName({
                    pth: 'D:/not exists/file.txt',
                    escapeForRegExp: true,
                    replaceDoubleSlash: true,
                    resolve: false
                });

                expect(get).to.throw();
            });

            it('nonexistent folder', () => {
                const get = () => Utils.getDirName({
                    pth: 'D:/not exists',
                    escapeForRegExp: true,
                    replaceDoubleSlash: true,
                    resolve: false
                });

                expect(get).to.throw();
            });

            it('folder with mixed slash', () => {
                const result = Utils.getDirName({
                    pth: 'D:/(test\\test test\\test',
                    escapeForRegExp: false,
                    replaceDoubleSlash: false,
                    resolve: false
                });
                const correct = {
                    dirName: 'D:/(test\\test test\\test',
                    initiallyIsFile: false
                };

                expect(result).to.deep.equal(correct);
            });

            it('folder with escaping', () => {
                const result = Utils.getDirName({
                    pth: 'D:/(test\\test test\\test',
                    escapeForRegExp: true,
                    replaceDoubleSlash: true,
                    resolve: false
                });
                const correct = {
                    dirName: 'D:\\/\\(test\\\\\\\\test test\\\\\\\\test',
                    initiallyIsFile: false
                };

                expect(result).to.deep.equal(correct);
            });

            it('file with mixed slash', () => {
                const result = Utils.getDirName({
                    pth: 'D:/(test\\test test\\test/file .txt.txt',
                    escapeForRegExp: false,
                    replaceDoubleSlash: false,
                    resolve: false
                });
                const correct = {
                    dirName: 'D:/(test\\test test\\test',
                    initiallyIsFile: true
                };

                expect(result).to.deep.equal(correct);
            });

            it('file with escaping', () => {
                const result = Utils.getDirName({
                    pth: 'D:/(test\\test test\\test/file .txt.txt',
                    escapeForRegExp: true,
                    replaceDoubleSlash: true,
                    resolve: false
                });
                const correct = {
                    dirName: 'D:\\/\\(test\\\\\\\\test test\\\\\\\\test',
                    initiallyIsFile: true
                };

                expect(result).to.deep.equal(correct);
            });

            it('file with resolving', () => {
                const result = Utils.getDirName({
                    pth: 'D:/(test\\test test\\..\\test/file .txt.txt',
                    escapeForRegExp: false,
                    replaceDoubleSlash: false,
                    resolve: true
                });
                const correct = {
                    dirName: 'D:\\(test\\test',
                    initiallyIsFile: true
                };

                expect(result).to.deep.equal(correct);
            });

            it('folder with resolving and escaping', () => {
                const result = Utils.getDirName({
                    pth: 'D:/(test\\..\\test test\\test',
                    escapeForRegExp: true,
                    replaceDoubleSlash: false,
                    resolve: true
                });
                const correct = {
                    dirName: 'D:\\\\test test\\\\test',
                    initiallyIsFile: false
                };

                expect(result).to.deep.equal(correct);
            });
        });

        describe('safety check', () => {
            it('nonexistent file', () => {
                const result = instance.isSave('D:/not exists', 'D:/not exists/file.txt');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('nonexistent folder', () => {
                const result = instance.isSave('D:/not exists', 'D:/not exists/folder');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('slash', () => {
                const result = instance.isSave('D:/dist', 'D:/dist/chromium');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('slash at the end', () => {
                const result = instance.isSave('D:/dist/', 'D:/dist/chromium');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('slash', () => {
                const result = instance.isSave('D:/dist', 'D:/dist');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('slash at the end', () => {
                const result = instance.isSave('D:/dist/', 'D:/dist');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('outside', () => {
                const result = instance.isSave('D:/dist', 'D:/');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('relative with slash', () => {
                const result = instance.isSave('./dist/', 'dist/scripts');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('relative without slash', () => {
                const result = instance.isSave('./dist', 'dist/scripts');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('dot with slash', () => {
                const result = instance.isSave('./', './dist/scripts');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('dot without slash', () => {
                const result = instance.isSave('.', './dist/scripts');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('file with same name as root with backslash', () => {
                const result = instance.isSave('D:\\Desktop\\test\\', 'D:\\Desktop\\test.txt');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('file with same name as root without backslash', () => {
                const result = instance.isSave('D:\\Desktop\\test', 'D:\\Desktop\\test.txt');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('regexp characters', () => {
                const result = instance.isSave('D:/te)st-tes(t and te[s]t {df} df+g.df^g&t', 'D:/te)st-tes(t and te[s]t {df} df+g.df^g&t/chromium');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('regexp characters with mixed slash', () => {
                const result = instance.isSave('D:/te)st-tes(t and te[s]t {df} df+g.df^g&t', 'D:\\te)st-tes(t and te[s]t {df} df+g.df^g&t/chromium');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('unresolved root', () => {
                const result = instance.isSave('D:/test/../chromium', 'D:/chromium/file.txt');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('unresolved path', () => {
                const result = instance.isSave('D:\\test', 'D:\\test\\..\\file.txt');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('drive working directory', () => {
                const result = instance.isSave('D:/test test', '/test/dist');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('drive working directory with same name', () => {
                const result = instance.isSave('D:/test test', '/test test');
                const correct = false;

                expect(result).to.equal(correct);
            });

            it('drive working directory with same name and folder', () => {
                const result = instance.isSave('D:/test test', '/test test/dist');
                const correct = true;

                expect(result).to.equal(correct);
            });

            it('drive working directory with mixed slash', () => {
                const result = instance.isSave('D:\\test test', '/test test\\dist');
                const correct = true;

                expect(result).to.equal(correct);
            });
        });
    });
});
