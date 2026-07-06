import style from "./ExampleView.css" with { type: "css" };
import shared from "../../styles/global.css" with { type: "css" };
import { fetchCategories, fetchElements, fetchExamples } from "../../../services/data.js";


class ExampleView extends HTMLElement {

    constructor() {
        super();
        this.initialized = false;
        this.filterUpdate = false;
        this.filterWorker = null;
        this.filterTimeoutId = null;
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style, shared];
    }

    connectedCallback() {
        const base = document.createElement("main");

        const header = document.createElement("header");
        const heading = document.createElement("slot");
        header.append(heading);

        const filterSection = document.createElement("section");
        filterSection.classList.add("filter-section");

        const viewOptions = document.createElement("search");
        viewOptions.classList.add("view-options");
        const searchBox = document.createElement("search-box");
        searchBox.setAttribute("placeholder", "Search reactions");
        const settingsIcon = document.createElement("vector-icon");
        settingsIcon.setAttribute("name", "settings");
        viewOptions.append(searchBox, settingsIcon);

        const filters = document.createElement("search");

        const filterIcon = document.createElement("vector-icon");
        filterIcon.setAttribute("name", "filter");

        const categoryDropdown = document.createElement("dropdown-trigger");
        categoryDropdown.setAttribute("name", "Categories");
        const categoryFilters = document.createElement("filter-box");
        categoryFilters.id = "category-filters";
        categoryFilters.setAttribute("search-placeholder", "Search categories");
        categoryDropdown.appendChild(categoryFilters);

        const elementDropdown = document.createElement("dropdown-trigger");
        elementDropdown.setAttribute("name", "Elements");
        const elementFilters = document.createElement("filter-box");
        elementFilters.id = "element-filters";
        elementFilters.setAttribute("search-placeholder", "Type name, symbol or number");
        elementDropdown.appendChild(elementFilters);

        const typeDropdown = document.createElement("dropdown-trigger");
        typeDropdown.setAttribute("name", "Type");
        const typeFilters = document.createElement("filter-box");
        typeFilters.id = "type-filters";
        typeDropdown.appendChild(typeFilters);

        filters.append(filterIcon, categoryDropdown, elementDropdown, typeDropdown);

        const filterPillWrapper = document.createElement("search");
        filterPillWrapper.id = "filter-pills";

        filterSection.append(viewOptions, filters, filterPillWrapper);

        const exampleSection = document.createElement("section");
        exampleSection.id = "example-cards";

        const loadSentinel = document.createElement("div");
        loadSentinel.id = "load-sentinel";
        loadSentinel.hidden = true;

        base.append(header, filterSection, exampleSection, loadSentinel);
        this.shadowRoot.appendChild(base);

        filterSection.addEventListener("input", this.manageFilters);
        exampleSection.addEventListener("click", this.dispatchReaction);

        const scrollObserver = new IntersectionObserver(([sentinel]) => {
            if (sentinel.isIntersecting) this.loadExamples();
        }, { scrollMargin: "100px" });

        scrollObserver.observe(loadSentinel);
    }

    async initialize() {
        this.initialized = true;
        
        const [categories, elements] = await Promise.all([fetchCategories(), fetchElements()]);
        
        const categoryFilters = this.shadowRoot.getElementById("category-filters");
        for (const category of categories) {
            const filterItem = document.createElement("filter-item");
            filterItem.textContent = category.name;
            filterItem.setAttribute("value", category.name);
            filterItem.setAttribute("pattern", category.name);
            categoryFilters.appendChild(filterItem);
        }
        
        const elementFilters = this.shadowRoot.getElementById("element-filters");
        for (const element of elements) {
            const filterItem = document.createElement("filter-item");
            filterItem.textContent = element.name;
            filterItem.setAttribute("value", element.symbol);
            filterItem.setAttribute("pattern", `${element.number}|${element.symbol}|${element.name}`);
            elementFilters.appendChild(filterItem);
        }

        const typeFilters = this.shadowRoot.getElementById("type-filters");
        const molecularFilter = document.createElement("filter-item");
        molecularFilter.textContent = "Molecular";
        molecularFilter.setAttribute("value", "Molecular");
        const ionicFilter = document.createElement("filter-item");
        ionicFilter.textContent = "Ionic";
        ionicFilter.setAttribute("value", "Ionic");
        typeFilters.append(molecularFilter, ionicFilter);

        this.filterWorker = new Worker(new URL("../../../workers/examples.js", import.meta.url));
        this.filterWorker.postMessage(await fetchExamples());
        this.filterWorker.onmessage = (event) => this.renderExamples(event.data);
        this.updateFilters();
    }

    manageFilters = (event) => {
        if (event.target.matches("filter-item")) {
            if (event.target.checked) {
                const pill = document.createElement("filter-pill");
                pill.target = event.target;
                pill.textContent = event.target.value;
                this.shadowRoot.getElementById("filter-pills").appendChild(pill);
            }
            else {
                for (const pill of this.shadowRoot.getElementById("filter-pills").children) {
                    if (pill.target === event.target) {
                        pill.remove();
                        break;
                    }
                }
            }
        }
        else if (event.target.matches("filter-pill")) {
            event.target.target.checked = false;
            event.target.remove();
        }
        this.updateFilters();
    }

    updateFilters() {
        clearTimeout(this.filterTimeoutId);
        this.filterTimeoutId = setTimeout(() => {
            this.filterWorker.postMessage({
                update: true,
                filters: {
                    searchInput: this.shadowRoot.querySelector("search-box").value,
                    categories: this.shadowRoot.getElementById("category-filters").selected,
                    elements: this.shadowRoot.getElementById("element-filters").selected,
                    types: this.shadowRoot.getElementById("type-filters").selected
                }
            });
            this.shadowRoot.getElementById("load-sentinel").hidden = true;
            this.filterUpdate = true;
            this.loadExamples();
        }, 200);
    }

    loadExamples() {
        this.filterWorker.postMessage({ update: false, limit: 10 });
    }

    renderExamples({ examples, finished }) {
        const reactionCards = [];
        for (const example of examples) {
            const reactionCard = document.createElement("reaction-card");
            const reactionText = document.createElement("chemical-equation");
            reactionText.textContent = example.reaction;
            reactionCard.appendChild(reactionText);
            reactionCard.setAttribute("type", example.type.toUpperCase());
            reactionCard.setAttribute("category", example.categories.join(","));
            reactionCards.push(reactionCard);
        }

        if (this.filterUpdate) {
            this.filterUpdate = false;
            this.shadowRoot.getElementById("example-cards").replaceChildren(...reactionCards);
        }
        else this.shadowRoot.getElementById("example-cards").append(...reactionCards);
        
        if (finished) this.shadowRoot.getElementById("load-sentinel").hidden = true;
        else this.shadowRoot.getElementById("load-sentinel").hidden = false;
    }

    dispatchReaction = (event) => {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("reaction-selected", {
            bubbles: true,
            composed: true,
            detail: { reaction: event.target.querySelector("chemical-equation").reaction }
        }));
    }
}


customElements.define("example-view", ExampleView);