import style from "./CopyButton.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <button part="base">
        <vector-icon name="copy"></vector-icon>
    </button>
`;


class CopyButton extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));
        this._internals = this.attachInternals();

        this._icon = this.shadowRoot.querySelector("vector-icon");
    }

    connectedCallback() {
        this.shadowRoot.querySelector("button").ariaLabel = this.textContent;
        this.replaceChildren();
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