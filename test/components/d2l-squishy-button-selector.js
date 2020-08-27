/* global it, fixture, expect, beforeEach, afterEach, describe, sinon */

import '../../squishy-button-selector/d2l-squishy-button-selector.js';

describe('<d2l-squishy-button-selector>', function() {

	var element, sandbox;

	beforeEach(function(done) {
		sandbox = sinon.sandbox.create();
		element = fixture('basic');
		element.shadowRoot.addEventListener('slotchange', () => {
			done();
		}, { once: true });
	});

	beforeEach(function() {
		sandbox.restore();
	});

	describe('smoke test', function() {
		it('can be instantiated', function() {
			expect(element.tagName).to.equal('D2L-SQUISHY-BUTTON-SELECTOR');
		});
	});

	describe('_buttons', function() {

		it('Is a list of all the buttons', function() {
			expect(element._buttons.length).to.equal(3);
			expect(element._buttons[0].getAttribute('text').trim()).to.equal('BUTTON 1');
			expect(element._buttons[1].getAttribute('text').trim()).to.equal('BUTTON 2');
			expect(element._buttons[2].getAttribute('text').trim()).to.equal('BUTTON 3');
		});

	});

	describe('_updateButtonSelectedAttribute', function() {
		function verifyButtonsSelected(b1, b2, b3) {
			expect(element._buttons[0].hasAttribute('selected')).to.equal(b1);
			expect(element._buttons[1].hasAttribute('selected')).to.equal(b2);
			expect(element._buttons[2].hasAttribute('selected')).to.equal(b3);
		}

		it('selects the button which corresponds with the selectedIndex', async() => {
			element.setAttribute('selected-index', 1);
			element._handleDomChanges();
			await element.updateComplete;
			verifyButtonsSelected(false, true, false);
		});

		it('selects nothing if the selectedIndex is out of range', async() => {
			element.selectedIndex = 12;
			await element.updateComplete;
			verifyButtonsSelected(false, false, false);
		});

		it('deselects everything if selectedIndex is null', async() => {
			element.selectedIndex = 1;
			await element.updateComplete;
			verifyButtonsSelected(false, true, false);

			element.selectedIndex = null;
			await element.updateComplete;
			verifyButtonsSelected(false, false, false);
		});
	});

	describe('d2l-squishy-button-selected event', function() {
		it('should set selectedIndex to the selected button', function() {
			[0, 1, 2].forEach(function(num) {
				element._buttons[num]._dispatchItemSelectedEvent(false, true);
				expect(element.selectedIndex).to.equal(num);
			});
		});
	});

	describe('_disabledChanged', function() {
		function verifyTabindex(num) {
			expect(element.getAttribute('tabindex')).to.equal(num.toString());
		}

		it('sets the tabindex to -1 when readonly', function() {
			verifyTabindex(0);
			element.setAttribute('disabled', true);
			verifyTabindex(-1);
		});

		it('sets the tabindex to 0 when changing back from readonly', function() {
			element.setAttribute('disabled', true);
			verifyTabindex(-1);
			element.removeAttribute('disabled');
			verifyTabindex(0);
		});

		it('If possible, sets the tabindex to its previous value when changing back from readonly', function() {
			element.setAttribute('tabindex', '3');
			element.setAttribute('disabled', true);
			verifyTabindex(-1);
			element.removeAttribute('disabled');
			verifyTabindex(3);
		});
	});

	describe('_onFocus', function() {
		it('focuses the first element if nothing is selected', function() {
			element._buttons[0].focus = sinon.spy();
			element._onFocus({ target: element });
			expect(element._buttons[0].focus.called).to.equal(true);
		});

		it('focuses the selected element', function() {
			element.selectedIndex = 1;
			element._buttons[1].focus = sinon.spy();
			element._onFocus({ target: element });
			expect(element._buttons[1].focus.called).to.equal(true);
		});

		it('focuses nothing if disabled is true', async() => {
			element.disabled = true;
			await element.updateComplete;
			element.selectedIndex = 1;
			element._buttons[0].focus = sinon.spy();
			element._onFocus({ target: element });
			expect(element._buttons[0].focus.called).to.equal(false);
		});

		it('focuses nothing if a button is selected rather than the list', function() {
			element.selectedIndex = 1;
			element._buttons[1].focus = sinon.spy();
			element._onFocus({ target: element._buttons[0] });
			expect(element._buttons[1].focus.called).to.equal(false);
		});
	});

});
