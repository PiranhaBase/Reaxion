import style from "./ToggleSwitch.css" with { type: "css" };


class ToggleSwitch extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();
    }

    get checked() {
        return this._internals.states.has("checked");
    }

    set checked(value) {
        this.shadowRoot.querySelector("input").checked = value;
        if (value) this._internals.states.add("checked");
        else this._internals.states.delete("checked")
    }

    connectedCallback() {
        const wrapper = document.createElement("div");
        wrapper.part.add("base");
        const label = document.createElement("label");
        label.textContent = this.textContent;
        label.setAttribute("for", this.textContent.replace(/\s+/g, ""));
        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.id = this.textContent.replace(/\s+/g, "");
        toggle.part.add("switch");
        toggle.addEventListener("change", this.toggle);
        wrapper.append(label, toggle);
        this.shadowRoot.appendChild(wrapper);
        this.replaceChildren();
        this.checked = this.hasAttribute("checked");
        this.removeAttribute("checked");
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("input").removeEventListener("change", this.toggle);
    }

    toggle = (event) => {
        this.checked = this.shadowRoot.querySelector("input").checked;
        this.dispatchEvent(new CustomEvent("change", {
            bubbles: true,
            composed: true,
            detail: { checked: this.checked }
        }));
        event.stopPropagation();
    }
}


customElements.define("toggle-switch", ToggleSwitch);