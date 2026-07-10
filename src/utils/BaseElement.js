export default class BaseElement extends HTMLElement {

    constructor() {
        super();
        
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets.push(...(this.constructor.styles || []));

        this._initializeTemplate();
        this.constructor._initializeProperties();
    }

    static get observedAttributes() {
        if (!this.properties) return [];
        return Object.keys(this.properties).map(property =>
            property.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
        );
    }

    connectedCallback() {
        for (const property of Object.keys(this.constructor.properties)) {
            if (this.hasOwnProperty(property)) {
                const value = this[property];
                delete this[property];
                this[property] = value;
            }
        }
    }

    _initializeTemplate() {
        if (!this.constructor._initializedTemplate) {
            this.constructor._initializedTemplate = true;

            this.constructor._template = document.createElement("template");
            this.constructor._template.innerHTML = this.constructor.template || "";
        }

        this.shadowRoot.append(this.constructor._template.content.cloneNode(true));
    }

    static _initializeProperties() {
        if (this._initializedProperties) return;
        this._initializedProperties = true;

        if (!this.properties) return;

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