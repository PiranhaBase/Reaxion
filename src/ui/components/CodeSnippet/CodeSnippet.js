import BaseElement from "../../../utils/BaseElement.js";
import style from "./CodeSnippet.css" with { type: "css" };

import hljs from "../../../../lib/highlight/core.min.js";
import javascript from "../../../../lib/highlight/languages/javascript.min.js";
import githubDark from "../../../../lib/highlight/styles/github-dark.min.css" with { type: "css" };


class CodeSnippet extends BaseElement {
    
    constructor() {
        super();

        this._title = this.shadowRoot.querySelector("h6");
        this._copyButton = this.shadowRoot.querySelector("copy-button");
        this._snippet = this.shadowRoot.querySelector("code");
    }

    static template = `
        <div part="base">
            <header part="header">
                <h6>plaintext</h6>
                <copy-button part="copy-button">Copy code</copy-button>
            </header>
            <pre><code part="snippet"></code></pre>
        </div>
    `;

    static styles = [style, githubDark];

    static get properties() {
        return { "language": String };
    }

    connectedCallback() {
        super.connectedCallback();

        this._snippet.textContent = this.textContent.trim();
        try {
            hljs.highlightElement(this._snippet);
        }
        catch (error) {
            console.error(error);
        }
        this.replaceChildren();

        this._copyButton.addEventListener("click", this.copyCode);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._title.textContent = newValue || "plaintext";
    }

    disconnectedCallback() {
        this._copyButton.removeEventListener("click", this.copyCode);
    }

    copyCode = async (event) => {
        try {
            await navigator.clipboard.writeText(this._snippet.textContent);
            this._copyButton.showFeedback(true);
        }
        catch (error) {
            console.error(error);
            this._copyButton.showFeedback(false);
        }
    }
}


hljs.registerLanguage("javascript", javascript);
customElements.define("code-snippet", CodeSnippet);