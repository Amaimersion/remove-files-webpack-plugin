const path = require('path');
const expect = require('chai').expect;
const Path = require('../../../src/path');


describe('unit', function () {
    describe('path', function () {
        describe('path', function () {
            describe('getter', function () {
                const instance = new Path();

                // should go before any setters usage!
                it('auto', function () {
                    expect(instance.path.sep).to.equal(path.sep);
                });

                it('win32', function () {
                    instance.type = 'win32';

                    expect(instance.path.sep).to.equal(path.win32.sep);
                });

                it('posix', function () {
                    instance.type = 'posix';

                    expect(instance.path.sep).to.equal(path.posix.sep);
                });
            });
        });
    });
});
