import BaseElement from "../../../utils/BaseElement.js";
import style from "./ToggleSwitch.css" with { type: "css" };


class ToggleSwitch extends BaseElement {

    constructor() {
        super();
        this._internals = this.attachInternals();

        this._label = this.shadowRoot.querySelector("label");
        this._switch = this.shadowRoot.querySelector("input");
    }

    static template = `
        <div part="base">
            <label for="toggle-input"></label>
            <input type="checkbox" part="switch" id="toggle-input">
        </div>
    `;

    static styles = [style];

    static get properties() {
        return {
            "label": String,
            "checked": Boolean
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._switch.addEventListener("input", this.toggle);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "label") {
            this._label.textContent = newValue || "";
        }

        else if (name === "checked") {
            if (newValue !== null) {
                this._internals.states.add("checked");
                this._switch.checked = true;
            }
            else {
                this._internals.states.delete("checked");
                this._switch.checked = false;
            }
        }
    }

    disconnectedCallback() {
        this._switch.removeEventListener("change", this.toggle);
    }

    toggle = (event) => {
        this.checked = event.target.checked;
    }
}


customElements.define("toggle-switch", ToggleSwitch);