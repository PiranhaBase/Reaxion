import Reaction from "../../../core/reaction.js";
import BaseElement from "../../../utils/BaseElement.js";
import style from "./ChemicalEquation.css" with { type: "css" };


class ChemicalEquation extends BaseElement {

    constructor() {
        super();

        this._reaction = null;
        this._reactionObserver = new MutationObserver(this.updateReaction);
    }

    static styles = [style];

    static get properties() {
        return {
            "balanced": Boolean,
            "stateHidden": Boolean
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this.updateReaction();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this._reaction !== null) this.render();
    }
    
    disconnectedCallback() {
        this._reactionObserver.disconnect();
    }

    get reaction() {
        return this.shadowRoot.textContent;
    }

    set reaction(reactionText) {
        this._reaction = reactionText;
        this.render();
    }

    updateReaction = () => {
        this.reaction = this.textContent;

        this._reactionObserver.disconnect();
        this.replaceChildren();
        this._reactionObserver.observe(this, { childList: true, subtree: true });
    }

    render() {
        try {
            let reactionText = this._reaction;
            if (this.hasAttribute("state-hidden")) {
                reactionText = reactionText.replace(/\s*\([a-z]+\)/g, "");
            }
            const reaction = new Reaction(reactionText);
            this.shadowRoot.innerHTML = this.reactionHTML(reaction, this.hasAttribute("balanced"));
        }

        catch (error) {
            console.error(error);
            this.shadowRoot.innerHTML = this.errorHTML(error.message);
        }
    }

    compoundHTML(compound) {
        const formula = [];
        const state = compound.state ? `<span part="state"> (${compound.state})</span>` : "";
        formula.push(compound.formula.replace(/([^\.\d])(\d+)/g, '$1<sub part="index">$2</sub>'));
        if (!compound.charge) return `${formula[0]}${state}`;

        const absCharge = Math.abs(compound.charge);
        formula.push('<span hidden>^</span>');
        if (absCharge === 1) {
            formula.push(`<span hidden>1</span><sup part="index">${(compound.charge > 0) ? "+" : "-"}</sup>`);
        }
        else formula.push(`<sup part="index">${absCharge}${(compound.charge > 0) ? "+" : "-"}</sup>`);
        return `${formula.join("")}${state}`;
    }
    
    reactionHTML(reaction, balanced=true) {
        if (!balanced) {
            const lhs = reaction.reactants.map(reactant => this.compoundHTML(reactant)).join(" + ");
            const rhs = reaction.products.map(product => this.compoundHTML(product)).join(" + ");
            return `${lhs} <span class="reaction-arrow">--&gt;</span> ${rhs}`;
        }

        const coeffHTML = (coeff) => (coeff === 1) ? "" : `<span part="coefficient">${coeff}</span>`;
        
        const lhs = [];
        const rhs = [];
        const { reactants, products } = reaction.balanced();
        for (const [reactant, coeff] of reactants) {
            lhs.push(`${coeffHTML(coeff)}${this.compoundHTML(reactant)}`);
        }
        for (const [product, coeff] of products) {
            rhs.push(`${coeffHTML(coeff)}${this.compoundHTML(product)}`);
        }
        return `${lhs.join(" + ")} <span class="reaction-arrow">--&gt;</span> ${rhs.join(" + ")}`;
    }
    
    errorHTML(error) {
        return `<span part='error'>${error.replace(/'(.+?)'/g, "<span part='highlight'>$1</span>")}</span>`;
    }
}


customElements.define("chemical-equation", ChemicalEquation);