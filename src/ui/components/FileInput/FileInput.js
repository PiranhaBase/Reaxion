import BaseElement from "../../../utils/BaseElement.js";
import style from "./FileInput.css" with { type: "css" };


class FileInput extends BaseElement {

    static properties = { accept: String };

    static styles = [style];

    static template = `
        <label part="base">
            <input type="file">
            <vector-icon name="upload" part="icon"></vector-icon>
            <span part="label">Upload file</span>
        </label>
    `;

    constructor() {
        super();
        this._internals = this.attachInternals();

        this._input = this.shadowRoot.querySelector("input");
        this._icon = this.shadowRoot.querySelector("vector-icon");
        this._label = this.shadowRoot.querySelector("span");
    }

    get file() {
        return this._input.files[0];
    }

    onUpdate(property, oldValue, newValue) {
        if (newValue !== null) this._input.accept = newValue;
        else this._input.removeAttribute("accept");
    }

    onMount() {
        this._input.addEventListener("change", this.updateState);
    }

    onUnmount() {
        this._input.removeEventListener("change", this.switchIcon);
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