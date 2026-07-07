import style from "./CodeSnippet.css" with { type: "css" };

import hljs from "../../../../lib/highlight/core.min.js";
import javascript from "../../../../lib/highlight/languages/javascript.min.js";
import githubDark from "../../../../lib/highlight/styles/github-dark.min.css" with { type: "css" };


class CodeSnippet extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [githubDark, style];

        const base = document.createElement("pre");
        base.part.add("base");

        const header = document.createElement("header");
        header.part.add("header");

        const title = document.createElement("h6");
        title.textContent = "plaintext";

        const copyButton = document.createElement("copy-button");
        copyButton.part.add("copy-button");
        copyButton.textContent = "Copy code";
        copyButton.addEventListener("click", this.copyCode);

        header.append(title, copyButton);

        const snippet = document.createElement("code");
        snippet.part.add("snippet");

        base.append(header, snippet);

        this.shadowRoot.appendChild(base);
    }

    static get observedAttributes() {
        return ["language"];
    }

    connectedCallback() {
        const snippet = this.shadowRoot.querySelector("code");
        snippet.textContent = this.textContent.trim();

        try {
            hljs.highlightElement(snippet);
        }
        catch (error) {
            console.error(error);
        }

        if (this.hasOwnProperty("language")) {
            const language = this.language;
            delete this.language;
            this.language = language;
        }

        this.replaceChildren();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.shadowRoot.querySelector("h6").textContent = newValue || "plaintext";
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("copy-button").removeEventListener("click", this.copyCode);
    }

    get language() {
        return this.getAttribute("language");
    }

    set language(value) {
        this.setAttribute("language", value);
    }

    copyCode = async (event) => {
        try {
            await navigator.clipboard.writeText(this.shadowRoot.querySelector("code").textContent);
            this.shadowRoot.querySelector("copy-button").showFeedback(true);
        }
        catch (error) {
            console.error(error);
            this.shadowRoot.querySelector("copy-button").showFeedback(false);
        }
    }
}


hljs.registerLanguage("javascript", javascript);
customElements.define("code-snippet", CodeSnippet);