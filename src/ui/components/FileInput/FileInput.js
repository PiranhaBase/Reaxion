import style from "./FileInput.css" with { type: "css" };


class FileInput extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();
    }

    get file() {
        return this.shadowRoot.querySelector("input").files[0];
    }

    connectedCallback() {
        const label = document.createElement("label");
        label.part.add("base");

        const input = document.createElement("input");
        input.type = "file";
        input.accept = this.getAttribute("accept");
        input.addEventListener("change", this.switchIcon);
        this.removeAttribute("accept");

        const icon = document.createElement("vector-icon");
        icon.setAttribute("name", "upload");
        icon.part.add("icon");

        const labelText = document.createElement("span");
        labelText.textContent = "Upload file";
        labelText.part.add("label");

        label.append(input, icon, labelText);
        this.shadowRoot.appendChild(label);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("input").removeEventListener("change", this.switchIcon);
    }

    switchIcon = (event) => {
        const icon = this.shadowRoot.querySelector("[part='icon']");
        const labelText = this.shadowRoot.querySelector("[part='label']");
        const file = event.target.files[0];
        if (file) {
            icon.setAttribute("name", "check");
            labelText.textContent = file.name;
            this._internals.states.add("uploaded");
        }
        else {
            icon.setAttribute("name", "upload");
            labelText.textContent = "Upload file";
            this._internals.states.delete("uploaded");
        }
    }
}


customElements.define("file-input", FileInput);