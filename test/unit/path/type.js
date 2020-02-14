const expect = require('chai').expect;
const Path = require('../../../src/path');


describe('unit', function () {
    describe('path', function () {
        describe('type', function () {
            describe('getter', function () {
                const instance = new Path();

                it('works once', function () {
                    instance._type = 'win32';

                    expect(instance.type).to.equal('win32');
                });

                it('works twice', function () {
                    instance._type = 'posix';

                    expect(instance.type).to.equal('posix');
                });
            });

            describe('setter', function () {
                const instance = new Path();

                it('works once', function () {
                    instance.type = 'win32';

                    expect(instance.type).to.equal('win32');
                });

                it('works twice', function () {
                    instance.type = 'posix';

                    expect(instance.type).to.equal('posix');
                });
            });
        });
    });
});
