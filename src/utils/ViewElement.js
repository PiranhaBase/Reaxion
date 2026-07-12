import baseStyle from "../ui/styles/global.css" with { type: "css" };


export default class ViewElement extends HTMLElement {

    constructor() {
        super();
        this.initialized = false;
        this._initializeShadow();
    }

    _initializeShadow() {
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = this.constructor.template || "";
        delete this.constructor.template;

        this.shadowRoot.adoptedStyleSheets.push(baseStyle, ...(this.constructor.styles || []));
    }

    initialize() {
        this.initialized = true;
        this.setup?.();
    }
}