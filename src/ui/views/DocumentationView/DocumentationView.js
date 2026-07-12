import ViewElement from "../../../utils/ViewElement.js";
import style from "./DocumentationView.css" with { type: "css" };
import { fetchDocumentation } from "../../../services/data.js";

import { marked } from "../../../../lib/marked/marked.esm.js";
import katexStyle from "../../../../lib/katex/katex.min.css" with { type: "css" };
import katexFonts from "../../../../lib/katex/katex-fonts.css" with { type: "css" };
import katex from "../../../../lib/katex/katex.js";
import "../../../../lib/katex/contrib/mhchem.js";
import renderMathInElement from "../../../../lib/katex/contrib/auto-render.js";


class DocumentationView extends ViewElement {

    static styles = [katexStyle, style];

    static template = `
        <main>
            <header>
                <slot></slot>
            </header>
            <section></section>
        </main>
    `;
    
    constructor() {
        super();
        this._content = this.shadowRoot.querySelector("section");
    }

    async setup() {
        document.adoptedStyleSheets.push(katexFonts);

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
                    return `<code-snippet language="${token.lang || "plaintext"}">${token.text}</code-snippet>`;
                }
            }
        });

        this._content.innerHTML = marked.parse(await fetchDocumentation());
        
        try {
            renderMathInElement(this.shadowRoot, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ],
                macros: { "\\arraystretch": "1.4" },
                ignoredTags: ["code-snippet"]
            });
        }
        catch (error) {
            console.error(error);
        }
    }
}


customElements.define("documentation-view", DocumentationView);