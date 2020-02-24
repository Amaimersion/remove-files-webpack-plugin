const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const Webpack = require('../webpack');
const RemovePlugin = require('../..');


describe('acceptance', function () {
    describe('large', function () {
        const logs = {
            log: false,
            logWarning: true,
            logError: true,
            logDebug: false
        };
        const exists = (...paths) => {
            return (
                fs.existsSync(
                    path.resolve(
                        ...paths
                    )
                )
            );
        }

        it('should pass tricky test', function () {
            const webpack = new Webpack.EmulatedWebpackCompiler.v4();
            const instance = new RemovePlugin({
                before: {
                    root: './acceptance_test_remove/large_test',
                    include: [
                        'Pa.^&th/test/test.txt',
                        '.\\Pa.^&th/test.txt',
                        'test.txt',
                        './maps/test.txt',
                        'styles',
                        'styles/test'
                    ],
                    test: [
                        {
                            folder: './',
                            method: (pth) => pth.includes('pa)t-h (t [e]s {t} +'),
                            recursive: true
                        },
                        {
                            folder: 'Pa.^&th\\',
                            method: () => true,
                            recursive: true
                        },
                        {
                            folder: './maps',
                            method: (path) => path.includes('.map'),
                            recursive: false
                        }
                    ],
                    exclude: [
                        '.\\pa)t-h (t [e]s {t} +',
                        './Pa.^&th\\test\\test.txt',
                        './maps/test/file.map'
                    ],
                    ...logs
                }
            });

            instance.apply(webpack);
            webpack.runBeforeRun();

            const beforeIsSuccess = (
                exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'pa)t-h (t [e]s {t} +'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'test'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'Pa.^&th',
                    'test',
                    'test.txt'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'maps',
                    'test',
                    '1.map'
                ) &&
                exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'maps',
                    'test',
                    'file.map'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'styles'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'pa)t-h (t [e]s {t} + file.name.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'Pa.^&th',
                    'test.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'Pa.^&th',
                    'another.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'Pa.^&th',
                    'test',
                    'another.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'maps',
                    'test.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'maps',
                    'test.map'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'maps',
                    '1.map'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'pa)t-h (t [e]s {t} +',
                    'test.txt'
                ) &&
                !exists(
                    '.',
                    'acceptance_test_remove',
                    'large_test',
                    'pa)t-h (t [e]s {t} +',
                    '1.map'
                )
            );

            expect(beforeIsSuccess).to.equal(true);
        });
    });
});
