import style from "./FilterItem.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="base">
        <label for="checkbox-input"></label>
        <input type="checkbox" part="checkbox" id="checkbox-input">
    </div>
`;


class FilterItem extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));
        this._internals = this.attachInternals();

        this._base = this.shadowRoot.querySelector("[part='base']");
        this._label = this.shadowRoot.querySelector("label");
        this._checkbox = this.shadowRoot.querySelector("input");

        this._checkbox.addEventListener("input", this.toggle);
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
            this._label.textContent = newValue || "";
        }

        else if (name === "checked") {
            if (newValue !== null) {
                this._internals.states.add("checked");
                this._checkbox.checked = true;
            }
            else {
                this._internals.states.delete("checked");
                this._checkbox.checked = false;
            }
        }

        else if (name === "hidden") {
            if (newValue !== null) {
                this._base.hidden = true;
            }
            else this._base.hidden = false;
        }
    }

    disconnectedCallback() {
        this._checkbox.removeEventListener("input", this.toggle);
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