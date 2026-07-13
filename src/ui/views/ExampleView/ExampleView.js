import ViewElement from "../../../utils/ViewElement.js";
import style from "./ExampleView.css" with { type: "css" };
import { fetchCategories, fetchElements, fetchExamples } from "../../../services/data.js";


class ExampleView extends ViewElement {

    static styles = [style];

    static template = `
        <main>
            <header>
                <slot></slot>
            </header>
            <section class="filter-section">
                <search class="view-options">
                    <search-box placeholder="Search reactions" id="reaction-search"></search-box>
                        <dropdown-trigger>
                        <vector-icon name="settings" slot="icon"></vector-icon>
                        <content-card class="settings">
                            <h4>Options</h4>
                            <div class="content">
                                <toggle-switch checked id="state-toggle">State labels</toggle-switch>
                                <toggle-switch checked id="type-toggle">Reaction type</toggle-switch>
                                <toggle-switch id="compact-toggle">Compact view</toggle-switch>
                                <toggle-switch id="expand-toggle">Expand on hover / long-press</toggle-switch>
                            </div>
                        </content-card>
                    </dropdown-trigger>
                </search>
                <search>
                    <vector-icon name="filter"></vector-icon>
                    <dropdown-trigger label="Categories">
                        <filter-box id="category-filters" search-placeholder="Search categories"></filter-box>
                    </dropdown-trigger>
                    <dropdown-trigger label="Elements">
                        <filter-box id="element-filters" search-placeholder="Type name, symbol or number"></filter-box>
                    </dropdown-trigger>
                    <dropdown-trigger label="Type">
                        <filter-box id="type-filters">
                            <filter-item value="Molecular">Molecular</filter-item>
                            <filter-item value="Ionic">Ionic</filter-item>
                        </filter-box>
                    </dropdown-trigger>
                </search>
                <search id="filter-pills"></search>
            </section>
            <section id="example-cards"></section>
            <div id="load-sentinel" hidden></div>
        </main>
    `;

    constructor() {
        super();

        this._filterUpdate = false;
        this._filterWorker = null;
        this._filterTimeoutId = null;

        this._displayOptions = this.shadowRoot.querySelector(".settings > .content");
        this._searchBox = this.shadowRoot.getElementById("reaction-search");
        this._stateToggle = this.shadowRoot.getElementById("state-toggle");
        this._typeToggle = this.shadowRoot.getElementById("type-toggle");
        this._compactToggle = this.shadowRoot.getElementById("compact-toggle");
        this._expandToggle = this.shadowRoot.getElementById("expand-toggle");
        this._filterSection = this.shadowRoot.querySelector(".filter-section");
        this._categoryFilters = this.shadowRoot.getElementById("category-filters");
        this._elementFilters = this.shadowRoot.getElementById("element-filters");
        this._typeFilters = this.shadowRoot.getElementById("type-filters");
        this._filterPills = this.shadowRoot.getElementById("filter-pills");
        this._exampleSection = this.shadowRoot.getElementById("example-cards");
        this._loadSentinel = this.shadowRoot.getElementById("load-sentinel");
    }

    async setup() {
        const [categories, elements] = await Promise.all([fetchCategories(), fetchElements()]);
        
        for (const category of categories) {
            const filterItem = document.createElement("filter-item");
            filterItem.textContent = category.name;
            filterItem.value = category.name;
            filterItem.pattern = category.name;
            this._categoryFilters.append(filterItem);
        }
        
        for (const element of elements) {
            const filterItem = document.createElement("filter-item");
            filterItem.textContent = element.name;
            filterItem.value = element.symbol;
            filterItem.pattern = `${element.number}|${element.symbol}|${element.name}`;
            this._elementFilters.append(filterItem);
        }

        this._filterWorker = new Worker(new URL("../../../workers/examples.js", import.meta.url));
        this._filterWorker.postMessage(await fetchExamples());
        this._filterWorker.onmessage = (event) => this.renderExamples(event.data);
        this.updateFilters();

        this._displayOptions.addEventListener("input", this.applyDisplayOptions);
        this._filterSection.addEventListener("input", this.manageFilters);
        this._exampleSection.addEventListener("click", this.dispatchReaction);

        const scrollObserver = new IntersectionObserver(([sentinel]) => {
            if (sentinel.isIntersecting) this.loadExamples();
        }, { scrollMargin: "200px" });

        scrollObserver.observe(this._loadSentinel);
    }

    applyDisplayOptions = (event) => {
        event.stopPropagation();

        const stateHidden = !this._stateToggle.checked;
        const typeHidden = !this._typeToggle.checked;
        const compact = this._compactToggle.checked;
        const autoExpand = this._expandToggle.checked;

        for (const card of this._exampleSection.children) {
            card.typeHidden = typeHidden;
            card.compact = compact;
            card.autoExpand = autoExpand;
            card.querySelector("chemical-equation").stateHidden = stateHidden;
        }
    }

    manageFilters = (event) => {
        if (event.target.matches("filter-item")) {
            if (event.target.checked) {
                const pill = document.createElement("filter-pill");
                pill.target = event.target;
                pill.textContent = event.target.value;
                this._filterPills.append(pill);
            }

            else {
                for (const pill of this._filterPills.children) {
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
        clearTimeout(this._filterTimeoutId);
        this._filterTimeoutId = setTimeout(() => {
            this._filterWorker.postMessage({
                update: true,
                filters: {
                    searchInput: this._searchBox.value,
                    categories: this._categoryFilters.selected,
                    elements: this._elementFilters.selected,
                    types: this._typeFilters.selected
                }
            });
            this._loadSentinel.hidden = true;
            this._filterUpdate = true;
            this.loadExamples();
        }, 200);
    }

    loadExamples() {
        this._filterWorker.postMessage({ update: false, limit: 10 });
    }

    renderExamples({ examples, finished }) {
        const reactionCards = [];

        const stateHidden = !this._stateToggle.checked;
        const typeHidden = !this._typeToggle.checked;
        const compact = this._compactToggle.checked;
        const autoExpand = this._expandToggle.checked;

        for (const example of examples) {
            const reactionCard = document.createElement("reaction-card");
            reactionCard.type = example.type.toUpperCase();
            reactionCard.category = example.categories.join(",");
            reactionCard.typeHidden = typeHidden;
            reactionCard.compact = compact;
            reactionCard.autoExpand = autoExpand;

            const equation = document.createElement("chemical-equation");
            equation.textContent = example.reaction;
            equation.stateHidden = stateHidden;

            reactionCard.append(equation);
            reactionCards.push(reactionCard);
        }

        if (this._filterUpdate) {
            this._filterUpdate = false;
            this._exampleSection.replaceChildren(...reactionCards);
        }
        else this._exampleSection.append(...reactionCards);
        
        if (finished) this._loadSentinel.hidden = true;
        else this._loadSentinel.hidden = false;
    }

    dispatchReaction = (event) => {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("reaction-selected", {
            bubbles: true,
            composed: true,
            detail: {
                reaction: event.target.querySelector("chemical-equation").reaction,
                targetView: "home-view"
            }
        }));
    }
}


customElements.define("example-view", ExampleView);