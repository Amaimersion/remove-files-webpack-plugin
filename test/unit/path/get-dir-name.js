const expect = require('chai').expect;
const Path = require('../../../src/path');


describe('unit', function () {
    describe('path', function () {
        describe('.getDirName()', function () {
            describe('win32', function () {
                const instance = new Path();
                instance._type = 'win32';

                it('not exists', function () {
                    const method = () => instance.getDirName({
                        pth: 'D:/path_test/path-test/PaTh TeSt/not exists',
                        escapeForRegExp: false,
                        resolve: false
                    });

                    expect(method).to.throw();
                });

                it('folder with double backward slash', function () {
                    const result = instance.getDirName({
                        pth: 'D:\\path_test\\path-test\\PaTh TeSt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: 'D:\\path_test\\path-test\\PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('file with single forward slash', function () {
                    const result = instance.getDirName({
                        pth: 'D:/path_test/path-test/PaTh TeSt/big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: 'D:/path_test/path-test/PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('file with mixed slash', function () {
                    const result = instance.getDirName({
                        pth: 'D:/path_test\\path-test/PaTh TeSt\\big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: 'D:/path_test\\path-test/PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('relative dots without resolve', function () {
                    const result = instance.getDirName({
                        pth: 'D:/path_test/../path-test/PaTh TeSt/big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: 'D:/path_test/../path-test/PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('relative dots with resolve', function () {
                    const result = instance.getDirName({
                        pth: 'D:/path_test/../path-test/PaTh TeSt/big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: true
                    });
                    const correct = {
                        dirName: 'D:\\path-test\\PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('already absolute without resolve', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: '/path_test/path-test/PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('already absolute with resolve', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt',
                        escapeForRegExp: false,
                        resolve: true
                    });
                    const correct = {
                        dirName: 'D:\\path_test\\path-test\\PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('with escape', function () {
                    const result = instance.getDirName({
                        pth: 'D:\\path_test/path-test/PaTh TeSt',
                        escapeForRegExp: true,
                        resolve: false
                    });
                    const correct = {
                        dirName: 'D:\\\\path_test\\/path\\-test\\/PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('with escape and resolve', function () {
                    const result = instance.getDirName({
                        pth: 'D:\\path_test/path-test/PaTh TeSt',
                        escapeForRegExp: true,
                        resolve: true
                    });
                    const correct = {
                        dirName: 'D:\\\\path_test\\\\path\\-test\\\\PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });
            });

            describe('posix', function () {
                const instance = new Path();
                instance._type = 'posix';

                it('not exists', function () {
                    const method = () => instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt/not exists',
                        escapeForRegExp: false,
                        resolve: false
                    });

                    expect(method).to.throw();
                });

                it('folder with single forward slash', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: '/path_test/path-test/PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('file with single forward slash', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt/big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: '/path_test/path-test/PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('relative dots without resolve', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/../path-test/PaTh TeSt/big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: '/path_test/../path-test/PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('relative dots with resolve', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/../path-test/PaTh TeSt/big + file.name.txt',
                        escapeForRegExp: false,
                        resolve: true
                    });
                    const correct = {
                        dirName: '/path-test/PaTh TeSt',
                        initiallyIsFile: true
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('already absolute without resolve', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt',
                        escapeForRegExp: false,
                        resolve: false
                    });
                    const correct = {
                        dirName: '/path_test/path-test/PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('already absolute with resolve', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt',
                        escapeForRegExp: false,
                        resolve: true
                    });
                    const correct = {
                        dirName: '/path_test/path-test/PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });

                it('with escape', function () {
                    const result = instance.getDirName({
                        pth: '/path_test/path-test/PaTh TeSt',
                        escapeForRegExp: true,
                        resolve: false
                    });
                    const correct = {
                        dirName: '\\/path_test\\/path\\-test\\/PaTh TeSt',
                        initiallyIsFile: false
                    };

                    expect(result).to.deep.equal(correct);
                });
            });
        });
    });
});
