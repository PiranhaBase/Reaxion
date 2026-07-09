import style from "./FileInput.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <label part="base">
        <input type="file">
        <vector-icon name="upload" part="icon"></vector-icon>
        <span part="label">Upload file</span>
    </label>
`;


class FileInput extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));
        this._internals = this.attachInternals();

        this._input = this.shadowRoot.querySelector("input");
        this._icon = this.shadowRoot.querySelector("vector-icon");
        this._label = this.shadowRoot.querySelector("span");
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

        this._input.addEventListener("change", this.updateState);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._input.accept = this.hasAttribute("accept");
    }

    disconnectedCallback() {
        this._input.removeEventListener("change", this.switchIcon);
    }

    get accept() {
        return this.getAttribute("accept");
    }

    set accept(value) {
        this.setAttribute("accept", value);
    }

    get file() {
        return this._input.files[0];
    }

    clear() {
        this._input.value = null;
        this._icon.name = "upload";
        this._label.textContent = "Upload file";
        this._internals.states.delete("uploaded");
    }

    updateState = (event) => {
        const file = event.target.files[0];
        
        if (file) {
            this._icon.name = "check";
            this._label.textContent = file.name;
            this._internals.states.add("uploaded");
        }
        else {
            this._icon.name = "upload";
            this._label.textContent = "Upload file";
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