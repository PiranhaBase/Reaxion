import BaseElement from "../../../utils/BaseElement.js";
import style from "./DropdownTrigger.css" with { type: "css" };


class DropdownTrigger extends BaseElement {

    static properties = { label: String };

    static styles = [style];

    static template = `
        <button part="base">
            <span></span>
            <slot name="icon">
                <vector-icon name="dropdown"></vector-icon>
            </slot>
        </button>
        <div class="backdrop"></div>
        <slot></slot>
    `;

    constructor() {
        super();

        this._dropdown = null;

        this._trigger = this.shadowRoot.querySelector("button");
        this._backdrop = this.shadowRoot.querySelector(".backdrop");
        this._text = this.shadowRoot.querySelector("span");
        this._dropdownSlot = this.shadowRoot.querySelector("slot:not([name])");
    }

    onUpdate(property, oldValue, newValue) {
        this._text.textContent = newValue || "";
    }

    onMount() {
        this._trigger.addEventListener("click", this.viewDropdown);
        this._backdrop.addEventListener("click", this.hideDropdown);
        this._dropdownSlot.addEventListener("slotchange", this.initializeDropdown);
    }

    onUnmount() {
        this._trigger.removeEventListener("click", this.viewDropdown);
        this._backdrop.removeEventListener("click", this.hideDropdown);
        this._dropdownSlot.removeEventListener("slotchange", this.initializeDropdown);
    }

    initializeDropdown = (event) => {
        this._dropdown = event.target.assignedElements()[0];
    }

    viewDropdown = (event) => {
        this._trigger.dataset.active = "";
    }

    hideDropdown = (event) => {
        delete this._trigger.dataset.active;
    }
}

customElements.define("dropdown-trigger", DropdownTrigger);