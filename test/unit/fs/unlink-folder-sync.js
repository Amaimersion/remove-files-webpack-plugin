const fs = require('fs');
const expect = require('chai').expect;
const Fs = require('../../../src/fs');
const Path = require('../../../src/path');


describe('unit', function () {
    describe('fs', function () {
        describe('.unlinkFolderSync()', function () {
            const instance = new Fs();
            const customPath = new Path();

            it('should throw error in case of permanent removing if folder not exists', function () {
                const method = () => instance.unlinkFolderSync({
                    pth: 'D:/fs_test_remove/not exists',
                    toTrash: false
                });

                expect(method).to.throw();
            });

            it('should permanently remove empty folder', function () {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_1',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: false
                });

                const result = fs.existsSync('D:/fs_test_folder_remove_1');
                const correct = false;

                expect(result).to.be.equal(correct);
            });

            it('should permanently remove folder with files', function () {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_2',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: false
                });

                const result = fs.existsSync('D:/fs_test_folder_remove_2');
                const correct = false;

                expect(result).to.be.equal(correct);
            });

            it('should permanently remove folder with empty folders', function () {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_3',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: false
                });

                const result = fs.existsSync('D:/fs_test_folder_remove_3');
                const correct = false;

                expect(result).to.be.equal(correct);
            });

            it('should permanently remove folder with folders', function () {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_4',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: false
                });

                const result = fs.existsSync('D:/fs_test_folder_remove_4');
                const correct = false;

                expect(result).to.be.equal(correct);
            });

            it('should remove in trash empty folder', function (done) {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_5',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: true,
                    onFolderSuccess: () => {
                        const result = fs.existsSync('D:/fs_test_folder_remove_5');
                        const correct = false;

                        expect(result).to.be.equal(correct);
                        done();
                    },
                    onFolderError: (error) => {
                        done(error);
                    }
                });
            });

            it('should remove in trash folder with files', function (done) {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_6',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: true,
                    onFolderSuccess: () => {
                        const result = fs.existsSync('D:/fs_test_folder_remove_6');
                        const correct = false;

                        expect(result).to.be.equal(correct);
                        done();
                    },
                    onFolderError: (error) => {
                        done(error);
                    }
                });
            });

            it('should remove in trash folder with empty folders', function (done) {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_7',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: true,
                    onFolderSuccess: () => {
                        const result = fs.existsSync('D:/fs_test_folder_remove_7');
                        const correct = false;

                        expect(result).to.be.equal(correct);
                        done();
                    },
                    onFolderError: (error) => {
                        done(error);
                    }
                });
            });

            it('should remove in trash folder with folders', function (done) {
                instance.unlinkFolderSync({
                    pth: 'D:/fs_test_folder_remove_8',
                    toAbsoluteS: (...args) => customPath.toAbsoluteS(...args),
                    toTrash: true,
                    onFolderSuccess: () => {
                        const result = fs.existsSync('D:/fs_test_folder_remove_8');
                        const correct = false;

                        expect(result).to.be.equal(correct);
                        done();
                    },
                    onFolderError: (error) => {
                        done(error);
                    }
                });
            });
        });
    });
});
