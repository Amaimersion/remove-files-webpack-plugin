const expect = require('chai').expect;
const Path = require('../../../src/path');


describe('unit', function () {
    describe('path', function () {
        describe('.toAbsolute()', function () {
            describe('win32', function () {
                const instance = new Path();
                instance._type = 'win32';

                it('double backward slash', function () {
                    const result = instance.toAbsolute(
                        'D:\\path_test\\path-test',
                        'PaTh TeSt\\big + file.name.txt'
                    );
                    const correct = 'D:\\path_test\\path-test\\PaTh TeSt\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('single forward slash', function () {
                    const result = instance.toAbsolute(
                        'D:/path_test/path-test',
                        'PaTh TeSt/big + file.name.txt'
                    );
                    const correct = 'D:\\path_test\\path-test\\PaTh TeSt\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('mixed slash', function () {
                    const result = instance.toAbsolute(
                        'D:/path_test\\path-test/',
                        'PaTh TeSt\\big + file.name.txt'
                    );
                    const correct = 'D:\\path_test\\path-test\\PaTh TeSt\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('single relative dot', function () {
                    const result = instance.toAbsolute(
                        'D:/path_test/path-test',
                        './PaTh TeSt/big + file.name.txt'
                    );
                    const correct = 'D:\\path_test\\path-test\\PaTh TeSt\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('double relative dot', function () {
                    const result = instance.toAbsolute(
                        'D:/path_test/path-test',
                        'PaTh TeSt/../big + file.name.txt'
                    );
                    const correct = 'D:\\path_test\\path-test\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('relative dots lead abroad the disk drive', function () {
                    const result = instance.toAbsolute(
                        'D:/path_test',
                        'path-test/../../..'
                    );
                    const correct = 'D:\\';

                    expect(result).to.equal(correct);
                });

                it('mixed slash and relative dots', function () {
                    const result = instance.toAbsolute(
                        'D:\\path_test/path-test\\',
                        './PaTh TeSt/..\\big + file.name.txt'
                    );
                    const correct = 'D:\\path_test\\path-test\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('already absolute with double backward slash', function () {
                    const result = instance.toAbsolute(
                        'D:\\path_test\\path-test',
                        '\\PaTh TeSt\\big + file.name.txt'
                    );
                    const correct = '\\PaTh TeSt\\big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('already absolute with single forward slash', function () {
                    const result = instance.toAbsolute(
                        'D:\\path_test\\path-test',
                        '/PaTh TeSt/big + file.name.txt'
                    );
                    const correct = '/PaTh TeSt/big + file.name.txt';

                    expect(result).to.equal(correct);
                });
            });

            describe('posix', function () {
                const instance = new Path();
                instance._type = 'posix';

                it('single forward slash', function () {
                    const result = instance.toAbsolute(
                        '/path_test/path-test',
                        'PaTh TeSt/big + file.name.txt'
                    );
                    const correct = '/path_test/path-test/PaTh TeSt/big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('single relative dot', function () {
                    const result = instance.toAbsolute(
                        '/path_test/path-test',
                        './PaTh TeSt/big + file.name.txt'
                    );
                    const correct = '/path_test/path-test/PaTh TeSt/big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('double relative dot', function () {
                    const result = instance.toAbsolute(
                        '/path_test/path-test',
                        'PaTh TeSt/../big + file.name.txt'
                    );
                    const correct = '/path_test/path-test/big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('relative dots lead abroad the root', function () {
                    const result = instance.toAbsolute(
                        '/path_test',
                        'path-test/../../..'
                    );
                    const correct = '/';

                    expect(result).to.equal(correct);
                });

                it('mixed slash and relative dots', function () {
                    const result = instance.toAbsolute(
                        '/path_test/path-test/',
                        './PaTh TeSt/../big + file.name.txt'
                    );
                    const correct = '/path_test/path-test/big + file.name.txt';

                    expect(result).to.equal(correct);
                });

                it('already absolute', function () {
                    const result = instance.toAbsolute(
                        '/path_test/path-test',
                        '/PaTh TeSt/big + file.name.txt'
                    );
                    const correct = '/PaTh TeSt/big + file.name.txt';

                    expect(result).to.equal(correct);
                });
            });
        });

        describe('.toAbsoluteS()', function () {
            const instance = new Path();

            it('returns array with correct length', function () {
                const result = instance.toAbsoluteS(
                    'D:/path_test',
                    [
                        'test_1',
                        '/test_2'
                    ]
                );

                expect(result).to.have.lengthOf(2);
            });
        });
    });
});
