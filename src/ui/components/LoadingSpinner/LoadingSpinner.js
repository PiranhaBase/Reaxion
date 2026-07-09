import style from "./LoadingSpinner.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g>
            <circle part="track"></circle>
            <circle part="stroke"></circle>
        </g>
    </svg>
`;


class LoadingSpinner extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._spinner = this.shadowRoot.querySelector("svg");
    }

    static get observedAttributes() {
        return ["active"];
    }

    connectedCallback() {
        this.setAttribute("role", "status");

        if (this.hasOwnProperty("active")) {
            const active = this.active;
            delete this.active;
            this.active = active;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active") {
            if (newValue !== null) {
                this._spinner.dataset.active = "";
            }
            else delete this._spinner.dataset.active;
        }
    }

    get active() {
        return this.hasAttribute("active");
    }

    set active(value) {
        if (value) this.setAttribute("active", "");
        else this.removeAttribute("active");
    }
}

customElements.define("loading-spinner", LoadingSpinner);