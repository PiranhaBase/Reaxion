import style from "./DialogBox.css" with { type: "css" };


class DialogBox extends HTMLElement {

    constructor() {
        super();
        this.animationTimeout = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        const backdrop = document.createElement("div");
        backdrop.part.add("backdrop");
        backdrop.addEventListener("click", this.shakeDialog);

        const dialog = document.createElement("dialog");
        dialog.part.add("modal");

        const header = document.createElement("header");
        header.part.add("header");

        const title = document.createElement("h3");
        title.textContent = this.getAttribute("title");
        this.removeAttribute("title");

        const closeButton = document.createElement("button");
        const closeIcon = document.createElement("vector-icon");
        closeIcon.setAttribute("name", "close");
        closeButton.appendChild(closeIcon);
        closeButton.addEventListener("click", this.closeModal);

        header.append(title, closeButton);

        const content = document.createElement("article");
        content.part.add("content");
        const contentSlot = document.createElement("slot");
        content.appendChild(contentSlot);

        dialog.append(header, content);
        backdrop.appendChild(dialog);
        this.shadowRoot.appendChild(backdrop);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("button").removeEventListener("click", this.closeModal);
        this.shadowRoot.querySelector("[part='backdrop']").removeEventListener("click", this.shakeDialog);
    }

    closeModal = (event) => this.close();

    shakeDialog = (event) => {
        if (!event.target.matches("[part='backdrop']")) return;
        const dialog = this.shadowRoot.querySelector("dialog");
        dialog.classList.add("shake");
        clearTimeout(this.animationTimeout)
        this.animationTimeout = setTimeout(() => {
            dialog.classList.remove("shake");
        }, 400);
    }

    show() {
        this.shadowRoot.querySelector("dialog").show();
    }

    close() {
        this.shadowRoot.querySelector("dialog").close();
    }
}


customElements.define("dialog-box", DialogBox);