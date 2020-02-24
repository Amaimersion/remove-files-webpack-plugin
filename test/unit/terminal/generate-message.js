const expect = require('chai').expect;
const Terminal = require('../../../src/terminal');


describe('unit', function () {
    describe('terminal', function () {
        describe('.generateMessage()', function () {
            it('should return white default text', function () {
                const text = 'Text text';
                const result = Terminal.generateMessage(text, {
                    endDot: false,
                    color: 'white'
                });
                const correct = Terminal.colorize(text, 'white');

                expect(result).to.be.equal(correct);
            });

            it('should return red default text', function () {
                const text = 'Text text';
                const result = Terminal.generateMessage(text, {
                    endDot: false,
                    color: 'red'
                });
                const correct = Terminal.colorize(text, 'red');

                expect(result).to.be.equal(correct);
            });

            it('should return yellow empty text', function () {
                const text = '';
                const result = Terminal.generateMessage(text, {
                    endDot: false,
                    color: 'yellow'
                });
                const correct = Terminal.colorize(text, 'yellow');

                expect(result).to.be.equal(correct);
            });

            it('should append end dot if not already presented', function () {
                const text = 'Text text';
                const result = Terminal.generateMessage(text, {
                    endDot: true,
                    color: 'white'
                });
                const correct = Terminal.colorize(text + '.', 'white');

                expect(result).to.be.equal(correct);
            });

            it('should not append end dot if already presented', function () {
                const text = 'Text text.';
                const result = Terminal.generateMessage(text, {
                    endDot: true,
                    color: 'white'
                });
                const correct = Terminal.colorize(text, 'white');

                expect(result).to.be.equal(correct);
            });
        });
    });
});
