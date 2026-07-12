import BaseElement from "../../../utils/BaseElement.js";
import style from "./VectorIcon.css" with { type: "css" };


class VectorIcon extends BaseElement {

    static properties = { name: String };

    static styles = [style];

    static template = '<div part="base"></div>';

    constructor() {
        super();
        this._base = this.shadowRoot.querySelector("[part='base']");
    }

    onUpdate(property, oldValue, newValue) {
        this._base.dataset.icon = newValue?.trim().toLowerCase();
    }

    onMount() {
        this.ariaHidden = true;
    }
}


customElements.define("vector-icon", VectorIcon);