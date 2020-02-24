const expect = require('chai').expect;
const Items = require('../../../src/items');


describe('unit', function () {
    describe('items', function () {
        describe('.removeUnnecessary()', function () {
            const instance = new Items();

            it('should remove nested folders with forward slash', function () {
                instance.directories = [
                    '/items_test/dist/styles/css',
                    '/items_test/dist/styles/css_1',
                    '/items_test/dist/styles/css_1/css',
                    '/items_test/dist/js/scripts',
                    '/items_test/dist/js/files',
                    '/items_test/dist/js/files/check',
                    '/items_test/dist/styles',
                    '/items_test/test'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    '/items_test/dist/js/scripts',
                    '/items_test/dist/js/files',
                    '/items_test/dist/styles',
                    '/items_test/test'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should remove nested folders with backward slash', function () {
                instance.directories = [
                    'D:\\items_test\\js\\scripts\\files',
                    'D:\\items_test\\js\\scripts',
                    'D:\\items_test\\js\\maps',
                    'D:\\items_test\\js\\maps\\test_1',
                    'D:\\items_test\\js\\maps\\test_2',
                    'D:\\items_test\\test',
                    'D:\\items_test\\test test'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\items_test\\js\\scripts',
                    'D:\\items_test\\js\\maps',
                    'D:\\items_test\\test',
                    'D:\\items_test\\test test'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should remove nested folders with mixed slash', function () {
                instance.directories = [
                    'D:\\items_test/test test',
                    'D:\\items_test\\js/maps',
                    'D:/items_test/js\\scripts',
                    'D:/items_test\\js',
                    'D:\\items_test/test/test',
                    'D:/items_test/test\\test\\test1',
                    'D:/items_test/test test\\test'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\items_test/test test',
                    'D:/items_test\\js',
                    'D:\\items_test/test/test'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should remove relative children folders', function () {
                instance.directories = [
                    'items_test/dist/css',
                    'items_test/dist/js/scripts/test',
                    'items_test/dist/js/scripts/files',
                    'items_test/dist/css/maps',
                    'items_test/dist/css/styles',
                    'items_test/dist/js'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'items_test/dist/css',
                    'items_test/dist/js'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should remove all folders except Windows root', function () {
                instance.directories = [
                    'D:\\items_test/test test',
                    'D:\\items_test/js/maps',
                    'D:/items_test/js\\scripts',
                    'D:/items_test/js',
                    'D:\\items_test\\test/test',
                    'D:/items_test/test\\test\\test1',
                    'D:/items_test/test test\\test',
                    'D:\\'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should remove all folders except Unix root', function () {
                instance.directories = [
                    '/items_test/js/maps',
                    '/items_test/test test',
                    '/items_test/js/scripts',
                    '/items_test/js',
                    '/items_test/test/test',
                    '/items_test/test/test/test1',
                    '/items_test/test test/test',
                    '/'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    '/'
                ]);
                expect(instance.files).to.have.members([]);
            });

            /* can't test it, because not allowed to access not custom folders.
            it('should keep folder on another local disk', function () {
                instance.directories = [
                    'C:/test/test',
                    'D:/test'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'C:/test/test',
                    'D:/test'
                ]);
                expect(instance.files).to.have.members([]);
            });
            */

            it('should distinguish absolute and relative folders', function () {
                instance.directories = [
                    './items_test/test/styles',
                    '/items_test/test',
                    'items_test/test/test',
                    '/items_test/test/styles',
                    '/items_test/test/styles/map',
                    'items_test/test/styles/styles'
                ];
                instance.files = [];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    './items_test/test/styles',
                    '/items_test/test',
                    'items_test/test/test'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should keep files if there is no any folders', function () {
                instance.directories = [];
                instance.files = [
                    '/items_test/dist/js/test.txt',
                    '/items_test/text.txt',
                    '/items_test/dist/js/scripts/test.js',
                    '/items_test/dist/text/test.txt'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([]);
                expect(instance.files).to.have.members([
                    '/items_test/dist/js/test.txt',
                    '/items_test/text.txt',
                    '/items_test/dist/js/scripts/test.js',
                    '/items_test/dist/text/test.txt'
                ]);
            });

            it('should remove nested files with forward slash', function () {
                instance.directories = [
                    '/items_test/js/scripts/js',
                    '/items_test/js/scripts/maps',
                    '/items_test/css'
                ];
                instance.files = [
                    '/items_test/text.txt',
                    '/items_test/js/scripts/js/test.js',
                    '/items_test/js/scripts/js/test_2.js',
                    '/items_test/js/scripts/maps/test.js',
                    '/items_test/css/styles/1.css',
                    '/items_test/css/maps/1.css',
                    '/items_test/js/scripts/test.js',
                    '/items_test/js/scripts/test.map'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    '/items_test/js/scripts/js',
                    '/items_test/js/scripts/maps',
                    '/items_test/css'
                ]);
                expect(instance.files).to.have.members([
                    '/items_test/text.txt',
                    '/items_test/js/scripts/test.js',
                    '/items_test/js/scripts/test.map'
                ]);
            });

            it('should remove nested files with backward slash', function () {
                instance.directories = [
                    'D:\\items_test\\js\\scripts',
                    'D:\\items_test\\js\\maps',
                    'D:\\items_test\\css\\maps',
                    'D:\\items_test\\css\\files',
                    'D:\\items_test\\test'
                ];
                instance.files = [
                    'D:\\items_test\\js\\test.js',
                    'D:\\items_test\\js\\scripts\\map.js',
                    'D:\\items_test\\js\\scripts\\style.js',
                    'D:\\items_test\\test.txt',
                    'D:\\items_test\\js\\maps\\test.js',
                    'D:\\items_test\\css\\style.css',
                    'D:\\items_test\\css\\maps\\folder.css'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\items_test\\js\\scripts',
                    'D:\\items_test\\js\\maps',
                    'D:\\items_test\\css\\maps',
                    'D:\\items_test\\css\\files',
                    'D:\\items_test\\test'
                ]);
                expect(instance.files).to.have.members([
                    'D:\\items_test\\js\\test.js',
                    'D:\\items_test\\test.txt',
                    'D:\\items_test\\css\\style.css'
                ]);
            });

            it('should remove nested files with mixed slash', function () {
                instance.directories = [
                    'D:\\items_test/js\\scripts',
                    'D:/items_test\\js\\scripts/maps'
                ];
                instance.files = [
                    'D:\\items_test\\js/scripts/js\\test_2.js',
                    'D:/items_test/js\\scripts\\maps/test.js',
                    'D:\\items_test/text.txt'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\items_test/js\\scripts'
                ]);
                expect(instance.files).to.have.members([
                    'D:\\items_test/text.txt'
                ]);
            });

            it('should remove relative children files', function () {
                instance.directories = [
                    'items_test/js/maps',
                    'items_test/js/scripts'
                ];
                instance.files = [
                    'items_test/js/1.js',
                    'items_test/js/maps/file.js',
                    'items_test/js/maps/file2.js',
                    'items_test/js/scripts/file.js',
                    'items_test/js/scripts/js.js',
                    'items_test/test.js'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'items_test/js/maps',
                    'items_test/js/scripts'
                ]);
                expect(instance.files).to.have.members([
                    'items_test/js/1.js',
                    'items_test/test.js'
                ]);
            });

            it('should remove all files with Windows root', function () {
                instance.directories = [
                    'D:\\'
                ];
                instance.files = [
                    'D:\\items_test/text.txt',
                    'D:/items_test\\dist/js/test.txt',
                    'C:\\Windows/explorer.exe'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\'
                ]);
                expect(instance.files).to.have.members([
                    'C:\\Windows/explorer.exe'
                ]);
            });

            it('should remove all files with Unix root', function () {
                instance.directories = [
                    '/'
                ];
                instance.files = [
                    '/items_test/dist/js/test.txt',
                    '/items_test/text.txt',
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    '/'
                ]);
                expect(instance.files).to.have.members([]);
            });

            it('should distinguish absolute and relative files', function () {
                instance.directories = [
                    'D:\\items_test\\test',
                    'D:\\items_test\\test_1\\test',
                    '.\\items_test\\test_1\\test'
                ];
                instance.files = [
                    'items_test\\test_1\\test.txt',
                    'items_test\\test\\test.txt',
                    'D:\\items_test\\test.txt',
                    'D:\\items_test\\test\\test.txt',
                    'D:\\items_test\\test_1\\test.txt',
                    '.\\items_test\\test_1\\test\\test.txt'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:\\items_test\\test',
                    'D:\\items_test\\test_1\\test',
                    '.\\items_test\\test_1\\test'
                ]);
                expect(instance.files).to.have.members([
                    'items_test\\test_1\\test.txt',
                    'items_test\\test\\test.txt',
                    'D:\\items_test\\test.txt',
                    'D:\\items_test\\test_1\\test.txt'
                ]);
            });

            it('should remove both folders and files', function () {
                instance.directories = [
                    'D:/items_test/dist/styles/css',
                    'D:/items_test/dist/js/scripts',
                    'D:/items_test/dist/styles',
                    'D:/items_test/test',
                    'C:/Windows'
                ];
                instance.files = [
                    'D:/items_test/dist/styles/popup.css',
                    'D:/items_test/dist/styles/popup.css.map',
                    'D:/items_test/dist/manifest.json',
                    'D:/items_test/text.txt',
                    'D:/items_test/dist/js/scripts/test.js'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'D:/items_test/dist/js/scripts',
                    'D:/items_test/dist/styles',
                    'D:/items_test/test',
                    'C:/Windows'
                ]);
                expect(instance.files).to.have.members([
                    'D:/items_test/dist/manifest.json',
                    'D:/items_test/text.txt'
                ]);
            });

            it('should remove both folders and files with mixed absolute and relative', function () {
                instance.directories = [
                    'C:/Windows',
                    'C:/Windows/System32',
                    './items_test/test/styles',
                    'items_test/test/test',
                    './items_test/test/styles/styles',
                    'D:/items_test/test'
                ];
                instance.files = [
                    'C:/Windows/explorer.exe',
                    'items_test/test/test.txt',
                    'items_test/test/test_1/test.txt',
                    './items_test/test/styles/style.css',
                    './items_test/test/styles/test.txt',
                    'D:/items_test/text.txt',
                    'D:/items_test/test/test.txt'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    'C:/Windows',
                    './items_test/test/styles',
                    'items_test/test/test',
                    'D:/items_test/test'
                ]);
                expect(instance.files).to.have.members([
                    'items_test/test/test.txt',
                    'items_test/test/test_1/test.txt',
                    'D:/items_test/text.txt'
                ]);
            });

            it('should remove both folders and files with hard names', function () {
                instance.directories = [
                    '/items_test/pa)t-h (t [e]s {t}/folder',
                    '/items_test/pa)t-h (t [e]s {t}/css',
                    '/items_test/pa)t-h (t [e]s {t}/folder/test'
                ];
                instance.files = [
                    '/items_test/pa)t-h (t [e]s {t}/test.txt',
                    '/items_test/pa)t-h (t [e]s {t}/css/test.css',
                    '/items_test/pa)t-h (t [e]s {t}/folder/test.txt',
                    '/items_test/pa)t-h (t [e]s {t}/folder/test/test.bin'
                ];

                instance.removeUnnecessary();

                expect(instance.directories).to.have.members([
                    '/items_test/pa)t-h (t [e]s {t}/folder',
                    '/items_test/pa)t-h (t [e]s {t}/css'
                ]);
                expect(instance.files).to.have.members([
                    '/items_test/pa)t-h (t [e]s {t}/test.txt'
                ]);
            });
        });
    });
});
