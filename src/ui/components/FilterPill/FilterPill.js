import style from "./FilterPill.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="base">
        <span></span>
        <button>
            <vector-icon name="close"></vector-icon>
        </button>
    </div>
`;


class FilterPill extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._label = this.shadowRoot.querySelector("span");
        this._clearButton = this.shadowRoot.querySelector("button");

        this._clearButton.addEventListener("click", this.dispatchRemoveEvent);

        this.target = null;
    }

    static get observedAttributes() {
        return ["label"];
    }

    connectedCallback() {
        if (this.hasOwnProperty("label")) {
            const label = this.label;
            delete this.label;
            this.label = label;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._label.textContent = newValue || "";
    }

    disconnectedCallback() {
        this._clearButton.removeEventListener("click", this.dispatchRemoveEvent);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    dispatchRemoveEvent = (event) => {
        event.stopPropagation();
        
        this.dispatchEvent(new CustomEvent("input", {
            bubbles: true,
            composed: true,
            detail: { name: this._label.textContent }
        }));
    }
}

customElements.define("filter-pill", FilterPill);