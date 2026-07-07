import Reaction from "../../../core/reaction.js";
import style from "./ChemicalEquation.css" with { type: "css" };


class ChemicalEquation extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const reaction = document.createElement("p");
        reaction.classList.add("reaction-wrapper");
        this.shadowRoot.append(reaction);
    }

    static get observedAttributes() {
        return ["reaction", "balanced", "state-hidden"];
    }

    connectedCallback() {
        for (const property of ["reaction", "balanced", "stateHidden"]) {
            if (this.hasOwnProperty(property)) {
                const propertyValue = this[property];
                delete this[property];
                this[property] = propertyValue;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const container = this.shadowRoot.querySelector(".reaction-wrapper");
        try {
            let reactionText = this.getAttribute("reaction") || "";
            if (this.hasAttribute("state-hidden")) {
                reactionText = reactionText.replace(/\s*\([a-z]+\)/g, "");
            }
            const reaction = new Reaction(reactionText);
            container.innerHTML = this.reactionHTML(reaction, this.hasAttribute("balanced"));
        }
        catch (error) {
            console.error(error);
            container.innerHTML = this.errorHTML(error.message);
        }
    }

    get reaction() {
        return this.shadowRoot.textContent;
    }

    set reaction(value) {
        this.setAttribute("reaction", value);
    }

    get balanced() {
        return this.hasAttribute("balanced");
    }

    set balanced(value) {
        if (value) this.setAttribute("balanced", "");
        else this.removeAttribute("balanced");
    }

    get stateHidden() {
        return this.hasAttribute("state-hidden");
    }

    set stateHidden(value) {
        if (value) this.setAttribute("state-hidden", "");
        else this.removeAttribute("state-hidden");
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