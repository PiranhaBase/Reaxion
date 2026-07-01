import style from "./FilterBox.css" with { type: "css" };


class FilterBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    get selected() {
        const checkedOptions = [];
        for (const option of this.querySelectorAll("filter-item")) {
            if (option.checked) checkedOptions.push(option.value);
        }
        return checkedOptions;
    }

    connectedCallback() {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("part", "base");
        const searchPlaceholder = this.getAttribute("search-placeholder");
        if (searchPlaceholder) {
            const searchBox = document.createElement("search-box");
            searchBox.setAttribute("placeholder", searchPlaceholder);
            searchBox.setAttribute("part", "search-box");
            searchBox.setAttribute("exportparts", "base:search-base, input:search-input");
            searchBox.addEventListener("input", this.render);
            wrapper.appendChild(searchBox);
            this.removeAttribute("search-placeholder");
        }
        const options = document.createElement("div");
        options.part.add("options");
        const optionSlot = document.createElement("slot");
        options.appendChild(optionSlot);
        wrapper.appendChild(options);
        this.shadowRoot.appendChild(wrapper);
    }

    disconnectedCallback() {
        const searchBox = this.shadowRoot.querySelector("search-box");
        if (searchBox) searchBox.removeEventListener("input", this.render);
    }

    render = (event) => {
        event.stopPropagation();
        const pattern = new RegExp(event.target.value, "i");
        for (const filterItem of this.querySelectorAll("filter-item")) {
            if (pattern.test(filterItem.getAttribute("pattern"))) filterItem.view();
            else filterItem.hide();
        }
    }
}


customElements.define("filter-box", FilterBox);