import style from "./SearchBox.css" with { type: "css" };


class SearchBox extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    get value() {
        return this.shadowRoot.querySelector("input").value;
    }

    set value(newValue) {
        this.shadowRoot.querySelector("input").value = newValue;
    }

    connectedCallback() {
        const wrapper = document.createElement("search");
        wrapper.setAttribute("part", "base");

        const searchIcon = document.createElement("vector-icon");
        searchIcon.setAttribute("name", "search");

        const input = document.createElement("input");
        input.setAttribute("part", "input");
        input.setAttribute("type", "text");
        input.setAttribute("name", "search");
        input.setAttribute("placeholder", this.getAttribute("placeholder") ?? "");
        this.removeAttribute("placeholder");

        const clearButton = document.createElement("button");
        clearButton.setAttribute("aria-label", "Clear input");
        clearButton.addEventListener("click", this.clearInput);
        const clearIcon = document.createElement("vector-icon");
        clearIcon.setAttribute("name", "close");
        clearButton.appendChild(clearIcon);

        wrapper.append(searchIcon, input, clearButton);
        this.shadowRoot.appendChild(wrapper);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("button").removeEventListener("click", this.clearInput);
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