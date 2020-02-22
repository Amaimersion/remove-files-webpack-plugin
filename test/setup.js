/**
 * This script configures things so test scripts can work properly.
 * 
 * At the moment this script will work only on Windows with both C and D local disks.
 * You should change root directory to D:/remove-files-webpack-plugin in terminal.
 */


const path = require('path');
const fs = require('fs');


/**
 * Folders for creating and deleting.
 * 
 * - add a common root (like `D:/path_test`)
 * before children paths if you want to delete 
 * all nested items with one call.
 */
const FOLDERS = [
    'D:/path_test',
    'D:/path_test/test',
    'D:/path_test/test%',
    'D:/path_test/test1',
    'D:/path_test/test test',
    'D:/path_test/path-test/PaTh TeSt',
    'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th',
    'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test',
    'D:/path-test',
    'D:/path-test/PaTh TeSt',
    'D:/path test',
    path.resolve('.', 'path_test'),
    path.resolve('.', 'path_test/path-test'),
    path.resolve('.', 'path-test'),
    'D:/fs_test',
    'D:/fs_test/fs-test',
    'D:/fs_test/fs test',
    'D:/fs_test/fs_test/fs_test',
    'D:/fs_test_file_remove',
    'D:/fs_test_folder_remove_1',
    'D:/fs_test_folder_remove_2',
    'D:/fs_test_folder_remove_3',
    'D:/fs_test_folder_remove_3/test_1',
    'D:/fs_test_folder_remove_3/test 2',
    'D:/fs_test_folder_remove_4',
    'D:/fs_test_folder_remove_4/test_1',
    'D:/fs_test_folder_remove_4/test 2',
    'D:/fs_test_folder_remove_4/test 2/test',
    'D:/fs_test_folder_remove_5',
    'D:/fs_test_folder_remove_6',
    'D:/fs_test_folder_remove_7',
    'D:/fs_test_folder_remove_7/test_1',
    'D:/fs_test_folder_remove_7/test 2',
    'D:/fs_test_folder_remove_8',
    'D:/fs_test_folder_remove_8/test_1',
    'D:/fs_test_folder_remove_8/test 2',
    'D:/fs_test_folder_remove_8/test 2/test',
    'D:/items_test',
    'D:/items_test/dist/styles/css',
    'D:/items_test/dist/styles/css_1/css',
    'D:/items_test/dist/js/scripts',
    'D:/items_test/dist/js/files/check',
    'D:/items_test/dist/text',
    'D:/items_test/test/test/test1',
    'D:/items_test/test/styles/map',
    'D:/items_test/js/scripts/files',
    'D:/items_test/js/scripts/js',
    'D:/items_test/js/scripts/maps',
    'D:/items_test/js/maps/test_1',
    'D:/items_test/js/maps/test_2',
    'D:/items_test/test test/test',
    'D:/items_test/css/styles',
    'D:/items_test/css/maps',
    'D:/items_test/css/files',
    'D:/items_test/test/test_1',
    'D:/items_test/test_1/test',
    'D:/items_test/pa)t-h (t [e]s {t}/css',
    'D:/items_test/pa)t-h (t [e]s {t}/folder/test',
    path.resolve('.', 'items_test/'),
    path.resolve('.', 'items_test/dist/js/scripts/test'),
    path.resolve('.', 'items_test/dist/js/scripts/files'),
    path.resolve('.', 'items_test/dist/css/maps'),
    path.resolve('.', 'items_test/dist/css/styles'),
    path.resolve('.', 'items_test/test/styles/styles'),
    path.resolve('.', 'items_test/test/test'),
    path.resolve('.', 'items_test/test/test_1'),
    path.resolve('.', 'items_test/js/maps'),
    path.resolve('.', 'items_test/js/scripts'),
    path.resolve('.', 'items_test/test_1/test'),
    'D:/plugin_test',
    'D:/plugin_test/test',
    path.resolve('.', 'plugin_test'),
    path.resolve('.', 'plugin_test/test'),
    path.resolve('.', 'plugin_test/test/test'),
    path.resolve('.', 'plugin_test_remove'),
    path.resolve('.', 'plugin_test_remove/test1'),
    path.resolve('.', 'plugin_test_remove/test2'),
    path.resolve('.', 'plugin_test_remove/test3'),
    path.resolve('.', 'plugin_test_remove/test4'),
    path.resolve('.', 'plugin_test_remove/test5'),
    path.resolve('.', 'acceptance_test_remove'),
    path.resolve('.', 'acceptance_test_remove/test1'),
    path.resolve('.', 'acceptance_test_remove/test2'),
    path.resolve('.', 'acceptance_test_remove/test3'),
    path.resolve('.', 'acceptance_test_remove/test4'),
    path.resolve('.', 'acceptance_test_remove/test5'),
    path.resolve('.', 'acceptance_test_remove/test6')
];

/**
 * Files for creating and deleteing.
 */
const FILES = [
    'D:/path_test/path-test/PaTh TeSt/big + file.name.txt',
    'D:/path-test/PaTh TeSt/big + file.name.txt',
    'D:/path-test/big + file.name.txt',
    'D:/path test.txt',
    'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test.txt',
    'D:/fs_test/test_1.txt',
    'D:/fs_test/test 2.txt',
    'D:/fs_test/test-3.bin',
    'D:/fs_test/fs-test/test_1.txt',
    'D:/fs_test/fs-test/test-2.bin',
    'D:/fs_test/fs test/test 1.bin',
    'D:/fs_test/fs test/test 2.txt',
    'D:/fs_test/fs_test/fs_test/test_1.txt',
    'D:/fs_test/fs_test/fs_test/test_2.test',
    'D:/fs_test_file_remove/1 pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_file_remove/2 pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_2/1 pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_2/2 pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_4/test.txt',
    'D:/fs_test_folder_remove_4/test_1/test 1.txt',
    'D:/fs_test_folder_remove_4/test_1/test 2.txt',
    'D:/fs_test_folder_remove_4/test 2/pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_4/test 2/test/pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_6/1 pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_6/2 pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_8/test.txt',
    'D:/fs_test_folder_remove_8/test_1/test 1.txt',
    'D:/fs_test_folder_remove_8/test_1/test 2.txt',
    'D:/fs_test_folder_remove_8/test 2/pa)t-h (t [e]s {t} + file.name.txt',
    'D:/fs_test_folder_remove_8/test 2/test/pa)t-h (t [e]s {t} + file.name.txt',
    'D:/items_test/text.txt',
    'D:/items_test/dist/js/test.txt',
    'D:/items_test/dist/manifest.json',
    'D:/items_test/dist/js/scripts/test.js',
    'D:/items_test/dist/text/test.txt',
    'D:/items_test/dist/styles/popup.css',
    'D:/items_test/dist/styles/popup.css.map',
    'D:/items_test/js/scripts/js/test.js',
    'D:/items_test/js/scripts/js/test_2.js',
    'D:/items_test/js/scripts/maps/test.js',
    'D:/items_test/css/styles/1.css',
    'D:/items_test/css/maps/1.css',
    'D:/items_test/js/scripts/test.js',
    'D:/items_test/js/scripts/test.map',
    'D:/items_test/js/test.js',
    'D:/items_test/js/scripts/map.js',
    'D:/items_test/js/scripts/style.js',
    'D:/items_test/test.txt',
    'D:/items_test/js/maps/test.js',
    'D:/items_test/css/style.css',
    'D:/items_test/css/maps/folder.css',
    'D:/items_test/test/test.txt',
    'D:/items_test/test/test_1/test.txt',
    'D:/items_test/test_1/test.txt',
    'D:/items_test/pa)t-h (t [e]s {t}/test.txt',
    'D:/items_test/pa)t-h (t [e]s {t}/css/test.css',
    'D:/items_test/pa)t-h (t [e]s {t}/folder/test.txt',
    'D:/items_test/pa)t-h (t [e]s {t}/folder/test/test.bin',
    path.resolve('.', 'items_test/js/1.js'),
    path.resolve('.', 'items_test/js/maps/file.js'),
    path.resolve('.', 'items_test/js/maps/file2.js'),
    path.resolve('.', 'items_test/js/scripts/file.js'),
    path.resolve('.', 'items_test/js/scripts/js.js'),
    path.resolve('.', 'items_test/test.js'),
    path.resolve('.', 'items_test/test_1/test.txt'),
    path.resolve('.', 'items_test/test/test.txt'),
    path.resolve('.', 'items_test/test/test_1/test.txt'),
    path.resolve('.', 'items_test/test_1/test/test.txt'),
    path.resolve('.', 'items_test/test/styles/style.css'),
    path.resolve('.', 'items_test/test/styles/test.txt'),
    'D:/plugin_test/test.txt',
    path.resolve('.', 'plugin_test/test.txt'),
    path.resolve('.', 'plugin_test/test test.txt'),
    path.resolve('.', 'plugin_test/test.jpg'),
    path.resolve('.', 'plugin_test/test/test.txt'),
    path.resolve('.', 'plugin_test/test/test.png'),
    path.resolve('.', 'plugin_test/test/test/test.bin'),
    path.resolve('.', 'plugin_test_remove/test1.txt'),
    path.resolve('.', 'plugin_test_remove/test2.txt'),
    path.resolve('.', 'plugin_test_remove/test3.txt'),
    path.resolve('.', 'plugin_test_remove/test4.txt'),
    path.resolve('.', 'plugin_test_remove/test5.txt'),
    path.resolve('.', 'plugin_test_remove/test6.txt'),
    path.resolve('.', 'acceptance_test_remove/test1.txt'),
    path.resolve('.', 'acceptance_test_remove/test2.txt'),
    path.resolve('.', 'acceptance_test_remove/test3.txt'),
    path.resolve('.', 'acceptance_test_remove/test4.txt'),
    path.resolve('.', 'acceptance_test_remove/test5.txt'),
    path.resolve('.', 'acceptance_test_remove/test6.txt')
];


before(function () {
    const createFolder = (pth) => {
        fs.mkdirSync(pth, {
            recursive: true
        });
    };
    const createFile = (pth) => {
        fs.writeFileSync(pth);
    };

    for (const folder of FOLDERS) {
        createFolder(folder);
    }

    for (const file of FILES) {
        createFile(file);
    }
});


after(function () {
    const deleteFolder = (pth) => {
        if (fs.existsSync(pth)) {
            fs.rmdirSync(pth, {
                recursive: true
            });
        }
    };
    const deleteFile = (pth) => {
        if (fs.existsSync(pth)) {
            fs.unlinkSync(pth);
        }
    };

    for (const folder of FOLDERS) {
        deleteFolder(folder);
    }

    for (const file of FILES) {
        deleteFile(file);
    }
});
