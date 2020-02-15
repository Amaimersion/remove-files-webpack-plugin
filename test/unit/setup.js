/**
 * This script configures things so test scripts can work properly.
 * 
 * At the moment this script will work only on Windows with both C and D local disks.
 * You should change root directory to D in terminal.
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
    'D:/path_test/path-test/PaTh TeSt',
    'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th',
    'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test',
    'D:/path-test',
    'D:/path-test/PaTh TeSt',
    'D:/path test',
    path.resolve('.') + '/path_test',
    path.resolve('.') + '/path_test/path-test',
    path.resolve('.') + '/path-test',
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
    'D:/fs_test_folder_remove_8/test 2/test'
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
    'D:/fs_test_folder_remove_8/test 2/test/pa)t-h (t [e]s {t} + file.name.txt'
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
