import BaseElement from "../../../utils/BaseElement.js";
import style from "./DialogBox.css" with { type: "css" };


class DialogBox extends BaseElement {

    constructor() {
        super();

        this._backdrop = this.shadowRoot.querySelector("[part='backdrop']");
        this._title = this.shadowRoot.querySelector("h3");
        this._closeButton = this.shadowRoot.querySelector("button");
        this._dialog = this.shadowRoot.querySelector("dialog");

        this._animationTimeout = null;
    }

    static template = `
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

    static styles = [style];

    static get properties() {
        return { label: String };
    }

    onMount() {
        this._backdrop.addEventListener("click", this.shakeDialog);
        this._closeButton.addEventListener("click", this.closeModal);
    }

    onUpdate(property, oldValue, newValue) {
        this._title.textContent = newValue || "";
    }

    onUnmount() {
        this._closeButton.removeEventListener("click", this.closeModal);
        this._backdrop.removeEventListener("click", this.shakeDialog);
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