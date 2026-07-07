import style from "./ToggleSwitch.css" with { type: "css" };


class ToggleSwitch extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();

        const wrapper = document.createElement("div");
        wrapper.part.add("base");

        const label = document.createElement("label");
        label.setAttribute("for", "toggle-input");

        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.id = "toggle-input";
        toggle.part.add("switch");
        toggle.addEventListener("input", this.toggle);

        wrapper.append(label, toggle);

        this.shadowRoot.append(wrapper);
    }

    static get observedAttributes() {
        return ["label", "checked"];
    }

    connectedCallback() {
        for (const property of ["label", "checked"]) {
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
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("input").removeEventListener("change", this.toggle);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
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


customElements.define("toggle-switch", ToggleSwitch);