import style from "./SearchBox.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="base">
        <vector-icon name="search" part="search-icon"></vector-icon>
        <input type="text" name="search" placeholder="" part="input">
        <button aria-label="Clear input" part="clear-button">
            <vector-icon name="close"></vector-icon>
        </button>
    </div>
`;


class SearchBox extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._input = this.shadowRoot.querySelector("input");
        this._clearButton = this.shadowRoot.querySelector("button");
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

        this._clearButton.addEventListener("click", this.clearInput);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._input.placeholder = newValue || "";
    }

    disconnectedCallback() {
        this._clearButton.removeEventListener("click", this.clearInput);
    }

    get value() {
        return this._input.value;
    }

    set value(newValue) {
        this._input.value = newValue;
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
        this._input.focus();

        this.dispatchEvent(new CustomEvent("input", {
            composed: true,
            bubbles: true
        }));
    }
}


customElements.define("search-box", SearchBox);