import BaseElement from "../../../utils/BaseElement.js";
import style from "./DropdownTrigger.css" with { type: "css" };


class DropdownTrigger extends BaseElement {

    constructor() {
        super();

        this._trigger = this.shadowRoot.querySelector("button");
        this._text = this.shadowRoot.querySelector("span");
        this._dropdownSlot = this.shadowRoot.querySelector("slot:not([name])");
    }

    static template = `
        <button part="base">
            <span></span>
            <slot name="icon">
                <vector-icon name="dropdown"></vector-icon>
            </slot>
            <div class="backdrop"></div>
            <slot></slot>
        </button>
    `;

    static styles = [style];

    static get properties() {
        return { label: String };
    }

    onMount() {
        this._trigger.addEventListener("click", this.toggleDropdown);
        this._dropdownSlot.addEventListener("slotchange", this.initializeDropdown);
    }

    onUpdate(property, oldValue, newValue) {
        this._text.textContent = newValue || "";
    }

    onUnmount() {
        this._dropdownSlot.removeEventListener("slotchange", this.initializeDropdown);
        this._trigger.removeEventListener("click", this.toggleDropdown);
    }

    initializeDropdown = (event) => {
        const dropdown = event.target.assignedElements()[0];
        if (dropdown) dropdown.dataset.dropdown = "";
    }

    toggleDropdown = (event) => {
        if (event.target.closest("[data-dropdown]")) return;
        this._trigger.toggleAttribute("data-active");
    }
}

customElements.define("dropdown-trigger", DropdownTrigger);