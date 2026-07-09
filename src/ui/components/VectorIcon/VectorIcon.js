import style from "./VectorIcon.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="base"></div>
`;


class VectorIcon extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._base = this.shadowRoot.querySelector("[part='base']");
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
        this._base.dataset.icon = newValue.trim().toLowerCase();
    }

    get name() {
        return this.getAttribute("name");
    }

    set name(newName) {
        this.setAttribute("name", newName);
    }
}


customElements.define("vector-icon", VectorIcon);