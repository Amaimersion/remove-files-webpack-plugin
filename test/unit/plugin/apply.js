const expect = require('chai').expect;
const Webpack = require('../../webpack');
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('.apply()', function () {
            it('should work with webpack v4', function () {
                const test = () => {
                    const webpackV4 = new Webpack.EmulatedWebpackCompiler.v4();
                    const instance = new Plugin({
                        before: {}
                    });

                    instance.apply(webpackV4);
                };

                expect(test).not.to.throw();
            });

            it('should work with webpack v3', function () {
                const test = () => {
                    const webpackV3 = new Webpack.EmulatedWebpackCompiler.v3();
                    const plugin = new Plugin({
                        before: {}
                    });

                    plugin.apply(webpackV3);
                };

                expect(test).not.to.throw();
            });

            it('should not work with invalid webpack', function () {
                const test = () => {
                    const webpackInvalid = {};
                    const plugin = new Plugin({
                        before: {}
                    });

                    plugin.apply(webpackInvalid);
                };

                expect(test).to.throw();
            });
        });
    });
});
