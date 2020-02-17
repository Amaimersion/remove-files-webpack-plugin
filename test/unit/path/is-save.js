const expect = require('chai').expect;
const Path = require('../../../src/path');


describe('unit', function () {
    describe('path', function () {
        describe('.isSave()', function () {
            describe('win32', function () {
                const instance = new Path();
                instance._type = 'win32';

                it('root not exists', function () {
                    const method = () => instance.isSave(
                        'D:/path_test/path-test/PaTh TeSt/not exists',
                        'D:/path_test/path-test/PaTh TeSt/big + file.name.txt'
                    );

                    expect(method).to.throw();
                });

                it('path not exists', function () {
                    const method = () => instance.isSave(
                        'D:/path_test/path-test/PaTh TeSt',
                        'D:/path_test/path-test/PaTh TeSt/not-exists.txt'
                    );

                    expect(method).to.throw();
                });

                it('double backward slash', function () {
                    const result = instance.isSave(
                        'D:\\path_test',
                        'D:\\path_test\\path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single forward slash', function () {
                    const result = instance.isSave(
                        'D:/path_test',
                        'D:/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('mixed slash', function () {
                    const result = instance.isSave(
                        'D:\\path_test',
                        'D:/path_test\\path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('slash at the end of root', function () {
                    const result = instance.isSave(
                        'D:/path_test/',
                        'D:/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot in root', function () {
                    const result = instance.isSave(
                        './path_test/',
                        'path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot in path', function () {
                    const result = instance.isSave(
                        'path_test/',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot in both', function () {
                    const result = instance.isSave(
                        './path_test',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot as root without slash', function () {
                    const result = instance.isSave(
                        '.',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot as root with slash', function () {
                    const result = instance.isSave(
                        './',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot as root with absolute path', function () {
                    const result = instance.isSave(
                        './',
                        '/path_test/path-test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('double relative dot in root', function () {
                    const result = instance.isSave(
                        'D:/path_test/../path-test',
                        'D:/path-test/PaTh TeSt/big + file.name.txt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('double relative dot in path', function () {
                    const result = instance.isSave(
                        'D:\\path-test',
                        'D:\\path_test\\..\\path-test\\PaTh TeSt\\..'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('relative dots lead abroad the root in root', function () {
                    const result = instance.isSave(
                        'D:/path-test\\..',
                        'D:/path_test/../path-test/PaTh TeSt/..'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('relative dots lead abroad the root in path', function () {
                    const result = instance.isSave(
                        'D:\\path-test',
                        'D:\\path_test\\..\\path-test\\PaTh TeSt\\..\\..\\..'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('same', function () {
                    const result = instance.isSave(
                        'D:/path_test',
                        'D:/path_test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('same with slash at the end of root', function () {
                    const result = instance.isSave(
                        'D:\\path_test\\',
                        'D:\\path_test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('same with file and different slash', function () {
                    const result = instance.isSave(
                        'D:/path-test',
                        'D:\\path-test\\big + file.name.txt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('folder with space', function () {
                    const result = instance.isSave(
                        'D:\\path_test\\test',
                        'D:\\path_test\\test test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('outside of root', function () {
                    const result = instance.isSave(
                        'D:/path_test',
                        'D:/'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('absolute root', function () {
                    const result = instance.isSave(
                        '/path-test',
                        'path-test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('absolute path', function () {
                    const result = instance.isSave(
                        'path_test',
                        '/path-test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('both absolute', function () {
                    const result = instance.isSave(
                        '/path-test',
                        '/path-test/PaTh TeSt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('local disk root and absolute path', function () {
                    const result = instance.isSave(
                        'D:/path_test',
                        '/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('local disk root and absolute path with same name', function () {
                    const result = instance.isSave(
                        'D:/path_test/',
                        '/path_test/'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('local disk root and absolute path with same name and folder', function () {
                    const result = instance.isSave(
                        'D:/path_test/',
                        '/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('different local disks', function () {
                    const result = instance.isSave(
                        'D:/path_test',
                        'C:/Windows'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('file with same name as root', function () {
                    const result = instance.isSave(
                        'D:/path test',
                        'D:/path test.txt'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('file with same name as root with slash', function () {
                    const result = instance.isSave(
                        'D:\\path test\\',
                        'D:\\path test.txt'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('regexp characters', function () {
                    const result = instance.isSave(
                        'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th',
                        'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('regexp characters with mixed slash and file', function () {
                    const result = instance.isSave(
                        'D:/path_test/pa)t-h (t [e]s {t} +\\Pa.^&th',
                        'D:\\path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test.txt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('regexp characters with mixed slash and same path with slash at the end', function () {
                    const result = instance.isSave(
                        'D:/path_test/pa)t-h (t [e]s {t} +\\Pa.^&th',
                        'D:\\path_test/pa)t-h (t [e]s {t} +/Pa.^&th/'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });
            });

            describe('posix', function () {
                const instance = new Path();
                instance._type = 'posix';

                it('root not exists', function () {
                    const method = () => instance.isSave(
                        '/path_test/path-test/PaTh TeSt/not exists',
                        '/path_test/path-test/PaTh TeSt/big + file.name.txt'
                    );

                    expect(method).to.throw();
                });

                it('path not exists', function () {
                    const method = () => instance.isSave(
                        '/path_test/path-test/PaTh TeSt',
                        '/path_test/path-test/PaTh TeSt/not-exists.txt'
                    );

                    expect(method).to.throw();
                });

                it('single forward slash', function () {
                    const result = instance.isSave(
                        '/path_test',
                        '/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('slash at the end of root', function () {
                    const result = instance.isSave(
                        '/path_test/',
                        '/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot in root', function () {
                    const result = instance.isSave(
                        './path_test/',
                        'path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot in path', function () {
                    const result = instance.isSave(
                        'path_test/',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot in both', function () {
                    const result = instance.isSave(
                        './path_test',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot as root without slash', function () {
                    const result = instance.isSave(
                        '.',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot as root with slash', function () {
                    const result = instance.isSave(
                        './',
                        './path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('single relative dot as root with absolute path', function () {
                    const result = instance.isSave(
                        './',
                        '/path_test/path-test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('double relative dot in root', function () {
                    const result = instance.isSave(
                        '/path_test/../path-test',
                        '/path-test/PaTh TeSt/big + file.name.txt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('double relative dot in path', function () {
                    const result = instance.isSave(
                        '/path-test',
                        '/path_test/../path-test/PaTh TeSt/..'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('relative dots lead abroad the root in root', function () {
                    const result = instance.isSave(
                        '/path-test/..',
                        '/path_test/../path-test/PaTh TeSt/..'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('relative dots lead abroad the root in path', function () {
                    const result = instance.isSave(
                        '/path-test',
                        '/path_test/../path-test/PaTh TeSt/../../..'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('same', function () {
                    const result = instance.isSave(
                        '/path_test',
                        '/path_test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('same with slash at the end of root', function () {
                    const result = instance.isSave(
                        '/path_test/',
                        '/path_test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('same with file', function () {
                    const result = instance.isSave(
                        '/path-test',
                        '/path-test/big + file.name.txt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('folder with space', function () {
                    const result = instance.isSave(
                        '/path_test/test',
                        '/path_test/test test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('outside of root', function () {
                    const result = instance.isSave(
                        '/path_test',
                        '/'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('absolute root', function () {
                    const result = instance.isSave(
                        '/path-test',
                        'path-test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('absolute path', function () {
                    const result = instance.isSave(
                        'path_test',
                        '/path-test'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('both absolute', function () {
                    const result = instance.isSave(
                        '/path-test',
                        '/path-test/PaTh TeSt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('absolute root and absolute path with same name', function () {
                    const result = instance.isSave(
                        '/path_test',
                        '/path_test/'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('absolute root and absolute path with same name and folder', function () {
                    const result = instance.isSave(
                        '/path_test/',
                        '/path_test/path-test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('file with same name as root', function () {
                    const result = instance.isSave(
                        '/path test',
                        '/path test.txt'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('file with same name as root with slash', function () {
                    const result = instance.isSave(
                        '/path test/',
                        '/path test.txt'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });

                it('regexp characters', function () {
                    const result = instance.isSave(
                        '/path_test/pa)t-h (t [e]s {t} +/Pa.^&th',
                        '/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('regexp characters with file', function () {
                    const result = instance.isSave(
                        '/path_test/pa)t-h (t [e]s {t} +/Pa.^&th',
                        '/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test.txt'
                    );
                    const correct = true;

                    expect(result).to.equal(correct);
                });

                it('regexp characters with same path with slash at the end', function () {
                    const result = instance.isSave(
                        '/path_test/pa)t-h (t [e]s {t} +/Pa.^&th',
                        '/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/'
                    );
                    const correct = false;

                    expect(result).to.equal(correct);
                });
            });
        });
    });
});
