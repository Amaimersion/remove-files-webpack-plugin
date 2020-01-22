/* eslint-disable no-unused-expressions */
/* eslint-disable no-empty-function */
/* eslint-disable no-new */
/* eslint-disable no-undef */


'use strict';


const path = require('path');
const expect = require('chai').expect;
const RemovePlugin = require('../src/index');


describe('usage', () => {
    it('cannot be created without parameters', () => {
        const create = () => {
            new RemovePlugin();
        };

        expect(create).to.throw();
    });

    it('cannot be created without either "before" or "after" parameters', () => {
        const create = () => {
            new RemovePlugin({
                test: {}
            });
        };

        expect(create).to.throw();
    });

    it('can be created with "before" parameter', () => {
        const create = () => {
            new RemovePlugin({
                before: {}
            });
        };

        create();
    });

    it('can be created with "after" parameter', () => {
        const create = () => {
            new RemovePlugin({
                after: {}
            });
        };

        create();
    });

    it('can be created with both "before" and "after" parameters', () => {
        const create = () => {
            new RemovePlugin({
                before: {},
                after: {}
            });
        };

        create();
    });
});


describe('webpack', () => {
    const emulatedWebpackCompilerV4 = {
        hooks: {
            beforeRun: {
                tapAsync: () => { }
            },
            watchRun: {
                tapAsync: () => { }
            },
            afterEmit: {
                tapAsync: () => { }
            }
        }
    };
    const emulatedWebpackCompilerV3 = {
        plugin: (hookName) => {
            if (!([
                'before-run',
                'watch-run',
                'after-emit'
            ].includes(hookName))) {
                throw new Error(`Invalid hook name - "${hookName}"`);
            }
        }
    };

    it('works with v4', () => {
        const create = () => {
            const plugin = new RemovePlugin({
                before: {}
            });

            plugin.apply(emulatedWebpackCompilerV4);
        };

        create();
    });

    it('works with v3', () => {
        const create = () => {
            const plugin = new RemovePlugin({
                before: {}
            });

            plugin.apply(emulatedWebpackCompilerV3);
        };

        create();
    });

    it('not works with invalid webpack', () => {
        const create = () => {
            const plugin = new RemovePlugin({
                before: {}
            });

            plugin.apply({});
        };

        expect(create).to.throw();
    });
});


describe('file system', () => {
    describe('windows', () => {
        const instance = new RemovePlugin({
            before: {}
        });

        describe('converting to absolute path', () => {
            it('double backslash', () => {
                const correct = 'C:\\test\\test-test\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test\\test-test', 'tE sT\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('single slash', () => {
                const correct = 'C:\\test\\test-test\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:/test/test-test', 'tE sT/big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('double backslash, single slash and relative dot', () => {
                const correct = 'C:\\test\\test-test\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test/test-test\\', './tE sT\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('double backslash, single slash and relative dots', () => {
                const correct = 'C:\\test\\test-test\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test/test-test\\', './tE sT/..\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('already absolute with double backslash', () => {
                const correct = '\\tE sT\\big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test\\test-test', '\\tE sT\\big + file.name.txt');

                expect(result).to.equal(correct);
            });

            it('already absolute with single slash', () => {
                const correct = '/tE sT/big + file.name.txt';
                const result = instance.toAbsolutePath('C:\\test\\test-test', '/tE sT/big + file.name.txt');

                expect(result).to.equal(correct);
            });
        });
    });
});
