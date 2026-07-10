import BaseElement from "../../../utils/BaseElement.js";
import style from "./FilterItem.css" with { type: "css" };


class FilterItem extends BaseElement {

    constructor() {
        super();
        this._internals = this.attachInternals();

        this._base = this.shadowRoot.querySelector("[part='base']");
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
            "label": String ,
            "value": String,
            "pattern": String,
            "checked": Boolean
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._checkbox.addEventListener("input", this.toggle);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "label") {
            this._label.textContent = newValue || "";
        }

        else if (name === "checked") {
            if (newValue !== null) {
                this._internals.states.add("checked");
                this._checkbox.checked = true;
            }
            else {
                this._internals.states.delete("checked");
                this._checkbox.checked = false;
            }
        }
    }

    disconnectedCallback() {
        this._checkbox.removeEventListener("input", this.toggle);
    }

    toggle = (event) => {
        this.checked = event.target.checked;
    }
}


customElements.define("filter-item", FilterItem);