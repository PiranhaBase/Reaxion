import style from "./FilterItem.css" with { type: "css" };


class FilterItem extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();

        const wrapper = document.createElement("div");
        wrapper.part.add("base");

        const label = document.createElement("label");
        label.setAttribute("for", "checkbox-input");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.part.add("checkbox");
        checkbox.id = "checkbox-input";
        checkbox.addEventListener("input", this.toggle);

        wrapper.append(label, checkbox);

        this.shadowRoot.append(wrapper);
    }

    static get observedAttributes() {
        return ["label", "value", "pattern", "checked", "hidden"];
    }

    connectedCallback() {
        for (const property of ["label", "value", "pattern", "checked"]) {
            if (this.hasOwnProperty(property)) {
                const propertyValue = this[property];
                delete this[property];
                this[property] = propertyValue;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "label") {
            this.shadowRoot.querySelector("label").textContent = newValue || "";
        }
        else if (name === "checked") {
            if (newValue !== null) {
                this._internals.states.add("checked");
                this.shadowRoot.querySelector("input").checked = true;
            }
            else {
                this._internals.states.delete("checked");
                this.shadowRoot.querySelector("input").checked = false;
            }
        }
        else if (name === "hidden") {
            if (newValue !== null) {
                this.shadowRoot.querySelector("[part='base']").hidden = true;
            }
            else this.shadowRoot.querySelector("[part='base']").hidden = false;
        }
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("input").removeEventListener("input", this.toggle);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(newValue) {
        this.setAttribute("value", newValue);
    }

    get pattern() {
        return this.getAttribute("pattern");
    }

    set pattern(newPattern) {
        this.setAttribute("pattern", newPattern);
    }

    get checked() {
        return this.hasAttribute("checked");
    }

    set checked(value) {
        if (value) this.setAttribute("checked", "");
        else this.removeAttribute("checked");
    }

    toggle = (event) => {
        this.checked = event.target.checked;
    }
}


customElements.define("filter-item", FilterItem);