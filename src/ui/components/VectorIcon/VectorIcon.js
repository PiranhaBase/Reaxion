import style from "./VectorIcon.css" with { type: "css" };


class VectorIcon extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    static get observedAttributes() {
        return ["name"];
    }

    connectedCallback() {
        const base = document.createElement("div");
        base.part.add("base");
        base.dataset.icon = this.getAttribute("name").toLowerCase();
        this.ariaHidden = true;
        this.shadowRoot.appendChild(base);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const base = this.shadowRoot.querySelector("[part='base']");
        if (base) base.dataset.icon = newValue.toLowerCase();
    }
}


customElements.define("vector-icon", VectorIcon);