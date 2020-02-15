const fs = require('fs');
const expect = require('chai').expect;
const Fs = require('../../../src/fs');


describe('unit', function () {
    describe('fs', function () {
        describe('.unlinkFileSync()', function () {
            const instance = new Fs();

            it('should not throw error in case of permanent removing if file not exists', function () {
                const method = () => instance.unlinkFileSync({
                    pth: 'D:/fs_test_file_remove/not exists.txt',
                    toTrash: false
                });

                expect(method).to.not.throw();
            });

            it('should not throw error in case of removing in trash if file not exists', function () {
                const method = () => instance.unlinkFileSync({
                    pth: 'D:/fs_test_file_remove/not exists.txt',
                    toTrash: true
                });

                expect(method).to.not.throw();
            });

            it('should permanently remove file', function () {
                instance.unlinkFileSync({
                    pth: 'D:/fs_test_file_remove/1 pa)t-h (t [e]s {t} + file.name.txt',
                    toTrash: false,
                    onError: (error) => {
                        throw new Error(error);
                    }
                });

                const result = fs.existsSync('D:/fs_test_file_remove/1 pa)t-h (t [e]s {t} + file.name.txt');
                const correct = false;

                expect(result).to.be.equal(correct);
            });

            it('should remove file in trash', function (done) {
                instance.unlinkFileSync({
                    pth: 'D:/fs_test_file_remove/2 pa)t-h (t [e]s {t} + file.name.txt',
                    toTrash: true,
                    onSuccess: () => {
                        const result = fs.existsSync('D:/fs_test_file_remove/2 pa)t-h (t [e]s {t} + file.name.txt');
                        const correct = false;

                        expect(result).to.be.equal(correct);
                        done();
                    },
                    onError: (error) => {
                        done(error);
                    }
                });
            });
        });
    });
});
