import BaseElement from "../../../utils/BaseElement.js";
import style from "./ContentCard.css" with { type: "css" };


class ContentCard extends BaseElement {

    static properties = { accent: Boolean };

    static styles = [style];

    static template = `
        <article part="base">
            <slot></slot>
        </article>
    `;

    constructor() {
        super();
        this._base = this.shadowRoot.querySelector("article");
    }

    onUpdate(property, oldValue, newValue) {
        if (newValue) this._base.dataset.accent = "";
        else delete this._base.dataset.accent;
    }
}


customElements.define("content-card", ContentCard);