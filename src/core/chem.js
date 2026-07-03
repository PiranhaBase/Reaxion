import { Fraction, Matrix } from "./math.js";


const ELECTRON = "e";


class Compound {
    
    constructor(formula) {
        [this.formula, this.charge, this.state] = Compound.parse(formula);
        this.elements = Compound.getElements(this.formula);
    }

    static parse(formula) {
        formula = formula.replace(/^\s*\d+|\s+/g, "");
        const state = formula.match(/\((?<state>[a-z]+)\)$/)?.groups.state;
        if (state) formula = formula.replace(/\([a-z]+\)$/, "");

        if (formula.includes("^")) {
            const [compound, charge] = formula.split("^");
            if (!/^\d+[+-]$/.test(charge)) {
                throw new Error(`Charge '^${charge}' does not match the structure '^{magnitude}{symbol}'`);
            }
            return [compound, Number(charge.replace(/(\d+)([+-])/, "$2$1")), state];
        }

        return [formula, 0, state];
    }

    static getGroups(formula) {
        const elements = [];
        const groups = [];

        const closingBrace = new Map([["(", ")"], ["{", "}"], ["[", "]"]]);
        let charBuffer = [];
        let openingBraces = [];

        const formulaParts = [];
        for (const part of formula.split(".")) {
            const { coeff, group } = part.match(/^(?<coeff>\d*)(?<group>.+)/).groups;
            if (coeff) formulaParts.push(`(${group})${coeff}`);
            else formulaParts.push(group);
        }
        formula = formulaParts.join("");

        function flushBuffer() {
            if (!charBuffer.length) return;
            if ("[{(".includes(charBuffer[0])) {
                groups.push(charBuffer.join(""));
            }
            else elements.push(charBuffer.join(""));
            charBuffer = [];
        }

        for (const char of formula) {
            if (/[A-Z]/.test(char) && !openingBraces.length) flushBuffer();
            else if ("[{(".includes(char)) {
                if (!openingBraces.length) flushBuffer();
                openingBraces.push(char);
            }
            else if (")}]".includes(char)) {
                if (!openingBraces.length) {
                    throw new Error(`Unmatched closing bracket '${char}' found in '${formula}'`);
                }
                const openingBrace = openingBraces.pop();
                if (closingBrace.get(openingBrace) !== char) {
                    throw new Error(`'${openingBrace}' does not match with '${char}' in '${formula}'`);
                }
            }
            charBuffer.push(char);
        }

        if (openingBraces.length) {
            throw new Error(`'${openingBraces.pop()}' not closed in '${formula}'`);
        }
        flushBuffer();
        
        return [elements, groups];
    }

    static getElements(formula) {
        const [elements, groups] = Compound.getGroups(formula);
        const elementCount = new Map();

        for (const element of elements) {
            const {symbol, count} = element.match(/(?<symbol>[a-z]+)(?<count>\d*)/i).groups;
            elementCount.set(symbol, (elementCount.get(symbol) ?? 0) + Number(count || "1"));
        }

        for (const group of groups) {
            const {grp, mul} = group.match(/[\[\{\(](?<grp>.+)[\]\}\)](?<mul>\d*)/).groups;
            const multiplier = Number(mul || "1");
            for (const [element, count] of Compound.getElements(grp)) {
                elementCount.set(element, (elementCount.get(element) ?? 0) + count * multiplier);
            }
        }

        return elementCount;
    }
}


export default class Reaction {

    constructor(reaction) {
        [this.reactants, this.products] = Reaction.parse(reaction);
    }

    static parse(reaction) {
        if (!/\s+-+>\s+/.test(reaction)) {
            throw new Error("Reaction arrow '-->' is missing or incorrectly formatted, use spaces around the arrow");
        }
        const [lhs, rhs] = reaction.split(/\s+-+>\s+/);
        const reactants = lhs.split(/\s+\+\s+/).map(reactant => new Compound(reactant));
        const products = rhs.split(/\s+\+\s+/).map(product => new Compound(product));
        return [reactants, products];
    }

    static solveEquations(equations) {
        const matrix = new Matrix(equations);
        const pivots = matrix.toRowEchelonForm();
        const solution = Array(matrix.cols).fill(0);

        for (let col = solution.length-1; col > -1; --col) {
            if (!pivots.has(col)) {
                solution[col] = new Fraction(1);
                continue;
            }
            const row = pivots.get(col);
            for (let i = col+1; i < solution.length; i++) {
                solution[col] = Fraction.subtract(solution[col], Fraction.multiply(matrix.matrix[row][i], solution[i]));
            }
            if (!solution[col].num) throw new Error("This reaction cannot be balanced.");
            solution[col] = Fraction.divide(solution[col], matrix.matrix[row][col]);
        }
        
        const factor = solution.reduce((lcm, frac) => Fraction.LCM(lcm, frac.den), 1);
        solution.forEach((frac, index) => solution[index] = Fraction.multiply(factor, frac).num);
        const divisor = solution.reduce((gcd, num) => Fraction.GCD(gcd, num));
        solution.forEach((num, index) => solution[index] = num / divisor);

        return solution;
    }

    assertValidReaction() {
        let chargedSpecies = 0;

        const lhsElements = new Set();
        for (const reactant of this.reactants) {
            reactant.elements.keys().forEach(element => lhsElements.add(element));
            if (reactant.charge) ++chargedSpecies;
        }
        lhsElements.delete(ELECTRON);

        const rhsElements = new Set();
        for (const product of this.products) {
            product.elements.keys().forEach(element => rhsElements.add(element));
            if (product.charge) ++chargedSpecies;
        }
        rhsElements.delete(ELECTRON);

        if (chargedSpecies === 1) {
            throw new Error("Charge cannot be balanced, try adding an electron 'e^1-' to either side");
        }

        const diffElement = lhsElements.symmetricDifference(rhsElements).values().next().value;
        if (diffElement) {
            const absentPos = (lhsElements.has(diffElement)) ? "right hand side" : "left hand side";
            throw new Error(`Element '${diffElement}' not present at ${absentPos} of the equation`);
        }
    }

    getElements() {
        const elements = new Set();
        for (const compound of [...this.reactants, ...this.products]) {
            compound.elements.keys().forEach(element => elements.add(element));
        }
        elements.delete(ELECTRON);
        return elements;
    }

    balancedCoeffs() {
        this.assertValidReaction();

        const equations = [];

        for (const element of this.getElements()) {
            const equation = [];
            this.reactants.forEach(reactant => equation.push(new Fraction(reactant.elements.get(element) ?? 0)));
            this.products.forEach(product => equation.push(new Fraction(-(product.elements.get(element) ?? 0))));
            equations.push(equation);
        }

        const chargeEquation = [];
        this.reactants.forEach(reactant => chargeEquation.push(new Fraction(reactant.charge)));
        this.products.forEach(product => chargeEquation.push(new Fraction(-product.charge)));
        equations.push(chargeEquation);

        return Reaction.solveEquations(equations);
    }
}