import BaseElement from "../../../utils/BaseElement.js";
import style from "./SearchBox.css" with { type: "css" };


class SearchBox extends BaseElement {

    static properties = { placeholder: String };

    static styles = [style];

    static template = `
        <div part="base">
            <vector-icon name="search" part="search-icon"></vector-icon>
            <input type="text" name="search" placeholder="" part="input">
            <button aria-label="Clear input" part="clear-button">
                <vector-icon name="close"></vector-icon>
            </button>
        </div>
    `;
    
    constructor() {
        super();
        this._input = this.shadowRoot.querySelector("input");
        this._clearButton = this.shadowRoot.querySelector("button");
    }

    get value() {
        return this._input.value;
    }

    set value(newValue) {
        this._input.value = newValue;
    }

    onUpdate(property, oldValue, newValue) {
        this._input.placeholder = newValue || "";
    }

    onMount() {
        this._clearButton.addEventListener("click", this.clearInput);
    }

    onUnmount() {
        this._clearButton.removeEventListener("click", this.clearInput);
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