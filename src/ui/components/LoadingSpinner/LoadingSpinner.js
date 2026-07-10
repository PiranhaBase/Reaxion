import BaseElement from "../../../utils/BaseElement.js";
import style from "./LoadingSpinner.css" with { type: "css" };


class LoadingSpinner extends BaseElement {
    
    constructor() {
        super();

        this._spinner = this.shadowRoot.querySelector("svg");
    }

    static template = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g>
                <circle part="track"></circle>
                <circle part="stroke"></circle>
            </g>
        </svg>
    `;

    static styles = [style];

    connectedCallback() {
        this.setAttribute("role", "status");
    }
}

customElements.define("loading-spinner", LoadingSpinner);