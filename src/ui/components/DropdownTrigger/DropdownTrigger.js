import style from "./DropdownTrigger.css" with { type: "css" };

class DropdownTrigger extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const trigger = document.createElement("button");
        trigger.part.add("base");
        trigger.addEventListener("click", this.toggleDropdown);

        const iconSlot = document.createElement("slot");
        iconSlot.name = "icon";
        const dropdownIcon = document.createElement("vector-icon");
        dropdownIcon.name = "dropdown";
        iconSlot.append(dropdownIcon);

        const backdrop = document.createElement("div");
        backdrop.classList.add("backdrop");

        const dropdownSlot = document.createElement("slot");
        dropdownSlot.addEventListener("slotchange", this.initializeDropdown);

        trigger.append(iconSlot, backdrop, dropdownSlot);
        this.shadowRoot.append(trigger);
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
        this.shadowRoot.querySelector("[part='base']").prepend(newValue || "");
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("slot").removeEventListener("slotchange", this.initializeDropdown);
        this.shadowRoot.querySelector("button").removeEventListener("click", this.toggleDropdown);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    initializeDropdown = (event) => {
        const dropdown = event.target.assignedElements()[0];
        if (dropdown) dropdown.classList.add("dropdown");
    }

    toggleDropdown = (event) => {
        if (event.target.closest(".dropdown")) return;
        this.shadowRoot.querySelector("button").toggleAttribute("data-active");
    }
}

customElements.define("dropdown-trigger", DropdownTrigger);