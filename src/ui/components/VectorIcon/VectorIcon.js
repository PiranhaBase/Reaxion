import style from "./VectorIcon.css" with { type: "css" };


class VectorIcon extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const base = document.createElement("div");
        base.part.add("base");

        this.shadowRoot.appendChild(base);
    }

    static get observedAttributes() {
        return ["name"];
    }

    connectedCallback() {
        this.ariaHidden = true;

        if (this.hasOwnProperty("name")) {
            const name = this.name;
            delete this.name;
            this.name = name;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const iconName = newValue.trim().toLowerCase();
        this.shadowRoot.querySelector("[part='base']").dataset.icon = iconName;
    }

    get name() {
        return this.getAttribute("name");
    }

    set name(newName) {
        this.setAttribute("name", newName);
    }
}


customElements.define("vector-icon", VectorIcon);