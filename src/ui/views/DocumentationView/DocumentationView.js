import style from "./DocumentationView.css" with { type: "css" };
import shared from "../../styles/global.css" with { type: "css" };
import { fetchDocumentation } from "../../../services/data.js";

import { marked } from "../../../../lib/marked/marked.esm.js";
import katexStyle from "../../../../lib/katex/katex.min.css" with { type: "css" };
import katexFonts from "../../../../lib/katex/katex-fonts.css" with { type: "css" };
import katex from "../../../../lib/katex/katex.js";
import "../../../../lib/katex/contrib/mhchem.js";
import renderMathInElement from "../../../../lib/katex/contrib/auto-render.js";


class DocumentationView extends HTMLElement {
    
    constructor() {
        super();
        this.initialized = false;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [katexStyle, shared, style];
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, katexFonts];
    }

    connectedCallback() {
        const base = document.createElement("main");

        const header = document.createElement("header");
        const heading = document.createElement("slot");
        header.append(heading);
        
        const section = document.createElement("section");

        base.append(header, section);

        this.shadowRoot.appendChild(base);
    }

    async initialize() {
        this.initialized = true;

        const blockMathExtension = {
            name: 'blockMath',
            level: 'block',
            start(src) {
                return src.match(/\$\$/)?.index;
            },
            tokenizer(src, tokens) {
                const match = /^\$\$([^$]+?)\$\$/.exec(src);
                if (match) return { type: 'blockMath', raw: match[0], text: match[1] };
            },
            renderer(token) {
                return `<div>$$${token.text}$$</div>`;
            }
        };
        
        const inlineMathExtension = {
            name: 'inlineMath',
            level: 'inline',
            start(src) {
                return src.match(/\$/)?.index;
            },
            tokenizer(src, tokens) {
                const match = /^\$([^$\n]+?)\$/.exec(src);
                if (match) return { type: 'inlineMath', raw: match[0], text: match[1] };
            },
            renderer(token) {
                return `<span>$${token.text}$</span>`;
            }
        };

        marked.use({
            extensions: [blockMathExtension, inlineMathExtension],

            renderer: {
                code(token) {
                    return `<code-snippet lang="${token.lang || "plaintext"}">${token.text}</code-snippet>`;
                }
            }
        });

        this.shadowRoot.querySelector("section").innerHTML = marked.parse(await fetchDocumentation());
        
        try {
            renderMathInElement(this.shadowRoot, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ],
                macros: { "\\arraystretch": "1.4" }
            });
        }
        catch (error) {
            console.error(error);
        }
    }
}


customElements.define("documentation-view", DocumentationView);