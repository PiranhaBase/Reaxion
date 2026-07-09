import style from "./FilterBox.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="base">
        <search></search>
        <div part="options">
            <slot></slot>
        </div>
    </div>
`;


class FilterBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._searchContainer = this.shadowRoot.querySelector("search");
        this._searchBox = null;
    }

    static get observedAttributes() {
        return ["search-placeholder"];
    }

    connectedCallback() {
        if (this.hasOwnProperty("searchPlaceholder")) {
            const placeholder = this.searchPlaceholder;
            delete this.searchPlaceholder;
            this.searchPlaceholder = placeholder;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue !== null) {
            if (this._searchBox) searchBox.placeholder = newValue;
            else {
                const searchBox = document.createElement("search-box");
                searchBox.placeholder = newValue;
                searchBox.setAttribute("exportparts", "base:search-box, input:search-input");
                searchBox.addEventListener("input", this.render);
                this._searchContainer.replaceChildren(searchBox);
            }
        }

        else {
            if (this._searchBox) {
                this._searchBox.removeEventListener("input", this.render);
                this._searchBox.remove();
            }
        }
    }

    disconnectedCallback() {
        this._searchBox?.removeEventListener("input", this.render);
    }

    get searchPlaceholder() {
        return this.getAttribute("search-placeholder");
    }

    set searchPlaceholder(value) {
        this.setAttribute("search-placeholder", value);
    }

    get selected() {
        const checkedOptions = [];
        for (const option of this.querySelectorAll("filter-item")) {
            if (option.checked) checkedOptions.push(option.value);
        }
        return checkedOptions;
    }

    render = (event) => {
        const pattern = new RegExp(event.target.value, "i");

        for (const filterItem of this.querySelectorAll("filter-item")) {
            if (pattern.test(filterItem.pattern)) filterItem.hidden = false;
            else filterItem.hidden = true;
        }

        event.stopPropagation();
    }
}


customElements.define("filter-box", FilterBox);