import style from "./FilterBox.css" with { type: "css" };


class FilterBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const wrapper = document.createElement("div");
        wrapper.setAttribute("part", "base");

        const searchWrapper = document.createElement("search");

        const options = document.createElement("div");
        options.part.add("options");
        const optionSlot = document.createElement("slot");
        options.append(optionSlot);

        wrapper.append(searchWrapper, options);

        this.shadowRoot.append(wrapper);
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
            const searchBox = document.createElement("search-box");
            searchBox.setAttribute("placeholder", newValue);
            searchBox.setAttribute("part", "search-box");
            searchBox.setAttribute("exportparts", "base:search-base, input:search-input");
            searchBox.addEventListener("input", this.render);
            this.shadowRoot.querySelector("search").replaceChildren(searchBox);
        }
        else {
            const searchBox = this.shadowRoot.querySelector("search-box");
            if (searchBox) {
                searchBox.removeEventListener("input", this.render);
                searchBox.remove();
            }
        }
    }

    disconnectedCallback() {
        if (this.hasAttribute("search-placeholder")) {
            this.shadowRoot.querySelector("search-box").removeEventListener("input", this.render);
        }
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
        event.stopPropagation();
        const pattern = new RegExp(event.target.value, "i");
        for (const filterItem of this.querySelectorAll("filter-item")) {
            if (pattern.test(filterItem.getAttribute("pattern"))) filterItem.hidden = false;
            else filterItem.hidden = true;
        }
    }
}


customElements.define("filter-box", FilterBox);