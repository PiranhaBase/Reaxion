import BaseElement from "../../../utils/BaseElement.js";
import style from "./FilterItem.css" with { type: "css" };


class FilterItem extends BaseElement {

    constructor() {
        super();
        this._internals = this.attachInternals();

        this._label = this.shadowRoot.querySelector("label");
        this._checkbox = this.shadowRoot.querySelector("input");
    }

    static template = `
        <div part="base">
            <label for="checkbox-input"></label>
            <input type="checkbox" part="checkbox" id="checkbox-input">
        </div>
    `;

    static styles = [style];

    static get properties() {
        return {
            value: String,
            pattern: String,
            checked: Boolean
        };
    }

    onMount() {
        this._checkbox.addEventListener("input", this.toggle);
    }

    onUpdate(property, oldValue, newValue) {
        if (property === "checked") {
            if (newValue) {
                this._internals.states.add("checked");
                this._checkbox.checked = true;
            }
            else {
                this._internals.states.delete("checked");
                this._checkbox.checked = false;
            }
        }
    }

    onTextChange(label) {
        this._label.textContent = label;
    }

    onUnmount() {
        this._checkbox.removeEventListener("input", this.toggle);
    }

    toggle = (event) => {
        this.checked = event.target.checked;
    }
}


customElements.define("filter-item", FilterItem);