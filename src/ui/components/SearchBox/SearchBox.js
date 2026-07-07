import style from "./SearchBox.css" with { type: "css" };


class SearchBox extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [style];

        const wrapper = document.createElement("div");
        wrapper.part.add("base");

        const searchIcon = document.createElement("vector-icon");
        searchIcon.name = "search";
        searchIcon.part.add("search-icon");

        const input = document.createElement("input");
        input.part.add("input");
        input.type = "text";
        input.name = "search";
        input.placeholder = "";

        const clearButton = document.createElement("button");
        clearButton.ariaLabel = "Clear input";
        clearButton.addEventListener("click", this.clearInput);

        const clearIcon = document.createElement("vector-icon");
        clearIcon.name = "close";

        clearButton.appendChild(clearIcon);
        clearButton.part.add("clear-icon");

        wrapper.append(searchIcon, input, clearButton);

        this.shadowRoot.appendChild(wrapper);
    }

    static get observedAttributes() {
        return ["placeholder"];
    }

    connectedCallback() {
        if (this.hasOwnProperty("placeholder")) {
            const text = this.placeholder;
            delete this.placeholder;
            this.placeholder = text;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.shadowRoot.querySelector("input").placeholder = newValue || "";
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("button").removeEventListener("click", this.clearInput);
    }

    get value() {
        return this.shadowRoot.querySelector("input").value;
    }

    set value(newValue) {
        this.shadowRoot.querySelector("input").value = newValue;
    }

    get placeholder() {
        return this.getAttribute("placeholder");
    }

    set placeholder(text) {
        this.setAttribute("placeholder", text);
    }

    clearInput = (event) => {
        event.stopPropagation();
        this.value = "";
        this.shadowRoot.querySelector("input").focus();
        this.dispatchEvent(new CustomEvent("input", {
            composed: true,
            bubbles: true
        }));
    }
}


customElements.define("search-box", SearchBox);