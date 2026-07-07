import style from "./ReactionCard.css" with { type: "css" };


class ReactionCard extends HTMLElement {

    constructor() {
        super();
        this.pressTimeout = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const card = document.createElement("article");
        card.part.add("base");

        const content = document.createElement("div");
        content.classList.add("content");

        const reactionSlot = document.createElement("slot");
        const reactionType = document.createElement("h6");
        reactionType.part.add("reaction-type");

        content.append(reactionSlot, reactionType);

        const footer = document.createElement("footer");

        const categoryWrapper = document.createElement("div");
        categoryWrapper.classList.add("categories");
        const chevron = document.createElement("vector-icon");
        chevron.name = "chevron";
        chevron.part.add("chevron");

        footer.append(categoryWrapper, chevron);

        card.append(content, footer);
        this.shadowRoot.append(card);
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
            this.shadowRoot.querySelector("[part='reaction-type']").textContent = newValue || "";
        }

        else if (name === "category") {
            const wrapper = this.shadowRoot.querySelector(".categories");
            wrapper.replaceChildren();
            if (!newValue) return;
            for (const categoryName of newValue.trim().split(/\s*,\s*/)) {
                const category = document.createElement("span");
                category.part.add("category");
                category.textContent = categoryName;
                wrapper.append(category);
            }
        }

        else if (name === "compact") {
            if (newValue !== null) {
                this.shadowRoot.querySelector("[part='base']").dataset.compact = "";
            }
            else delete this.shadowRoot.querySelector("[part='base']").dataset.compact;
        }
        
        else if (name === "auto-expand") {
            const card = this.shadowRoot.querySelector("[part='base']");
            if (newValue !== null) {
                card.addEventListener("touchstart", this.expandCard);
                card.addEventListener("touchend", this.cancelExpansion);
                card.addEventListener("touchmove", this.cancelExpansion);
                card.addEventListener("touchcancel", this.cancelExpansion);
                card.dataset.autoExpand = "";
            }
            else {
                card.removeEventListener("touchstart", this.expandCard);
                card.removeEventListener("touchend", this.cancelExpansion);
                card.removeEventListener("touchmove", this.cancelExpansion);
                card.removeEventListener("touchcancel", this.cancelExpansion);
                delete card.dataset.autoExpand;
            }
        }

        else if (name === "type-hidden") {
            const reactionType = this.shadowRoot.querySelector("[part='reaction-type']");
            reactionType.hidden = this.hasAttribute("type-hidden");
        }
    }

    disconnectedCallback() {
        const card = this.shadowRoot.querySelector("[part='base']");
        card.removeEventListener("touchstart", this.expandCard);
        card.removeEventListener("touchend", this.cancelExpansion);
        card.removeEventListener("touchmove", this.cancelExpansion);
        card.removeEventListener("touchcancel", this.cancelExpansion);
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
        clearTimeout(this.pressTimeout);
        this.pressTimeout = setTimeout(() => {
            this.removeAttribute("compact");
            this.removeAttribute("auto-expand");
        }, 400);
    }

    cancelExpansion = (event) => {
        clearTimeout(this.pressTimeout);
    }
}


customElements.define("reaction-card", ReactionCard);