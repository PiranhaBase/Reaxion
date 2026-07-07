import style from "./CopyButton.css" with { type: "css" };


class CopyButton extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();

        const button = document.createElement("button");
        button.part.add("base");

        const copyIcon = document.createElement("vector-icon");
        copyIcon.name = "copy";

        button.appendChild(copyIcon);
        this.shadowRoot.appendChild(button);
    }

    showFeedback(success, duration=2000) {
        const icon = this.shadowRoot.querySelector("vector-icon");
        icon.name = (success) ? "check" : "cross";

        this._internals.states.add((success) ? "success" : "failure");

        setTimeout(() => {
            icon.name = "copy";
            this._internals.states.clear();
        }, duration);
    }
}


customElements.define("copy-button", CopyButton);