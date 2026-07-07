import style from "./FilterPill.css" with { type: "css" };

class FilterPill extends HTMLElement {

    constructor() {
        super();
        this.target = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const base = document.createElement("div");
        base.part.add("base");

        const label = document.createElement("span");

        const clearButton = document.createElement("button");
        clearButton.addEventListener("click", this.dispatchRemoveEvent);

        const clearIcon = document.createElement("vector-icon");
        clearIcon.name = "close";

        clearButton.append(clearIcon);

        base.append(label, clearButton);
        this.shadowRoot.append(base);
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
        this.shadowRoot.querySelector("span").textContent = newValue || "";
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("button").removeEventListener("click", this.dispatchRemoveEvent);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    dispatchRemoveEvent = (event) => {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("input", {
            bubbles: true,
            composed: true,
            detail: { name: this.shadowRoot.querySelector("span").textContent }
        }));
    }
}

customElements.define("filter-pill", FilterPill);