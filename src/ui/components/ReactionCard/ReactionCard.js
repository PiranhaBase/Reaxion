import style from "./ReactionCard.css" with { type: "css" };


class ReactionCard extends HTMLElement {

    constructor() {
        super();
        this.pressTimeout = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        const card = document.createElement("article");
        card.part.add("base");
        if (this.hasAttribute("compact")) card.dataset.compact = "";
        if (this.hasAttribute("auto-expand")) {
            card.addEventListener("touchstart", this.expandCard);
            card.addEventListener("touchend", this.cancelExpansion);
            card.addEventListener("touchmove", this.cancelExpansion);
            card.addEventListener("touchcancel", this.cancelExpansion);
        }
        if (this.hasAttribute("auto-expand")) card.dataset.autoExpand = "";
        const content = document.createElement("div");
        content.classList.add("content");
        const reactionSlot = document.createElement("slot");
        const reactionType = document.createElement("h6");
        reactionType.part.add("reaction-type");
        reactionType.textContent = this.getAttribute("type") || "";
        content.append(reactionSlot, reactionType);
        const footer = document.createElement("footer");
        const categoryWrapper = document.createElement("div");
        categoryWrapper.classList.add("categories");
        (this.getAttribute("category") || "").split(",").forEach(categoryName => {
            const category = document.createElement("span");
            category.part.add("category");
            category.textContent = categoryName.trim();
            categoryWrapper.appendChild(category);
        });
        const chevron = document.createElement("vector-icon");
        chevron.setAttribute("name", "chevron");
        chevron.part.add("chevron");
        footer.append(categoryWrapper, chevron);
        card.append(content, footer);
        this.shadowRoot.append(card);
    }

    disconnectedCallback() {
        this.removeTouchListeners();
    }

    removeTouchListeners() {
        const card = this.shadowRoot.querySelector("[part='base']");
        card.removeEventListener("touchstart", this.expandCard);
        card.removeEventListener("touchend", this.cancelExpansion);
        card.removeEventListener("touchmove", this.cancelExpansion);
        card.removeEventListener("touchcancel", this.cancelExpansion);
    }

    expandCard = (event) => {
        if (!("compact" in this.shadowRoot.querySelector("[part='base']").dataset)) return;
        clearTimeout(this.pressTimeout);
        this.pressTimeout = setTimeout(() => {
            delete this.shadowRoot.querySelector("[part='base']").dataset.compact;
            delete this.shadowRoot.querySelector("[part='base']").dataset.autoExpand;
            this.removeTouchListeners();
        }, 400);
    }

    cancelExpansion = (event) => {
        clearTimeout(this.pressTimeout);
    }
}


customElements.define("reaction-card", ReactionCard);