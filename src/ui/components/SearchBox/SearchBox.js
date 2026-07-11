import BaseElement from "../../../utils/BaseElement.js";
import style from "./SearchBox.css" with { type: "css" };


class SearchBox extends BaseElement {
    
    constructor() {
        super();
        this._input = this.shadowRoot.querySelector("input");
        this._clearButton = this.shadowRoot.querySelector("button");
    }

    static template = `
        <div part="base">
            <vector-icon name="search" part="search-icon"></vector-icon>
            <input type="text" name="search" placeholder="" part="input">
            <button aria-label="Clear input" part="clear-button">
                <vector-icon name="close"></vector-icon>
            </button>
        </div>
    `;

    static styles = [style];

    static get properties() {
        return { placeholder: String };
    }

    onMount() {
        this._clearButton.addEventListener("click", this.clearInput);
    }

    onUpdate(property, oldValue, newValue) {
        this._input.placeholder = newValue || "";
    }

    onUnmount() {
        this._clearButton.removeEventListener("click", this.clearInput);
    }

    get value() {
        return this._input.value;
    }

    set value(newValue) {
        this._input.value = newValue;
    }

    clearInput = (event) => {
        event.stopPropagation();

        this.value = "";
        this._input.focus();

        this.dispatchEvent(new CustomEvent("input", {
            composed: true,
            bubbles: true
        }));
    }
}


customElements.define("search-box", SearchBox);