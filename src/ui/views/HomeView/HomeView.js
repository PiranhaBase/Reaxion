import style from "./HomeView.css" with { type: "css" };
import shared from "../../styles/global.css" with { type: "css" };


class HomeView extends HTMLElement {

    constructor() {
        super();
        this.initialized = true;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style, shared];
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
        const balanceButton = document.createElement("button");
        balanceButton.classList.add("primary");
        balanceButton.textContent = "Balance Reaction";
        inputCard.append(inputLabel, input, balanceButton);

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

        balanceSection.append(inputCard, outputCard);

        base.append(header, balanceSection);

        this.shadowRoot.appendChild(base);

        input.addEventListener("input", this.autocomplete);
        input.addEventListener("keydown", this.onKeydown);
        balanceButton.addEventListener("click", this.renderBalanced);
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

    renderBalanced = (event) => {
        const reaction = document.createElement("chemical-equation");
        reaction.setAttribute("balanced", "");
        reaction.textContent = this.shadowRoot.getElementById("reaction-input").value;
        this.shadowRoot.getElementById("reaction-output").replaceChildren(reaction);
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
}


customElements.define("home-view", HomeView);