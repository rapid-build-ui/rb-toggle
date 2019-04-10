/***********************************
 * RB-TOGGLE
 * --------------------------------
 * TODO:
 * Handle onclick and fetch errors.
 ***********************************/
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
	constructor() { // :void
		super();
		this.state = {
			...super.state,
			preloading: false
		};
		this.rb.events.host.add(['click']);
		this.rb.events.add(this, 'click', evt => { // rb-toggle.click()
			if (evt.composedPath()[0] !== this) return;
			this.rb.elms.rbButton.click();
		});
	}
	disconnectedCallback() { // :void
		super.disconnectedCallback && super.disconnectedCallback();
		this._stopPreloader(); // jic
	}
	viewReady() { // :void
		super.viewReady && super.viewReady();
		Object.assign(this.rb.elms, {
			rbButton: this.shadowRoot.querySelector('rb-button')
		});
		this._attachEvents();
		this._initToggle();
	}

	/* Properties
	 *************/
	static get props() {
		return {
			kind: props.string,
			fetch: props.string,
			fetchOpts: props.object,
			caption: props.string,
			cache: Object.assign({}, props.boolean, {
				default: true,
				deserialize: Converter.boolean
			}),
			disabled: Object.assign({}, props.boolean, {
				deserialize: Converter.valueless
			}),
			open: Object.assign({}, props.boolean, {
				deserialize: Converter.valueless
			})
		};
	}

	/* Getters and Setters
	 **********************/
	get _cached() { // :boolean
		return !!this.__cached;
	}
	set _cached(cached) { // :void
		this.__cached = !!cached;
	}
	get _hasAction() { // :boolean (readonly)
		return this._hasFetch || this._hasOnclick;
	}
	get _hasFetch() { // :boolean (readonly)
		return !!this.fetch;
	}
	get _hasOnclick() { // :boolean (readonly)
		return !!this.rb.events.host.events.click;
	}

	/* Event Management
	 *******************/
	_attachEvents() { // :void
		this.rb.elms.rbButton.onclick = this._toggleAction.bind(this);
	}

	/* Toggles
	 **********/
	_initToggle() { // :void
		if (this.disabled) return;
		if (!this.open) return;
		if (!this._hasAction) return this.triggerUpdate(); // because view.isReady check in template
		this._toggle(); // close and wait for _toggleAction() to open
		this.rb.elms.rbButton.click();
	}
	_toggle() { // :void
		this.open = !this.open;
	}

	/* Preloader
	 ************/
	_startPreloader() { // :void
		this._stopPreloader(); // jic
		this._preloaderTO = setTimeout(() => { // :timeoutID<int>
			this.state.preloading = true;
			this.triggerUpdate();
		}, 200); // small buffer
	}
	_stopPreloader() { // :void
		if (!Type.is.int(this._preloaderTO)) return;
		clearTimeout(this._preloaderTO);
		this.state.preloading = false;
		this._preloaderTO = null;
	}

	/* Actions
	 **********/
	async _runFetch(evt) { // :string | undefined
		const fetched = await fetch(this.fetch, this.fetchOpts);
		const content = await fetched.text();
		return content;
	}
	async _runOnclick(evt) { // :string | undefined
		const result = await this.rb.events.host.run(evt);
		return result;
	}
	async _runAction(evt, action) { // :string | undefined
		const result = await this[action](evt);
		if (!Type.is.string(result)) return; // if result is string set slot to string
		this.innerHTML = result; // this updates the slot
		return result;
	}

	async _action(evt) { // :void (only called in _toggleAction)
		if (this.open) return;
		if (this._cached) return;
		let result;
		this._startPreloader();
		if (this._hasOnclick) result = await this._runAction(evt, '_runOnclick');
		if (this._hasFetch && !result) await this._runAction(evt, '_runFetch');
		this._stopPreloader();
		this._cached = this.cache;
	}

	/* Event Handlers
	 *****************/
	async _toggleAction(evt) { // :void
		if (this._hasAction) await this._action(evt);
		// console.log('TOGGLED');
		this._toggle();
	}

	/* Template
	 ***********/
	render({ props, state }) { // :string
		return html template;
	}
}

customElements.define('rb-toggle', RbToggle);
