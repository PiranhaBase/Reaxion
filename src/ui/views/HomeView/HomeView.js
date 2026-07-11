import style from "./HomeView.css" with { type: "css" };
import shared from "../../styles/global.css" with { type: "css" };
import Reaction from "../../../core/reaction.js";


class HomeView extends HTMLElement {

    constructor() {
        super();

        this.initialized = true;
        
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [shared, style];

        this.shadowRoot.innerHTML = `
            <main>
                <header>
                    <slot></slot>
                </header>
                <section>
                    <article class="card">
                        <label for="reaction-input">UNBALANCED EQUATION</label>
                        <input type="text" id="reaction-input" class="reaction" placeholder="e.g. H2 + O2 --> H2O">
                        <footer>
                            <button class="secondary" id="batch-button">Batch</button>
                            <button class="primary" id="balance-button">Balance Reaction</button>
                        </footer>
                    </article>
                    <dialog-box id="batch-dialog" label="Batch Balance">
                        <p>Upload newline separated list of reactions in plaintext format.</p>
                        <file-input accept=".txt" id="batch-input"></file-input>
                        <p class="error" id="file-error" hidden>File must be of plaintext (.txt) format</p>
                        <button class="primary" id="download-batch" disabled>Download CSV</button>
                    </dialog-box>
                    <article class="card accent">
                        <header>
                            <label for="reaction-output">BALANCED EQUATION</label>
                            <copy-button id="copy-reaction">Copy reaction</copy-button>
                        </header>
                        <output class="reaction" id="reaction-output" for="reaction-input">
                            <span>The balanced reaction appears here.</span>
                        </output>
                    </article>
                </section>
            </main>
        `;

        this._reactionInput = this.shadowRoot.getElementById("reaction-input");
        this._batchButton = this.shadowRoot.getElementById("batch-button");
        this._balanceButton = this.shadowRoot.getElementById("balance-button");
        this._batchDialog = this.shadowRoot.getElementById("batch-dialog");
        this._batchInput = this.shadowRoot.getElementById("batch-input");
        this._fileError = this.shadowRoot.getElementById("file-error");
        this._downloadButton = this.shadowRoot.getElementById("download-batch");
        this._copyButton = this.shadowRoot.getElementById("copy-reaction");
        this._reactionOutput = this.shadowRoot.getElementById("reaction-output");
    }

    connectedCallback() {
        this._reactionInput.addEventListener("input", this.autocomplete);
        this._reactionInput.addEventListener("keydown", this.onKeydown);
        this._batchButton.addEventListener("click", this.viewBatchDialog);
        this._balanceButton.addEventListener("click", this.renderBalanced);
        this._batchInput.addEventListener("change", this.validateFile);
        this._downloadButton.addEventListener("click", this.balanceBatch);
        this._copyButton.addEventListener("click", this.copyBalanced);
        document.addEventListener("reaction-selected", this.copyToBalancer);
    }

    autocomplete = (event) => {
        const cursorIndex = event.target.selectionStart;
        const braces = new Map([["(", ")"], ["{", "}"], ["[", "]"]]);

        if (braces.has(event.data)) {
            const closingBrace = braces.get(event.data);
            event.target.value = `${event.target.value.slice(0, cursorIndex)}${closingBrace}${event.target.value.slice(cursorIndex)}`;
            event.target.setSelectionRange(cursorIndex, cursorIndex);
        }

        else if (event.data === "=") {
            if ((event.target.value[cursorIndex-2] ?? " ") === " " && (event.target.value[cursorIndex] ?? " ") === " ") {
                event.target.value = `${event.target.value.slice(0, cursorIndex-1)}-->${event.target.value.slice(cursorIndex)}`;
                event.target.setSelectionRange(cursorIndex+2, cursorIndex+2);
            }
        }
    }

    onKeydown = (event) => {
        if (event.key === "Enter") {
            event.target.blur();
            this.renderBalanced();
        }

        if (event.key === "Backspace") {
            const cursorIndex = event.target.selectionStart;
            if (event.target.selectionEnd !== cursorIndex) return;

            const braces = new Map([["(", ")"], ["{", "}"], ["[", "]"]]);

            const openingBrace = event.target.value[cursorIndex-1];
            const closingBrace = event.target.value[cursorIndex];

            if (braces.has(openingBrace) && braces.get(openingBrace) === closingBrace) {
                event.preventDefault();
                event.target.value = `${event.target.value.slice(0, cursorIndex-1)}${event.target.value.slice(cursorIndex+1)}`;
                event.target.setSelectionRange(cursorIndex-1, cursorIndex-1);
            }
        }
    }

    viewBatchDialog = (event) => {
        this._batchDialog.show();
    }

    renderBalanced = (event) => {
        const equation = document.createElement("chemical-equation");
        equation.textContent = this._reactionInput.value;
        equation.balanced = true;
        this._reactionOutput.replaceChildren(equation);
    }

    copyBalanced = async (event) => {
        try {
            const reaction = this._reactionOutput.querySelector("chemical-equation").reaction;
            await navigator.clipboard.writeText(reaction);
            this._copyButton.showFeedback(true);
        }
        catch (error) {
            console.error(error);
            this._copyButton.showFeedback(false);
        }
    }

    copyToBalancer = (event) => {
        this._reactionInput.value = event.detail.reaction;
        this._reactionOutput.replaceChildren("The balanced reaction appears here.");
    }

    validateFile = (event) => {
        const file = event.detail;
        this._downloadButton.disabled = true;

        if (!file) this._fileError.hidden = true;

        else if (file.type !== "text/plain") {
            event.target.clear();
            this._fileError.hidden = false;
        }
        else {
            this._fileError.hidden = true;
            this._downloadButton.disabled = false;
        }
    }

    compoundString(compound) {
        const formula = [compound.formula];
        const charge = compound.charge;
        if (charge) formula.push(`^${Math.abs(charge)}${(charge > 0) ? "+" : "-"}`);
        if (compound.state) formula.push(` (${compound.state})`);
        return formula.join("");
    }

    reactionString(reaction, balanced=false) {
        if (!balanced) {
            const lhs = reaction.reactants.map(reactant => this.compoundString(reactant));
            const rhs = reaction.products.map(product => this.compoundString(product));
            return `${lhs.join(" + ")} --> ${rhs.join(" + ")}`;
        }
        
        const { reactants, products } = reaction.balanced();
        const lhs = [];
        const rhs = [];
        for (const [reactant, coeff] of reactants) {
            lhs.push(`${(coeff === 1) ? "" : coeff}${this.compoundString(reactant)}`);
        }
        for (const [product, coeff] of products) {
            rhs.push(`${(coeff === 1) ? "" : coeff}${this.compoundString(product)}`);
        }
        return `${lhs.join(" + ")} --> ${rhs.join(" + ")}`;
    }

    balanceBatch = async (event) => {
        const fileContent = await this._batchInput.file.text();

        const rows = ["Input reaction, Balanced reaction, Remarks"];

        for (const reactionInput of fileContent.trim().split(/\s*\n\s*/)) {
            const row = [];
            try {
                const reaction = new Reaction(reactionInput);
                row.push(this.reactionString(reaction), this.reactionString(reaction, true), "Balanced");
            }
            catch (error) {
                row.push(reactionInput, "-", error.message);
            }
            rows.push(row.map(entry => `"${entry.replace(/"/g, '""')}"`).join(","));
        }

        const balanced = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(balanced);
        downloadLink.download = "balanced.csv";
        downloadLink.hidden = true;

        this.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        this._batchInput.clear();
    }
}


customElements.define("home-view", HomeView);