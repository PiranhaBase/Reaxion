import BaseElement from "../../../utils/BaseElement.js";
import style from "./LoadingSpinner.css" with { type: "css" };


class LoadingSpinner extends BaseElement {

    static styles = [style];

    static template = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g>
                <circle part="track"></circle>
                <circle part="stroke"></circle>
            </g>
        </svg>
    `;
    
    constructor() {
        super();
        this._spinner = this.shadowRoot.querySelector("svg");
    }

    onMount() {
        this.role = "status";
    }
}

customElements.define("loading-spinner", LoadingSpinner);