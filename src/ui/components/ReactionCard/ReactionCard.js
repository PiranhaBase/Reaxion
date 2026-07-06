import style from "./ReactionCard.css" with { type: "css" };


class ReactionCard extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    connectedCallback() {
        const card = document.createElement("article");
        card.part.add("base");
        if (this.hasAttribute("compact")) card.dataset.compact = "";
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
}


customElements.define("reaction-card", ReactionCard);