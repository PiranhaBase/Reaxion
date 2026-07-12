import BaseElement from "../../../utils/BaseElement.js";
import style from "./CopyButton.css" with { type: "css" };


class CopyButton extends BaseElement {

    static styles = [style];

    static template = `
        <button part="base">
            <vector-icon name="copy"></vector-icon>
        </button>
    `;
    
    constructor() {
        super();
        this._internals = this.attachInternals();

        this._trigger = this.shadowRoot.querySelector("button");
        this._icon = this.shadowRoot.querySelector("vector-icon");
    }

    onTextChange(label) {
        this._trigger.ariaLabel = label;
    }

    showFeedback(success, duration=2000) {
        this._icon.name = (success) ? "check" : "cross";

        this._internals.states.add((success) ? "success" : "failure");

        setTimeout(() => {
            this._icon.name = "copy";
            this._internals.states.clear();
        }, duration);
    }
}


customElements.define("copy-button", CopyButton);