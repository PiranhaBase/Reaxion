import BaseElement from "../../../utils/BaseElement.js";
import style from "./ReactionCard.css" with { type: "css" };


class ReactionCard extends BaseElement {

    constructor() {
        super();

        this._base = this.shadowRoot.querySelector("[part='base']");
        this._reactionType = this.shadowRoot.querySelector("[part='reaction-type']");
        this._categoryContainer = this.shadowRoot.querySelector(".categories");

        this._expansionTimeout = null;
    }

    static template = `
        <article part="base">
            <div class="content">
                <slot></slot>
                <h6 part="reaction-type"></h6>
            </div>
            <footer>
                <div class="categories"></div>
                <vector-icon name="chevron" part="chevron"></vector-icon>
            </footer>
        </article>
    `;

    static styles = [style];

    static get properties() {
        return {
            type: String,
            category: String,
            compact: Boolean,
            autoExpand: Boolean,
            typeHidden: Boolean
        }
    }

    onUpdate(property, oldValue, newValue) {
        if (property === "type") this._reactionType.textContent = newValue || "";

        else if (property === "category") {
            this._categoryContainer.replaceChildren();

            if (!newValue) return;

            for (const categoryName of newValue.trim().split(/\s*,\s*/)) {
                const category = document.createElement("span");
                category.part.add("category");
                category.textContent = categoryName;
                this._categoryContainer.append(category);
            }
        }

        else if (property === "compact") {
            if (newValue) this._base.dataset.compact = "";
            else delete this._base.dataset.compact;
        }
        
        else if (property === "autoExpand") {
            if (newValue) {
                this._base.addEventListener("touchstart", this.expandCard);
                this._base.addEventListener("touchend", this.cancelExpansion);
                this._base.addEventListener("touchmove", this.cancelExpansion);
                this._base.addEventListener("touchcancel", this.cancelExpansion);
                this._base.dataset.autoExpand = "";
            }
            
            else {
                this._base.removeEventListener("touchstart", this.expandCard);
                this._base.removeEventListener("touchend", this.cancelExpansion);
                this._base.removeEventListener("touchmove", this.cancelExpansion);
                this._base.removeEventListener("touchcancel", this.cancelExpansion);
                delete this._base.dataset.autoExpand;
            }
        }

        else if (property === "typeHidden") {
            this._reactionType.hidden = newValue;
        }
    }

    onUnmount() {
        this._base.removeEventListener("touchstart", this.expandCard);
        this._base.removeEventListener("touchend", this.cancelExpansion);
        this._base.removeEventListener("touchmove", this.cancelExpansion);
        this._base.removeEventListener("touchcancel", this.cancelExpansion);
    }

    expandCard = (event) => {
        clearTimeout(this._expansionTimeout);
        this._expansionTimeout = setTimeout(() => {
            this.compact = false;
            this.autoExpand = false;
        }, 400);
    }

    cancelExpansion = (event) => {
        clearTimeout(this._expansionTimeout);
    }
}


customElements.define("reaction-card", ReactionCard);