const baseStyle = new CSSStyleSheet();

baseStyle.replaceSync(`
    :host {
        display: block;
    }

    :host([hidden]) {
        display: none !important;
    }

    * {
        padding: 0;
        margin: 0;
    }
`);


export default class BaseElement extends HTMLElement {

    constructor() {
        super();
        this._initializeShadow();
        this.constructor._initializeProperties();
    }

    static get observedAttributes() {
        return Object.keys(this.properties || {}).map(property =>
            property.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
        );
    }

    connectedCallback() {
        for (const property of Object.keys(this.constructor.properties || {})) {
            if (this.hasOwnProperty(property)) {
                const value = this[property];
                delete this[property];
                this[property] = value;
            }
        }

        queueMicrotask(() => {
            if (this.onTextChange) {
                this._textObserver = new MutationObserver(this._onTextChange);
                this._onTextChange();
            }
        });

        this.onMount?.();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.onUpdate) return;

        const property = name.replace(/-([a-z])/g, (_, match) => match.toUpperCase());

        if (this.constructor.properties[property] === Boolean) {
            this.onUpdate(property, oldValue !== null, newValue !== null);
        }
        else this.onUpdate(property, oldValue, newValue);
    }

    disconnectedCallback() {
        this._textObserver?.disconnect();

        this.onUnmount?.();
    }

    _onTextChange = () => {
        this.onTextChange(this.textContent);

        this._textObserver.disconnect();
        this.replaceChildren();
        this._textObserver.observe(this, { childList: true, characterData: true });
    }

    _initializeShadow() {
        if (!this.constructor._initializedTemplate) {
            this.constructor._initializedTemplate = true;

            this.constructor._template = document.createElement("template");
            this.constructor._template.innerHTML = this.constructor.template || "";
        }

        this.attachShadow({ mode: "open" });
        this.shadowRoot.append(this.constructor._template.content.cloneNode(true));
        this.shadowRoot.adoptedStyleSheets.push(baseStyle, ...(this.constructor.styles || []));
    }

    static _initializeProperties() {
        if (!this.properties || this._initializedProperties) return;
        this._initializedProperties = true;

        for (const [property, type] of Object.entries(this.properties)) {
            const attribute = property.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);

            if (type === Boolean) {
                Object.defineProperty(this.prototype, property, {
                    get: function() {
                        return this.hasAttribute(attribute);
                    },
                    set: function(value) {
                        if (value || value === "") this.setAttribute(attribute, "");
                        else this.removeAttribute(attribute);
                    }
                });
            }

            else {
                Object.defineProperty(this.prototype, property, {
                    get: function() {
                        return this.getAttribute(attribute);
                    },
                    set: function(value) {
                        this.setAttribute(attribute, value);
                    }
                });
            }
        }
    }
}