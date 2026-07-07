import style from "./HomeView.css" with { type: "css" };
import shared from "../../styles/global.css" with { type: "css" };
import Reaction from "../../../core/reaction.js";


class HomeView extends HTMLElement {

    constructor() {
        super();
        this.initialized = true;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [shared, style];
    }

    connectedCallback() {
        const base = document.createElement("main");

        const header = document.createElement("header");
        const heading = document.createElement("slot");
        header.append(heading);

        const balanceSection = document.createElement("section");

        const inputCard = document.createElement("article");
        inputCard.classList.add("card");
        const inputLabel = document.createElement("label");
        inputLabel.setAttribute("for", "reaction-input");
        inputLabel.textContent = "UNBALANCED EQUATION";
        const input = document.createElement("input");
        input.type = "text";
        input.id = "reaction-input";
        input.classList.add("reaction");
        input.placeholder = "e.g. CH4 + O2 --> CO2 + H2O";
        const cardFooter = document.createElement("footer");
        const batchButton = document.createElement("button");
        batchButton.classList.add("secondary");
        batchButton.textContent = "Batch";
        const balanceButton = document.createElement("button");
        balanceButton.classList.add("primary");
        balanceButton.textContent = "Balance Reaction";
        cardFooter.append(batchButton, balanceButton);
        inputCard.append(inputLabel, input, cardFooter);

        const batchDialog = document.createElement("dialog-box");
        batchDialog.id = "batch-dialog";
        batchDialog.label = "Batch Balance";
        const text = document.createElement("p");
        text.textContent = "Upload newline separated list of reactions in plaintext format.";
        const fileInput = document.createElement("file-input");
        fileInput.accept = ".txt";
        fileInput.id = "batch-input";
        const errorText = document.createElement("p");
        errorText.classList.add("error");
        errorText.id = "file-error";
        errorText.hidden = true;
        const downloadButton = document.createElement("button");
        downloadButton.id = "download-balanced";
        downloadButton.disabled = true;
        downloadButton.classList.add("primary");
        downloadButton.textContent = "Download CSV";
        batchDialog.append(text, fileInput, errorText, downloadButton);

        const outputCard = document.createElement("article");
        outputCard.classList.add("card", "accent");
        const cardHeader = document.createElement("header");
        const outputLabel = document.createElement("label");
        outputLabel.setAttribute("for", "reaction-output");
        outputLabel.textContent = "BALANCED EQUATION";
        const copyButton = document.createElement("copy-button");
        copyButton.id = "copy-reaction";
        copyButton.textContent = "Copy Reaction";
        cardHeader.append(outputLabel, copyButton);
        const output = document.createElement("output");
        output.id = "reaction-output";
        output.setAttribute("for", "reaction-input");
        output.textContent = "The balanced reaction appears here.";
        output.classList.add("reaction");
        outputCard.append(cardHeader, output);

        balanceSection.append(inputCard, batchDialog, outputCard);

        base.append(header, balanceSection);

        this.shadowRoot.append(base);

        input.addEventListener("input", this.autocomplete);
        input.addEventListener("keydown", this.onKeydown);
        batchButton.addEventListener("click", this.viewBatchDialog);
        balanceButton.addEventListener("click", this.renderBalanced);
        fileInput.addEventListener("change", this.validateFile);
        downloadButton.addEventListener("click", this.balanceBatch);
        copyButton.addEventListener("click", this.copyBalanced);
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
        this.shadowRoot.getElementById("batch-dialog").show();
    }

    renderBalanced = (event) => {
        const equation = document.createElement("chemical-equation");
        equation.reaction = this.shadowRoot.getElementById("reaction-input").value;
        equation.balanced = true;
        this.shadowRoot.getElementById("reaction-output").replaceChildren(equation);
    }

    copyBalanced = async (event) => {
        try {
            const reaction = this.shadowRoot.getElementById("reaction-output").querySelector("chemical-equation").reaction;
            await navigator.clipboard.writeText(reaction);
            this.shadowRoot.getElementById("copy-reaction").showFeedback(true);
        }
        catch (error) {
            console.error(error);
            this.shadowRoot.getElementById("copy-reaction").showFeedback(false);
        }
    }

    copyToBalancer = (event) => {
        this.shadowRoot.getElementById("reaction-input").value = event.detail.reaction;
        this.shadowRoot.getElementById("reaction-output").textContent = "The balanced reaction appears here.";
    }

    validateFile = (event) => {
        const file = event.detail;
        const errorText = this.shadowRoot.getElementById("file-error");
        this.shadowRoot.getElementById("download-balanced").disabled = true;
        if (!file) errorText.hidden = true;
        else if (file.type !== "text/plain") {
            event.target.clear();
            errorText.hidden = false;
            errorText.textContent = "File must be of plaintext (.txt) format";
        }
        else {
            errorText.hidden = true;
            this.shadowRoot.getElementById("download-balanced").disabled = false;
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
        const batchInput = this.shadowRoot.getElementById("batch-input");
        const fileContent = await batchInput.file.text();
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
        batchInput.clear();
    }
}


customElements.define("home-view", HomeView);