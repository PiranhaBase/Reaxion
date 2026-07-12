import BaseElement from "../../../utils/BaseElement.js";
import style from "./FilterBox.css" with { type: "css" };


class FilterBox extends BaseElement {

    static properties = { searchPlaceholder: String };

    static styles = [style];

    static template = `
        <div part="base">
            <search></search>
            <div part="options">
                <slot></slot>
            </div>
        </div>
    `;

    constructor() {
        super();

        this._searchContainer = this.shadowRoot.querySelector("search");
        this._searchBox = null;
    }

    get selected() {
        const checkedOptions = [];
        for (const option of this.querySelectorAll("filter-item")) {
            if (option.checked) checkedOptions.push(option.value);
        }
        return checkedOptions;
    }

    onUpdate(property, oldValue, newValue) {
        if (newValue !== null) {
            if (this._searchBox) searchBox.placeholder = newValue;
            else {
                const searchBox = document.createElement("search-box");
                searchBox.placeholder = newValue;
                searchBox.setAttribute("exportparts", "base:search-box, input:search-input");
                searchBox.addEventListener("input", this.render);
                this._searchContainer.replaceChildren(searchBox);
            }
        }

        else {
            if (this._searchBox) {
                this._searchBox.removeEventListener("input", this.render);
                this._searchBox.remove();
            }
        }
    }

    onUnmount() {
        this._searchBox?.removeEventListener("input", this.render);
    }

    render = (event) => {
        const pattern = new RegExp(event.target.value, "i");

        for (const filterItem of this.querySelectorAll("filter-item")) {
            if (pattern.test(filterItem.pattern)) filterItem.hidden = false;
            else filterItem.hidden = true;
        }

        event.stopPropagation();
    }
}


customElements.define("filter-box", FilterBox);