import BaseElement from "../../../utils/BaseElement.js";
import style from "./FilterPill.css" with { type: "css" };


class FilterPill extends BaseElement {

    constructor() {
        super();

        this._label = this.shadowRoot.querySelector("span");
        this._clearButton = this.shadowRoot.querySelector("button");

        this.target = null;
    }

    static template = `
        <div part="base">
            <span></span>
            <button>
                <vector-icon name="close"></vector-icon>
            </button>
        </div>
    `;

    static styles = [style];

    static get properties() {
        return { "label": String };
    }

    connectedCallback() {
        super.connectedCallback();
        this._clearButton.addEventListener("click", this.dispatchRemoveEvent);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._label.textContent = newValue || "";
    }

    disconnectedCallback() {
        this._clearButton.removeEventListener("click", this.dispatchRemoveEvent);
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