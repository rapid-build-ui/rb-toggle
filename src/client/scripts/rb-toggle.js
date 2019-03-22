/***********
 * RB-TOGGLE
 ***********/
import { RbBase, props, html } from '../../rb-base/scripts/rb-base.js';
import Converter               from '../../rb-base/scripts/public/props/converters.js';
import Type                    from '../../rb-base/scripts/public/services/type.js';
import View                    from '../../rb-base/scripts/public/view/directives.js';
import template                from '../views/rb-toggle.html';
import '../../rb-button/scripts/rb-button.js';
import '../../rb-popover/scripts/rb-popover.js';

export class RbToggle extends RbBase() {
	/* Lifecycle
	 ************/
	viewReady() { // :void
		super.viewReady && super.viewReady();
		Object.assign(this.rb.elms, {
			rbButton: this.shadowRoot.querySelector('rb-button')
		});
		this.rb.events.add(this.rb.elms.rbButton, 'click', this._toggleAction);
	}

	/* Properties
	 *************/
	static get props() {
		return {
			kind: props.string,
			caption: props.string,
			inline: props.boolean,
			action: Object.assign({}, props.string, {
				deserialize(val) {
					if (!val) return;
					return new Function(`return ${val}`)();
				}
			}),
			disabled: Object.assign({}, props.boolean, {
				deserialize: Converter.valueless
			}),
			open: Object.assign({}, props.boolean, {
				deserialize: Converter.valueless
			})
		};
	}

	/* Helpers
	 **********/
	_toggle() { // :void
		this.open = !this.open;
	}

	/* Event Handlers
	 *****************/
	async _toggleAction(evt) { // :void
		if (this.disabled) return;
		if (!Type.is.function(this.action)) return this._toggle();
		const result = await this.action();
		this._toggle();
	}

	/* Template
	 ***********/
	render({ props, state }) { // :string
		return html template;
	}
}

customElements.define('rb-toggle', RbToggle);
