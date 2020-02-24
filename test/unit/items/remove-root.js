const expect = require('chai').expect;
const Items = require('../../../src/items');


describe('unit', function () {
    describe('items', function () {
        describe('.removeRoot()', function () {
            const instance = new Items();

            it('should remove backward slash in directories', function () {
                instance.directories = [
                    'D:\\items_test\\',
                    'D:\\items_test\\test_1',
                    'D:\\items_test\\test_2\\test_3'
                ];
                instance.files = [];

                instance.removeRoot('D:\\items_test\\');

                expect(instance.directories).to.have.members([
                    '',
                    'test_1',
                    'test_2\\test_3'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should remove forward slash in files', function () {
                instance.directories = [];
                instance.files = [
                    '/items_test/test_1.txt',
                    '/items_test/test_1/test_2.bin',
                    '/items_test/test_2/test_3/test_3.txt'
                ];

                instance.removeRoot('/items_test/');

                expect(instance.directories).to.have.members([]);
                expect(instance.files).to.have.members([
                    'test_1.txt',
                    'test_1/test_2.bin',
                    'test_2/test_3/test_3.txt'
                ]);
            });

            it('should remove mixed slash in both directories and files', function () {
                instance.directories = [
                    'D:\\items_test\\',
                    'D:\\items_test\\items_test',
                    'D:\\items_test\\items_test/test_3'
                ];
                instance.files = [
                    '/items_test/items_test.txt',
                    '/items_test/items_test/test_2.bin',
                    '/items_test/items_test/test_3\\test_3.txt'
                ];

                instance.removeRoot('D:\\items_test\\');
                instance.removeRoot('/items_test/');

                expect(instance.directories).to.have.members([
                    '',
                    'items_test',
                    'items_test/test_3'
                ]);
                expect(instance.files).to.have.members([
                    'items_test.txt',
                    'items_test/test_2.bin',
                    'items_test/test_3\\test_3.txt'
                ]);
            });
        });
    });
});
