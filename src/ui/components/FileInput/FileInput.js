import style from "./FileInput.css" with { type: "css" };


class FileInput extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();

        const wrapper = document.createElement("label");
        wrapper.part.add("base");

        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", this.updateState);

        const icon = document.createElement("vector-icon");
        icon.setAttribute("name", "upload");
        icon.part.add("icon");

        const label = document.createElement("span");
        label.textContent = "Upload file";
        label.part.add("label");

        wrapper.append(input, icon, label);
        this.shadowRoot.append(wrapper);
    }

    static get observedAttributes() {
        return ["accept"];
    }

    connectedCallback() {
        if (this.hasOwnProperty("accept")) {
            const acceptType = this.accept;
            delete this.accept;
            this.accept = acceptType;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.shadowRoot.querySelector("input").accept = this.hasAttribute("accept");
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("input").removeEventListener("change", this.switchIcon);
    }

    get accept() {
        return this.getAttribute("accept");
    }

    set accept(value) {
        this.setAttribute("accept", value);
    }

    get file() {
        return this.shadowRoot.querySelector("input").files[0];
    }

    clear() {
        this.shadowRoot.querySelector("input").value = null;
        this.shadowRoot.querySelector("[part='icon']").setAttribute("name", "upload");
        this.shadowRoot.querySelector("[part='label']").textContent = "Upload file";
        this._internals.states.delete("uploaded");
    }

    updateState = (event) => {
        const icon = this.shadowRoot.querySelector("[part='icon']");
        const label = this.shadowRoot.querySelector("[part='label']");
        const file = event.target.files[0];
        
        if (file) {
            icon.name = "check";
            label.textContent = file.name;
            this._internals.states.add("uploaded");
        }
        else {
            icon.name = "upload";
            label.textContent = "Upload file";
            this._internals.states.delete("uploaded");
        }

        this.dispatchEvent(new CustomEvent("change", {
            bubbles: true,
            composed: true,
            detail: file
        }));
    }
}


customElements.define("file-input", FileInput);