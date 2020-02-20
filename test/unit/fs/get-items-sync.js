const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const Fs = require('../../../src/fs');


describe('unit', function () {
    describe('fs', function () {
        describe('.getItemsSync()', function () {
            const instance = new Fs();

            it('should throw an error if folder not exists', function () {
                const method = () => instance.getItemsSync({
                    pth: 'D:/fs_test/not exists'
                });

                expect(method).to.throw();
            });

            it('should return all root files', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: false
                });
                const correct = [
                    'D:\\fs_test\\test_1.txt',
                    'D:\\fs_test\\test 2.txt',
                    'D:\\fs_test\\test-3.bin',
                ];

                expect(result).to.have.members(correct);
            });

            it('should return all files from root and nested folders', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: true
                });
                const correct = [
                    'D:\\fs_test\\test_1.txt',
                    'D:\\fs_test\\test 2.txt',
                    'D:\\fs_test\\test-3.bin',
                    'D:\\fs_test\\fs-test\\test_1.txt',
                    'D:\\fs_test\\fs-test\\test-2.bin',
                    'D:\\fs_test\\fs test\\test 1.bin',
                    'D:\\fs_test\\fs test\\test 2.txt',
                    'D:\\fs_test\\fs_test\\fs_test\\test_1.txt',
                    'D:\\fs_test\\fs_test\\fs_test\\test_2.test'
                ];

                expect(result).to.have.members(correct);
            });

            it('should return files that passed the test № 1', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: true,
                    test: (absolutePath) => {
                        return (
                            absolutePath.includes('.txt') ||
                            absolutePath.includes('.test')
                        );
                    }
                });
                const correct = [
                    'D:\\fs_test\\test_1.txt',
                    'D:\\fs_test\\test 2.txt',
                    'D:\\fs_test\\fs-test\\test_1.txt',
                    'D:\\fs_test\\fs test\\test 2.txt',
                    'D:\\fs_test\\fs_test\\fs_test\\test_1.txt',
                    'D:\\fs_test\\fs_test\\fs_test\\test_2.test'
                ];

                expect(result).to.have.members(correct);
            });

            it('should return files that passed the test № 2', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: true,
                    test: (absolutePath) => {
                        return new RegExp(
                            /([^:])(\\fs(-|_)test\\)([^\.]*\.(?!test))/,
                            ''
                        ).test(absolutePath);
                    }
                });
                const correct = [
                    'D:\\fs_test\\fs-test\\test_1.txt',
                    'D:\\fs_test\\fs-test\\test-2.bin',
                    'D:\\fs_test\\fs_test\\fs_test\\test_1.txt'
                ];

                expect(result).to.have.members(correct);
            });

            it('should return folders that passed the test № 1', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: false,
                    test: (absolutePath) => (
                        absolutePath.includes('fs-test') ||
                        absolutePath.includes('fs test')
                    )
                });
                const correct = [
                    'D:\\fs_test\\fs-test',
                    'D:\\fs_test\\fs test'
                ];

                expect(result).to.have.members(correct);
            });

            it('should return folders that passed the test № 2', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: true,
                    test: (absolutePath) => fs.statSync(absolutePath).isDirectory()
                });
                const correct = [
                    'D:\\fs_test\\fs-test',
                    'D:\\fs_test\\fs test',
                    'D:\\fs_test\\fs_test'
                ];

                expect(result).to.have.members(correct);
            });

            it('should return folders and files that passed the test', function () {
                const result = instance.getItemsSync({
                    pth: 'D:/fs_test/',
                    join: path.join,
                    recursive: true,
                    test: (absolutePath) => (
                        absolutePath.includes('fs_test\\fs_test') ||
                        absolutePath.includes('fs_test\\fs-test') ||
                        absolutePath.includes('test_1')
                    )
                });
                const correct = [
                    'D:\\fs_test\\fs-test',
                    'D:\\fs_test\\fs_test',
                    'D:\\fs_test\\test_1.txt'
                ];

                expect(result).to.have.members(correct);
            });
        });
    });
});
