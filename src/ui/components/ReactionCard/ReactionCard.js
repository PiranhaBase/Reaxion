import style from "./ReactionCard.css" with { type: "css" };


const template = document.createElement("template");

template.innerHTML = `
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


class ReactionCard extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        this.shadowRoot.append(template.content.cloneNode(true));

        this._base = this.shadowRoot.querySelector("[part='base']");
        this._reactionType = this.shadowRoot.querySelector("[part='reaction-type']");
        this._categoryContainer = this.shadowRoot.querySelector(".categories");

        this._pressTimeout = null;
    }

    static get observedAttributes() {
        return ["type", "category", "compact", "auto-expand", "type-hidden"];
    }

    connectedCallback() {
        for (const property of ["type", "category", "compact", "autoExpand", "typeHidden"]) {
            if (this.hasOwnProperty(property)) {
                const propertyValue = this[property];
                delete this[property];
                this[property] = propertyValue;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "type") {
            this._reactionType.textContent = newValue || "";
        }

        else if (name === "category") {
            this._categoryContainer.replaceChildren();
            if (!newValue) return;
            for (const categoryName of newValue.trim().split(/\s*,\s*/)) {
                const category = document.createElement("span");
                category.part.add("category");
                category.textContent = categoryName;
                this._categoryContainer.append(category);
            }
        }

        else if (name === "compact") {
            if (newValue !== null) {
                this._base.dataset.compact = "";
            }
            else delete this._base.dataset.compact;
        }
        
        else if (name === "auto-expand") {
            if (newValue !== null) {
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

        else if (name === "type-hidden") {
            this._reactionType.hidden = this.hasAttribute("type-hidden");
        }
    }

    disconnectedCallback() {
        this._base.removeEventListener("touchstart", this.expandCard);
        this._base.removeEventListener("touchend", this.cancelExpansion);
        this._base.removeEventListener("touchmove", this.cancelExpansion);
        this._base.removeEventListener("touchcancel", this.cancelExpansion);
    }

    get type() {
        return this.getAttribute("type");
    }

    set type(typeName) {
        this.setAttribute("type", typeName);
    }

    get category() {
        return this.getAttribute("category").trim().split(/\s*,\s*/);
    }

    set category(value) {
        this.setAttribute("category", value);
    }

    get compact() {
        return this.hasAttribute("compact");
    }

    set compact(value) {
        if (value) this.setAttribute("compact", "");
        else this.removeAttribute("compact");
    }

    get autoExpand() {
        return this.hasAttribute("auto-exapnd");
    }

    set autoExpand(value) {
        if (value) this.setAttribute("auto-expand", "");
        else this.removeAttribute("auto-expand");
    }

    get typeHidden() {
        return this.hasAttribute("type-hidden");
    }

    set typeHidden(value) {
        if (value) this.setAttribute("type-hidden", "");
        else this.removeAttribute("type-hidden");
    }

    expandCard = (event) => {
        clearTimeout(this._pressTimeout);
        this._pressTimeout = setTimeout(() => {
            this.removeAttribute("compact");
            this.removeAttribute("auto-expand");
        }, 400);
    }

    cancelExpansion = (event) => {
        clearTimeout(this._pressTimeout);
    }
}


customElements.define("reaction-card", ReactionCard);