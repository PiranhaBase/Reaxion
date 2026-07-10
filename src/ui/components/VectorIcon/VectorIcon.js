import BaseElement from "../../../utils/BaseElement.js";
import style from "./VectorIcon.css" with { type: "css" };


class VectorIcon extends BaseElement {

    constructor() {
        super();

        this._base = this.shadowRoot.querySelector("[part='base']");
    }

    static template = '<div part="base"></div>';

    static styles = [style];

    static get properties() {
        return { "name": String };
    }

    connectedCallback() {
        super.connectedCallback();
        this.ariaHidden = true;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._base.dataset.icon = newValue.trim().toLowerCase();
    }
}


customElements.define("vector-icon", VectorIcon);