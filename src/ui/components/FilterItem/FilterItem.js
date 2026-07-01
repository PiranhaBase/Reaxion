import style from "./FilterItem.css" with { type: "css" };


class FilterItem extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    get checked() {
        return this.shadowRoot.querySelector("input").checked;
    }

    set checked(value) {
        this.shadowRoot.querySelector("input").checked = value;
    }

    get value() {
        return this.getAttribute("value");
    }

    hide() {
        this.shadowRoot.querySelector("[part='base']").setAttribute("hidden", "");
    }

    view() {
        this.shadowRoot.querySelector("[part='base']").removeAttribute("hidden");
    }

    connectedCallback() {
        const wrapper = document.createElement("div");
        wrapper.part.add("base");
        const label = document.createElement("label");
        label.textContent = this.textContent;
        label.setAttribute("for", this.textContent.replace(/\s+/g, ""));
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.part.add("checkbox");
        checkbox.id = this.textContent.replace(/\s+/g, "");
        wrapper.append(label, checkbox);
        this.shadowRoot.append(wrapper);
        this.replaceChildren();
    }
}


customElements.define("filter-item", FilterItem);