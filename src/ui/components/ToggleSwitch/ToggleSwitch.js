import style from "./ToggleSwitch.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="base">
        <label for="toggle-input"></label>
        <input type="checkbox" part="switch" id="toggle-input">
    </div>
`;


class ToggleSwitch extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));
        this._internals = this.attachInternals();

        this._label = this.shadowRoot.querySelector("label");
        this._switch = this.shadowRoot.querySelector("input");
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

        this._switch.addEventListener("input", this.toggle);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "label") {
            this._label.textContent = newValue || "";
        }

        else if (name === "checked") {
            if (newValue !== null) {
                this._internals.states.add("checked");
                this._switch.checked = true;
            }
            else {
                this._internals.states.delete("checked");
                this._switch.checked = false;
            }
        }
    }

    disconnectedCallback() {
        this._switch.removeEventListener("change", this.toggle);
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