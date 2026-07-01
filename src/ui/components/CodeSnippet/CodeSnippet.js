import style from "./CodeSnippet.css" with { type: "css" };

import hljs from "../../../../lib/highlight/core.min.js";
import javascript from "../../../../lib/highlight/languages/javascript.min.js";
import githubDark from "../../../../lib/highlight/styles/github-dark.min.css" with { type: "css" };


class CodeSnippet extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style, githubDark];
    }

    connectedCallback() {
        const base = document.createElement("pre");
        const header = document.createElement("header");
        const title = document.createElement("h6");
        title.textContent = this.getAttribute("lang");
        const copyButton = document.createElement("copy-button");
        copyButton.setAttribute("part", "copy-button");
        copyButton.textContent = "Copy code";
        copyButton.addEventListener("click", this.copyCode);
        header.append(title, copyButton);
        header.setAttribute("part", "header");
        const snippet = document.createElement("code");
        snippet.textContent = this.textContent.trim();
        try {
            hljs.highlightElement(snippet);
        }
        catch (error) {
            console.error(error);
        }
        snippet.setAttribute("part", "snippet");
        base.setAttribute("part", "base");
        base.append(header, snippet);
        this.replaceChildren();
        this.shadowRoot.appendChild(base);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("copy-button").removeEventListener("click", this.copyCode);
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


hljs.registerLanguage('javascript', javascript);
customElements.define("code-snippet", CodeSnippet);