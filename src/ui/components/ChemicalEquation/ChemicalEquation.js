import Reaction from "../../../core/chem.js";
import style from "./ChemicalEquation.css" with { type: "css" };


class ChemicalEquation extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    get reaction() {
        return this.shadowRoot.textContent;
    }

    connectedCallback() {
        const reaction = document.createElement("p");
        try {
            reaction.innerHTML = this.reactionHTML(new Reaction(this.textContent), this.hasAttribute("balanced"));
        }
        catch (error) {
            console.error(error);
            reaction.innerHTML = this.errorHTML(error.message);
        }
        this.shadowRoot.appendChild(reaction);
        this.replaceChildren();
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
        
        function coeffHTML(coeff) {
            const coeffValue = Math.abs(coeff);
            return (coeffValue === 1) ? "" : `<span part="coefficient">${coeffValue}</span>`;
        }
        
        const lhs = [];
        const rhs = [];
        const coeffs = reaction.balancedCoeffs().values();
        for (const reactant of reaction.reactants) {
            const coeff = coeffs.next().value;
            if (coeff > 0) lhs.push(`${coeffHTML(coeff)}${this.compoundHTML(reactant)}`);
            else rhs.push(`${coeffHTML(coeff)}${this.compoundHTML(reactant)}`);
        }
        for (const product of reaction.products) {
            const coeff = coeffs.next().value;
            if (coeff > 0) rhs.push(`${coeffHTML(coeff)}${this.compoundHTML(product)}`);
            else lhs.push(`${coeffHTML(coeff)}${this.compoundHTML(product)}`);
        }
        return `${lhs.join(" + ")} <span class="reaction-arrow">--&gt;</span> ${rhs.join(" + ")}`;
    }
    
    errorHTML(error) {
        return `<span part='error'>${error.replace(/'(.+?)'/g, "<span part='highlight'>$1</span>")}</span>`;
    }
}


customElements.define("chemical-equation", ChemicalEquation);