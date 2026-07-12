import BaseElement from "../../../utils/BaseElement.js";
import style from "./ToggleSwitch.css" with { type: "css" };


class ToggleSwitch extends BaseElement {

    static properties = { checked: Boolean };

    static styles = [style];

    static template = `
        <div part="base">
            <label for="toggle-input"></label>
            <input type="checkbox" part="switch" id="toggle-input">
        </div>
    `;

    constructor() {
        super();
        this._internals = this.attachInternals();

        this._label = this.shadowRoot.querySelector("label");
        this._switch = this.shadowRoot.querySelector("input");
    }

    onUpdate(property, oldValue, newValue) {
        if (newValue) {
            this._internals.states.add("checked");
            this._switch.checked = true;
        }
        else {
            this._internals.states.delete("checked");
            this._switch.checked = false;
        }
    }

    onMount() {
        this._switch.addEventListener("input", this.toggle);
    }

    onTextChange(label) {
        this._label.textContent = label;
    }

    onUnmount() {
        this._switch.removeEventListener("change", this.toggle);
    }

    toggle = (event) => {
        this.checked = event.target.checked;
    }
}


customElements.define("toggle-switch", ToggleSwitch);