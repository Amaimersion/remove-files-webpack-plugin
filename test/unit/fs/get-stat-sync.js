const fs = require('fs');
const expect = require('chai').expect;
const Fs = require('../../../src/fs');


describe('unit', function () {
    describe('fs', function () {
        describe('.getStatSync()', function () {
            const instance = new Fs();

            it('should return undefined if path not exists', function () {
                const result = instance.getStatSync('D:/fs_test/not exists');

                expect(result).to.be.undefined;
            });

            it('should return stats if folder exists', function () {
                const result = instance.getStatSync('D:/fs_test/fs-test');

                expect(result).to.be.an.instanceOf(fs.Stats);
            });

            it('should return stats if file exists', function () {
                const result = instance.getStatSync('D:/fs_test/test_1.txt');

                expect(result).to.be.an.instanceOf(fs.Stats);
            });
        });
    });
});
