import style from "./CopyButton.css" with { type: "css" };


class CopyButton extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [style];
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        const button = document.createElement("button");
        button.ariaLabel = this.textContent;
        const copyIcon = document.createElement("vector-icon");
        copyIcon.setAttribute("name", "copy");
        button.appendChild(copyIcon);
        this.replaceChildren();
        this.shadowRoot.appendChild(button);
    }

    showFeedback(success, duration=2000) {
        const icon = this.shadowRoot.querySelector("vector-icon");
        icon.setAttribute("name", (success) ? "check" : "cross");
        this._internals.states.add((success) ? "success" : "failure");
        setTimeout(() => {
            icon.setAttribute("name", "copy");
            this._internals.states.clear();
        }, duration);
    }
}


customElements.define("copy-button", CopyButton);