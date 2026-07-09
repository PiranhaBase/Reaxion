import style from "./DialogBox.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
    <div part="backdrop">
        <dialog part="modal">
            <header part="header">
                <h3></h3>
                <button>
                    <vector-icon name="close"></vector-icon>
                </button>
            </header>
            <article part="content">
                <slot></slot>
            </article>
        </dialog>
    </div>
`;


class DialogBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._animationTimeout = null;

        this._backdrop = this.shadowRoot.querySelector("[part='backdrop']");
        this._title = this.shadowRoot.querySelector("h3");
        this._closeButton = this.shadowRoot.querySelector("button");
        this._dialog = this.shadowRoot.querySelector("dialog");

        this._backdrop.addEventListener("click", this.shakeDialog);
        this._closeButton.addEventListener("click", this.closeModal);
    }

    static get observedAttributes() {
        return ["label"];
    }

    connectedCallback() {
        if (this.hasOwnProperty("label")) {
            const label = this.label;
            delete this.label;
            this.label = label;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._title.textContent = newValue || "";
    }

    disconnectedCallback() {
        this._closeButton.removeEventListener("click", this.closeModal);
        this._backdrop.removeEventListener("click", this.shakeDialog);
    }

    get label() {
        return this.getAttribute("label");
    }

    set label(value) {
        this.setAttribute("label", value);
    }

    show() {
        this._dialog.show();
    }

    close() {
        this._dialog.close();
    }

    closeModal = (event) => this.close();

    shakeDialog = (event) => {
        if (event.target !== this._backdrop) return;

        this._dialog.classList.add("shake");

        clearTimeout(this._animationTimeout);
        this._animationTimeout = setTimeout(() => {
            this._dialog.classList.remove("shake");
        }, 400);
    }
}


customElements.define("dialog-box", DialogBox);