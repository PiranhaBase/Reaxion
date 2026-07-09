import style from "./DropdownTrigger.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <button part="base">
        <span></span>
        <slot name="icon">
            <vector-icon name="dropdown"></vector-icon>
        </slot>
        <div class="backdrop"></div>
        <slot></slot>
    </button>
`;


class DropdownTrigger extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._trigger = this.shadowRoot.querySelector("button");
        this._text = this.shadowRoot.querySelector("span");
        this._dropdownSlot = this.shadowRoot.querySelector("slot:not([name])");

        this._trigger.addEventListener("click", this.toggleDropdown);
        this._dropdownSlot.addEventListener("slotchange", this.initializeDropdown);
    }

    static get observedAttributes() {
        return ["label"];
    }

    connectedCallback() {
        if (this.hasOwnProperty("label")) {
            const label = this.label;
            delete this.label;
            this.label = label;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._text.textContent = newValue || "";
    }

    disconnectedCallback() {
        this._dropdownSlot.removeEventListener("slotchange", this.initializeDropdown);
        this._trigger.removeEventListener("click", this.toggleDropdown);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
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