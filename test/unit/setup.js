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
    path.resolve('.') + '/path-test'
];

/**
 * Files for creating and deleteing.
 */
const FILES = [
    'D:/path_test/path-test/PaTh TeSt/big + file.name.txt',
    'D:/path-test/PaTh TeSt/big + file.name.txt',
    'D:/path-test/big + file.name.txt',
    'D:/path test.txt',
    'D:/path_test/pa)t-h (t [e]s {t} +/Pa.^&th/test.txt'
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
