import { Fraction, Matrix } from "./math.js";


const ELECTRON = "e";


class Compound {
    
    constructor(formula) {
        [this.formula, this.charge] = Compound.parse(formula);
        this.elements = Compound.getElements(this.formula);
    }

    static parse(formula) {
        if (formula.includes("^")) {
            const [compound, charge] = formula.split("^");
            if (!/^\d+[+-]$/.test(charge)) {
                throw new Error(`Charge '^${charge}' does not match the structure '^{magnitude}{symbol}'`);
            }
            if (charge.endsWith("-")) return [compound, -Number(charge.slice(0, -1))];
            return [compound, Number(charge.slice(0, -1))];
        }
        return [formula, 0];
    }

    static getGroups(formula) {
        const elements = [];
        const groups = [];
        let buffer = [];
        let openingBraces = [];
        const closingBrace = new Map([["(", ")"], ["{", "}"], ["[", "]"]]);
        function flush() {
            if (!buffer.length) return;
            if (buffer[0] === ".") {
                let {coeff, group} = buffer.join("").match(/^\.(?<coeff>\d*)(?<group>.+)/).groups;
                groups.push(`(${group})${coeff}`);
            }
            else if ("[{(".includes(buffer[0])) {
                groups.push(buffer.join(""));
            }
            else elements.push(buffer.join(""));
            buffer = [];
        }
        for (const char of formula) {
            if ("[{(".includes(char)) {
                if (!openingBraces.length) flush();
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
            if (char === "." || /[A-Z]/.test(char)) {
                if (!openingBraces.length && (buffer.length && buffer[0] !== ".")) flush();
            }
            buffer.push(char);
        }
        if (openingBraces.length) throw new Error(`'${openingBraces.pop()}' not closed in '${formula}'`);
        flush();
        return [elements, groups];
    }

    static getElements(formula) {
        const [elements, groups] = Compound.getGroups(formula);
        const elementCount = new Map();
        function updateCount(element, count) {
            if (elementCount.has(element)) {
                elementCount.set(element, elementCount.get(element)+count);
            }
            else elementCount.set(element, count);
        }
        for (const element of elements) {
            let {symbol, count} = element.match(/(?<symbol>[a-z]+)(?<count>\d*)/i).groups;
            updateCount(symbol, (count) ? Number(count) : 1);
        }
        for (const group of groups) {
            let {grp, multiplier} = group.match(/[\[\{\(](?<grp>.+)[\]\}\)](?<multiplier>\d*)/).groups;
            for (const [element, count] of Compound.getElements(grp)) {
                updateCount(element, count*((multiplier) ? Number(multiplier) : 1));
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
            throw new Error("Reaction arrow '->' is missing or incorrectly formatted, use spaces around the arrow");
        }
        let [reactants, products] = reaction.split(/\s+-+>\s+/);
        reactants = reactants.split(/\s+\+\s+/).map(reactant => new Compound(reactant.replace(/^\d+/, "")));
        products = products.split(/\s+\+\s+/).map(product => new Compound(product.replace(/^\d+/, "")));
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

    getElements() {
        const elements = new Set();
        for (const compound of [...this.reactants, ...this.products]) {
            compound.elements.keys().forEach(element => elements.add(element));
        }
        elements.delete(ELECTRON);
        return elements;
    }

    balancedCoeffs() {
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