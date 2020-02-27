const expect = require('chai').expect;
const Plugin = require('../../../src/plugin');


describe('unit', function () {
    describe('plugin', function () {
        describe('new()', function () {
            it('should throw error when calling without parameters', function () {
                const test = () => {
                    new Plugin();
                };

                expect(test).to.throw();
            });

            it('should throw error when calling without either "before", "after" or "watch" parameters', function () {
                const test = () => {
                    new Plugin({
                        test: {}
                    });
                };

                expect(test).to.throw();
            });

            it('should create when calling with "before" parameter', function () {
                const test = () => {
                    new Plugin({
                        before: {}
                    });
                };

                expect(test).not.to.throw();
            });

            it('should create when calling with "after" parameter', function () {
                const test = () => {
                    new Plugin({
                        after: {}
                    });
                };

                expect(test).not.to.throw();
            });

            it('should create when calling with "watch" parameter', function () {
                const test = () => {
                    new Plugin({
                        watch: {}
                    });
                };

                expect(test).not.to.throw();
            });

            it('should create when calling with all "before", "after" and "watch" parameters', function () {
                const test = () => {
                    new Plugin({
                        before: {},
                        after: {},
                        watch: {}
                    });
                };

                expect(test).not.to.throw();
            });
        });
    });
});
