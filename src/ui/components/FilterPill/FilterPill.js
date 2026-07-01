import style from "./FilterPill.css" with { type: "css" };

class FilterPill extends HTMLElement {

    constructor() {
        super();
        this.target = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        const base = document.createElement("div");
        base.setAttribute("part", "base");

        const text = document.createElement("span");
        text.textContent = this.textContent;

        const clearButton = document.createElement("button");
        clearButton.addEventListener("click", this.dispatchRemoveEvent);

        const clearIcon = document.createElement("vector-icon");
        clearIcon.setAttribute("name", "close");

        clearButton.appendChild(clearIcon);

        this.replaceChildren();
        base.append(text, clearButton);
        this.shadowRoot.appendChild(base);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("button").removeEventListener("click", this.dispatchRemoveEvent);
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