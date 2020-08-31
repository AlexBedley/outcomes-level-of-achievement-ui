import '@polymer/polymer/polymer-legacy.js';
import '@brightspace-ui/core/components/tooltip/tooltip.js';
import 'd2l-colors/d2l-colors.js';
import 'd2l-polymer-behaviors/d2l-dom.js';
import 'd2l-typography/d2l-typography-shared-styles.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { KEYCODES } from '../keycodes.js';

export class D2lSquishyButton extends LitElement {

	static get properties() {
		return {
			selected: {
				type: Boolean,
				attribute: 'selected',
				reflect: true,
			},

			disabled: {
				type: Boolean,
				attribute: 'disabled',
				reflect: true
			},

			ariaDisabled: {
				type: Boolean,
				reflect: true,
				readOnly: true,
				computed: '_getDisabled(disabled)'
			},

			index: {
				type: Number,
				attribute: 'index',
				reflect: true
			},

			buttonData: {
				type: Object,
				attribute: 'button-data',
				reflect: true
			},

			color: {
				type: String
			},

			text: {
				type: String,
				reflect: true,
				observer: '_measureSize'
			},

			shortText: {
				type: String,
				reflect: true
			},

			_textOverflowing: {
				type: Boolean,
				value: false,
				reflect: true
			},

			tooltipPosition: {
				type: String,
				value: 'bottom',
				reflect: true
			},
		};
	}

	static get styles() {
		return css`

			:host {
				height: 100%;
				flex: 1;
				display: block;

				cursor: pointer;
				outline: none;

				background-color: white;
				--d2l-squishy-button-border-width: 1px;

			}

			:host {
				box-sizing: border-box;
				border: var(--d2l-squishy-button-border-width) solid var(--d2l-color-tungsten);
				margin-left: calc(-1 * var(--d2l-squishy-button-border-width));
			}

			:host(:dir(rtl)),
			:host-context([dir="rtl"]) {
				margin-left: 0;
				margin-right: calc(-1 * var(--d2l-squishy-button-border-width));
			}

			:host(:first-of-type) {
				margin: 0;
			}

			:host([disabled]) {
				border: var(--d2l-squishy-button-border-width) solid var(--d2l-color-mica);
				z-index: 0;
			}

			:host([selected]) {
				border: var(--d2l-squishy-button-border-width) solid var(--d2l-squishy-button-selected-color, var(--d2l-color-galena));
				z-index: 1;
			}

			[hidden] {
				display: none !important;
			}

			.d2l-squishy-button-container {
				@apply --d2l-body-small-text;

				display: flex;
				justify-content: center;
				align-items: center;

				margin: 0;
				color: var(--d2l-color-tungsten);
			}

			:host([selected]) .d2l-squishy-button-container {
				color: var(--d2l-color-ferrite);
				font-weight: 700;
			}

			.d2l-squishy-button-inner {
				max-height: 100%;
				border: 5px solid transparent; /* padding, but outside the content box */
				box-sizing: border-box;

				overflow: hidden;
				word-break: break-all;
				text-align: center;
			}

			.d2l-squishy-button-container {
				position: relative;
				width: 100%;
				height: 100%;
				z-index: 1;
			}

			.d2l-squishy-button-container::before {
				content: "";
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;

				opacity: 0.1;
				z-index: -1;
			}

			:host([selected]) .d2l-squishy-button-container::before,
			:host(:focus) .d2l-squishy-button-container::before,
			:host(:hover) .d2l-squishy-button-container::before {
				background-color: var(--d2l-squishy-button-selected-color, var(--d2l-color-galena));
			}

			::slotted(*) {
				pointer-events: none;
			}
		`;
	}

	constructor() {
		super();
		this.selected = false;
		this.disabled = false;
		this.buttonData = function() { return {}; };
		this.role = 'radio';
		this.addEventListener('keydown', this._onKeyDown);
		this.addEventListener('click', this._handleTap);
		this._handleDomChanges = this._handleDomChanges.bind(this);
		this.shadowRoot.addEventListener('slotchange', this._handleDomChanges, true);
		this.addEventListener('slotchange', this._handleDomChanges, true);
	}

	render() {
		return html`
			<d2l-tooltip id="tooltip${this.index}" hidden="${!this._textOverflowing}" position="${this.tooltipPosition}" boundary="{&quot;left&quot;: 0, &quot;right&quot;:0}" aria-hidden="">${this.text}</d2l-tooltip>

			<div class="d2l-squishy-button-container">
				<div id="textwrapper" class="d2l-squishy-button-inner">
					<div aria-hidden="" hidden="${!this._showShortText(this.shortText, this._textOverflowing)}">${this.shortText}</div>
					<div id="textarea"><slot></slot></div>
				</div>
			</div>
		`;
	}

	updated() {
		this._measureSize = this._measureSize.bind(this);

		window.addEventListener('resize', this._measureSize);
		this._measureSize();
		this.tabIndex = this.disabled ? '-1' : '0';
	}

	_getDisabled(disabled) {
		return disabled;
	}

	detached() {
		window.removeEventListener('resize', this._measureSize);
		this.shadowRoot.removeEventListener('slotchange', this._handleDomChanges);
		this.removeEventListener('slotchange', this._handleDomChanges);
	}

	_handleDomChanges() {
		this.text = this.textContent;
		this.dispatchEvent(new CustomEvent('squishy-button-text-changed', { bubbles: true }));
	}

	_showShortText(shortText, textOverflowing) {
		return shortText && textOverflowing;
	}

	_measureSize() {
		var innerHeight = this.shadowRoot.getElementById('textarea').innerHTML.offsetHeight;
		var outerHeight = this.shadowRoot.getElementById('textwrapper').innerHTML.offsetHeight;
		this._textOverflowing = innerHeight > outerHeight;
	}

	_getTextClass(shortText, textOverflowing) {
		return this._showShortText(shortText, textOverflowing) ? 'squishy-button-hide' : '';
	}

	set color(value) {
		if (value) {
			this.style.setProperty('--d2l-squishy-button-selected-color', value);
		}
	}

	_onKeyDown(event) {
		if (this.disabled) {
			return;
		}

		if (event.keyCode === KEYCODES.ENTER || event.keyCode === KEYCODES.SPACE) {
			this.selected = true;
			event.preventDefault();
			this._dispatchItemSelectedEvent(true, true);
		}
	}

	_handleTap(event) {
		if (this.disabled) {
			return;
		}
		this.selected = true;
		event.preventDefault();
		this._dispatchItemSelectedEvent(true, true);
	}

	set selected(newVal) {
		this._dispatchItemSelectedEvent(false, newVal);
	}

	set disabled(val) {
		if (val) {
			this.setAttribute('aria-disabled', '');
		}
		else {
			this.removeAttribute('aria-disabled');
		}
	}

	_dispatchItemSelectedEvent(triggeredByUserAction, selected) {
		var eventName = triggeredByUserAction ? 'd2l-squishy-button-selected' : 'd2l-squishy-button-selection-changed';
		this.dispatchEvent(new CustomEvent(eventName, {
			detail: {
				index: this.index,
				data: this.buttonData,
				selected: selected
			},
			bubbles: true
		}));
	}
}

customElements.define('d2l-squishy-button', D2lSquishyButton);
