import BaseElement from "../../../utils/BaseElement.js";
import style from "./FilterPill.css" with { type: "css" };


class FilterPill extends BaseElement {

    static styles = [style];

    static template = `
        <div part="base">
            <span></span>
            <button>
                <vector-icon name="close"></vector-icon>
            </button>
        </div>
    `;

    constructor() {
        super();

        this._label = this.shadowRoot.querySelector("span");
        this._clearButton = this.shadowRoot.querySelector("button");

        this.target = null;
    }

    onMount() {
        this._clearButton.addEventListener("click", this.notifyRemoval);
    }

    onTextChange(label) {
        this._label.textContent = label;
    }

    onUnmount() {
        this._clearButton.removeEventListener("click", this.notifyRemoval);
    }

    notifyRemoval = (event) => {
        event.stopPropagation();
        
        this.dispatchEvent(new CustomEvent("input", {
            bubbles: true,
            composed: true,
            detail: { name: this._label.textContent }
        }));
    }
}

customElements.define("filter-pill", FilterPill);