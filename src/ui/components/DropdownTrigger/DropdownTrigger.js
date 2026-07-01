import style from "./DropdownTrigger.css" with { type: "css" };

class DropdownTrigger extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        const trigger = document.createElement("button");
        trigger.setAttribute("part", "trigger");
        trigger.textContent = this.getAttribute("name");
        const dropdownIcon = document.createElement("vector-icon");
        dropdownIcon.setAttribute("name", "dropdown");
        trigger.addEventListener("click", this.toggleDropdown);
        const backdrop = document.createElement("div");
        backdrop.classList.add("backdrop");
        const dropdownSlot = document.createElement("slot");
        dropdownSlot.addEventListener("slotchange", this.initializeDropdown);
        trigger.append(dropdownIcon, backdrop, dropdownSlot);
        this.shadowRoot.appendChild(trigger);
        this.removeAttribute("name");
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("slot").removeEventListener("slotchange", this.initializeDropdown);
        this.shadowRoot.querySelector("button").removeEventListener("click", this.toggleDropdown);
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