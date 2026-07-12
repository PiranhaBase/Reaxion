## Syntax Guide

The input format is designed for fast chemical typing with strict mathematical clarity. Follow these rules to define molecular and ionic species.

### Subscript

Write subscripts as plain integers directly after the element symbol (e.g., `O2`, `SO3`, `Na2O`). No keyboard shortcuts are needed.

### Case Sensitivity

Standard chemical capitalization is mandatory. The parser is strictly case-sensitive: `Co` is Cobalt, while `CO` is Carbon Monoxide. The free electron is the only exception.

### Molecule

Use standard molecular notation. Polyatomic groups may be nested to any depth using round `()`, curly `{}`, or square `[]` brackets. Examples: `CaSO4`, `H3PO4`, `Na[AlH4]`, `K3[Fe(CN)6]`.

### Leading Coefficient

Explicit stoichiometric prefixes (e.g., `2H2O2`, `12KNO3`) are accepted but discarded — the balancer computes the correct coefficients itself.

### Charge

Prefix ionic charges with a caret `^` to avoid ambiguity. For example, `SO4^2-` defines a sulfate ion; without the caret, `SO42-` implies 42 oxygen atoms. The magnitude `1` must be explicit (e.g., `Na^1+` is valid; `Na^+` is not), and the sign (`+` or `-`) is always required.

### Ion

Define ions by appending the caret and charge directly to the formula. Net charge is treated as a conservation constraint alongside atom counts.

### Electron

Represent free electrons in half-reactions as `e^1-`. This ensures consistency with ionic charge syntax and prevents the parser from treating a bare `e` as a chemical element with 0 charge.

### Whitespaces

At least one space is required between all terms — compounds, ions, `+` operators, and the reaction arrow. Correct: `Na -> Na^1+ + e^1-`. Incorrect: `Na->Na^1++e^1-`.

### State Symbols

State symbols `(s)`, `(l)`, `(g)`, `(aq)` are optional but supported. Place the symbol immediately after the species name, inside parentheses, with or without a space. Examples: `H2O (l)`, `Na^1+ (aq)`, `CO2(g)`. The parser accepts any lowercase symbol (e.g., `A2B3 (k)`), but uppercase letters are interpreted as elements.

### Reaction Arrow

The reaction arrow is one or more hyphens followed by a greater-than sign (e.g., `->` or `-->`), surrounded by spaces on both sides.

### Special Symbols

Bond indicators like `-`, `=`, and `≡` are permitted inside a formula as long as there are no internal spaces (e.g., `CH2=CH2`). Internal arrows are also valid (e.g., `(CH3)3N->O`).

## Common Errors

When the balancer fails, the input typically violates one of two fundamental physical constraints:

### Impossible Reactions

Violates conservation of mass. If an element appears on only one side of the equation, no valid non-zero coefficient exists.

### Redox Mismatch

Violates conservation of charge. If the net charge cannot reach zero-sum, add explicit free electron (`e^1-`) to either side — it will be repositioned if needed.

## Calculation

Balancing is modeled as a homogeneous linear system ($A\vec{x} = \vec{0}$). A coefficient matrix is built from atom and charge counts per species, then solved by Gaussian elimination.

### Setting up the Matrix

Each reaction term is assigned an unknown coefficient ($a, b, c, d, \dots$). For the example:

$$\ce{CH4 + O2 -> H2O + CO2}$$

the unknowns are mapped as:

$$\ce{aCH4 + bO2 -> cH2O + dCO2}$$

For each element ($\ce{C}$, $\ce{H}$, $\ce{O}$), an atom-balance equation is written across the reaction arrow. For Carbon ($\ce{C}$):
1. $\ce{CH4}$ contributes $1 \times a = a$.
2. $\ce{O2}$ contributes $0 \times b = 0$. Running sum: $a + 0$.
3. Across the arrow: $\ce{H2O}$ contributes $0 \times c = 0$.
4. $\ce{CO2}$ contributes $1 \times d = d$. Final equation:

$$\begin{align}a + 0 &= 0 + d \notag \\ \implies a &= d \tag{1} \end{align}$$

Repeating for all elements gives:

$$
\begin{gather}
a = d \tag{1} \\
4a = 2c \tag{2} \\
2b = c + 2d \tag{3}
\end{gather}
$$

A charge-balance equation is added in the same way. All species here are neutral, so: 

$$
0 + 0 = 0 + 0 \tag{4}
$$

Moving every term to the left yields the homogeneous system: 

$$
\begin{gather}
a - d = 0 \tag{1} \\
4a - 2c = 0 \tag{2} \\
2b - c - 2d = 0 \tag{3} \\
0 = 0 \tag{4}
\end{gather}
$$

This is written as the augmented matrix $[A|\vec{0}]$, where each row is a conservation constraint and each column is a variable: 

$$
\left[
\begin{array}{cccc|c}
1 & 0 & 0 & -1 & 0 \\
4 & 0 & -2 & 0 & 0 \\
0 & 2 & -1 & -2 & 0 \\
0 & 0 & 0 & 0 & 0
\end{array}
\right]
$$

### Reducing to Row Echelon Form

The matrix is reduced to Row Echelon Form (REF) via elementary row operations. Starting from: 

$$
\left[
\begin{array}{cccc|c}
1 & 0 & 0 & -1 & 0 \\
4 & 0 & -2 & 0 & 0 \\
0 & 2 & -1 & -2 & 0 \\
0 & 0 & 0 & 0 & 0
\end{array}
\right]
$$

1. **$R_2 - 4R_1 \longrightarrow R_2$:** Clear the leading entry in column 1 below the pivot:

$$
\left[
\begin{array}{cccc|c}
1 & 0 & 0 & -1 & 0 \\
0 & 0 & -2 & 4 & 0 \\
0 & 2 & -1 & -2 & 0 \\
0 & 0 & 0 & 0 & 0
\end{array}
\right]
$$

2. **$R_2 \longleftrightarrow R_3$:** Swap rows 2 and 3 to place a non-zero pivot ($2$) in column 2:

$$
\left[
\begin{array}{cccc|c}
1 & 0 & 0 & -1 & 0 \\
0 & 2 & -1 & -2 & 0 \\
0 & 0 & -2 & 4 & 0 \\
0 & 0 & 0 & 0 & 0 
\end{array}
\right]
$$

3. **Pivot check:** The column 3 pivot ($-2$) in $R_3$ has all zeros beneath it — REF is satisfied.

The final REF matrix is:

$$
\left[
\begin{array}{cccc|c}
1 & 0 & 0 & -1 & 0 \\
0 & 2 & -1 & -2 & 0 \\
0 & 0 & -2 & 4 & 0 \\
0 & 0 & 0 & 0 & 0
\end{array}
\right]
$$

Three pivot rows mapping to four unknowns means one free variable — expected, since any valid balanced equation is defined only up to a common scalar multiple.

### Extracting the Solution

The coefficients are recovered by back-substitution on the REF rows, working upward from the last non-zero row. The column with no pivot is the free variable, anchored to a parameter $\lambda$.

The equations read directly from the REF matrix as: 

$$
\begin{gather}
a - d = 0 \tag{1} \\
2b - c - 2d = 0 \tag{2} \\
-2c + 4d = 0 \tag{3}
\end{gather}
$$

Let $d = \lambda$.

1. **From equation (3):**

$$
-2c + 4\lambda = 0 \implies c = 2\lambda
$$

2. **From equation (2):**

$$
2b - 2\lambda - 2\lambda = 0 \implies b = 2\lambda
$$

3. **From equation (1):**

$$
a = \lambda
$$

The parametric solution is: 

$$
a = \lambda, \quad b = 2\lambda, \quad c = 2\lambda, \quad d = \lambda
$$

### Scaling the Solution

The parametric family contains infinitely many valid solutions; stoichiometry requires the smallest positive integers. Setting $\lambda = 1$ gives: 

$$
a = 1, \quad b = 2, \quad c = 2, \quad d = 1
$$

If any value is fractional (e.g., $x = 6/5, y = 3/2, z = 3$), the following two-step normalization is applied: 

1. Multiply through by the LCM of all denominators ($\text{LCM}(5, 2, 1) = 10$):

$$
10x = 12, \quad 10y = 15, \quad 10z = 30
$$

2. If the GCD of the result exceeds 1 ($\text{GCD}(12, 15, 30) = 3$), divide through to get the irreducible integers:

$$
\frac{12}{3} = 4, \quad \frac{15}{3} = 5, \quad \frac{30}{3} = 10
$$

### Verification

The computed coefficients are substituted back to confirm balance. Re-injecting $a = 1, b = 2, c = 2, d = 1$ gives: 

$$
\ce{CH4 + 2O2 -> 2H2O + CO2}
$$

Each conservation constraint is checked:

1. **Carbon:** Left $= 1$ (from $\ce{CH4}$); Right $= 1$ (from $\ce{CO2}$).
2. **Hydrogen:** Left $= 4$ (from $\ce{CH4}$); Right $= 4$ (from $\ce{2H2O}$).
3. **Oxygen:** Left $= 4$ (from $\ce{2O2}$); Right $= 4$ (from $\ce{2H2O + CO2}$).
4. **Charge:** Both sides sum to $0$.

All constraints are satisfied — the equation is correctly balanced.

## Implementation

An overview of how the parser is structured and how the balancing algorithm is implemented. All logic runs client-side; the page works offline once loaded.

### Tokenization and Parsing

The input string is passed to `Reaction.parse()`, which validates that a reaction arrow is present, then splits on it to separate reactants from products.

```javascript
static parse(reaction) {
    // require at least one space on either side of the arrow
    if (!/\s+-+>\s+/.test(reaction)) {
        throw new Error("Reaction arrow '-->' is missing or incorrectly formatted, use spaces around the arrow");
    }

    const [lhs, rhs] = reaction.split(/\s+-+>\s+/);

    // each side is split on '+', and each term becomes a Compound
    const reactants = lhs.split(/\s+\+\s+/).map(reactant => new Compound(reactant));
    const products = rhs.split(/\s+\+\s+/).map(product => new Compound(product));

    return [reactants, products];
}
```

Each compound string is parsed in three passes:

1. **Coefficient stripping, then state symbol extraction.** `Compound.parse()` first strips any leading coefficient and surrounding whitespace, then checks for a trailing state label — `(s)`, `(l)`, `(g)`, or `(aq)` — removing it from the formula before further parsing and storing it separately as `state`.

    ```javascript
        static parse(formula) {
            // strip a leading coefficient (e.g. the '4' in '4H2O') and any whitespace
            formula = formula.replace(/^\s*\d+|\s+/g, "");

            // pull a trailing state label like '(l)' or '(aq)' off the formula, if present
            const state = formula.match(/\((?<state>[a-z]+)\)$/)?.groups.state;
            if (state) formula = formula.replace(/\([a-z]+\)$/, "");

            if (formula.includes("^")) {
                const [compound, charge] = formula.split("^");

                // charge must be magnitude + sign, e.g. '2-' or '1+'
                if (!/^\d+[+-]$/.test(charge)) {
                    throw new Error(`Charge '^${charge}' does not match the structure '^{magnitude}{symbol}'`);
                }

                // swap sign and magnitude order so it can be parsed directly as a signed number
                return [compound, Number(charge.replace(/(\d+)([+-])/, "$2$1")), state];
            }

            // neutral species — charge defaults to 0
            return [formula, 0, state];
        }
    ```

    A malformed charge throws immediately, before any further parsing happens.

2. **Formula and charge.** `formula`, `charge`, and `state` are destructured from `Compound.parse()`'s return and stored as instance properties on the `Compound`.

3. **Element frequencies.** `getElements()` builds the element-to-count map needed for balancing, using `getGroups()` to tokenize the formula. Dot-notation hydrates (`.5H2O`) are normalized into group notation up front:

    ```javascript
        static getGroups(formula) {
            const elements = [];   // e.g. ["Na2", "P4"]
            const groups = [];     // e.g. ["(NH4)2", "[Co(H2O)6]1"]

            const closingBrace = new Map([["(", ")"], ["{", "}"], ["[", "]"]]);
            let charBuffer = [];
            let openingBraces = [];    // stack — tracks unmatched openers

            // convert dot-hydrate notation ('.5H2O') into group notation ('(H2O)5')
            // before the main character walk begins, so the loop below never has
            // to special-case a leading '.'
            const formulaParts = [];
            for (const part of formula.split(".")) {
                const { coeff, group } = part.match(/^(?<coeff>\d*)(?<group>.+)/).groups;
                if (coeff) formulaParts.push(`(${group})${coeff}`);
                else formulaParts.push(group);
            }
            formula = formulaParts.join("");

            function flushBuffer() {
                if (!charBuffer.length) return;
                // a buffer starting with a bracket is a group; otherwise it's a plain element
                if ("[{(".includes(charBuffer[0])) {
                    groups.push(charBuffer.join(""));
                }
                else elements.push(charBuffer.join(""));
                charBuffer = [];
            }

            for (const char of formula) {
                // a capital letter at depth zero starts a new element — flush the previous one first
                if (/[A-Z]/.test(char) && !openingBraces.length) flushBuffer();
                else if ("[{(".includes(char)) {
                    if (!openingBraces.length) flushBuffer();
                    openingBraces.push(char);
                }
                else if (")}]".includes(char)) {
                    if (!openingBraces.length) {
                        throw new Error(`Unmatched closing bracket '${char}' found in '${formula}'`);
                    }
                    // verify the closing bracket matches the most recent opener
                    const openingBrace = openingBraces.pop();
                    if (closingBrace.get(openingBrace) !== char) {
                        throw new Error(`'${openingBrace}' does not match with '${char}' in '${formula}'`);
                    }
                }
                charBuffer.push(char);
            }

            // any brace left on the stack was never closed
            if (openingBraces.length) {
                throw new Error(`'${openingBraces.pop()}' not closed in '${formula}'`);
            }
            flushBuffer();

            return [elements, groups];
        }
    ```

    `getElements()` then extracts symbol and count per element token, and recurses into each group, scaling by the group's outer multiplier before merging into the frequency map:

    ```javascript
        static getElements(formula) {
            const [elements, groups] = Compound.getGroups(formula);
            const elementCount = new Map();

            // plain elements, e.g. 'Na2' -> symbol 'Na', count 2
            for (const element of elements) {
                const {symbol, count} = element.match(/(?<symbol>[a-z]+)(?<count>\d*)/i).groups;
                elementCount.set(symbol, (elementCount.get(symbol) ?? 0) + Number(count || "1"));
            }

            // bracketed groups, e.g. '(NH4)2' -> recurse into 'NH4', then multiply every count by 2
                for (const group of groups) {
                const {grp, mul} = group.match(/[\[\{\(](?<grp>.+)[\]\}\)](?<mul>\d*)/).groups;
                const multiplier = Number(mul || "1");
                for (const [element, count] of Compound.getElements(grp)) {
                    elementCount.set(element, (elementCount.get(element) ?? 0) + count * multiplier);
                }
            }

            return elementCount;
        }
    ```

    The electron `e^1-` requires no special handling — it's parsed by the same code path as any other compound, with `state` simply left `undefined`.

### Pre-Flight Validation

Before framing the linear system, `Reaction.assertValidReaction()` runs two structural checks that give specific, actionable error messages rather than letting an invalid reaction fail deep inside the matrix solver:

```javascript
assertValidReaction() {
    let chargedSpecies = 0;

    // collect every element present on the reactant side
    const lhsElements = new Set();
    for (const reactant of this.reactants) {
        reactant.elements.keys().forEach(element => lhsElements.add(element));
        if (reactant.charge) ++chargedSpecies;
    }
    lhsElements.delete(ELECTRON);

    // collect every element present on the product side
    const rhsElements = new Set();
    for (const product of this.products) {
        product.elements.keys().forEach(element => rhsElements.add(element));
        if (product.charge) ++chargedSpecies;
    }
    rhsElements.delete(ELECTRON);

    // exactly one charged species means charge has nothing to balance against
    if (chargedSpecies === 1) {
        throw new Error("Charge cannot be balanced, try adding an electron 'e^1-' to either side");
    }

    // any element present on only one side makes the reaction unbalanceable by definition
    const diffElement = lhsElements.symmetricDifference(rhsElements).values().next().value;
    if (diffElement) {
        const absentPos = (lhsElements.has(diffElement)) ? "right hand side" : "left hand side";
        throw new Error(`Element '${diffElement}' not present at ${absentPos} of the equation`);
    }
}
```

- **Charge feasibility** — if exactly one charged species exists across the whole reaction, charge balance is structurally impossible regardless of coefficients. This is caught before any arithmetic runs, with a message suggesting the specific fix — adding an explicit electron.

- **Element presence** — using `Set.prototype.symmetricDifference()`, any element present on only one side of the equation is caught immediately, naming the missing element and which side it's absent from.

`balanced()` calls this check first, before framing any equations.

### Framing the Equations

`Reaction.getElements()` collects the set of unique elements across all compounds. The electron is excluded — balancing charge implicitly balances electron mass.

```javascript
getElements() {
    const elements = new Set();
    for (const compound of [...this.reactants, ...this.products]) {
        compound.elements.keys().forEach((element) => elements.add(element));
    }

    elements.delete(ELECTRON);
    return elements;
}
```

`balanced()` builds one equation per element — a row whose entries are the element's count in each reactant (positive) and each product (negative) — plus a charge-balance row appended the same way:

```javascript
balanced() {
    this.assertValidReaction();

    const equations = [];

    // one equation per element: conservation means reactant counts minus product counts sum to zero
    for (const element of this.getElements()) {
        const equation = [];
        this.reactants.forEach(reactant => equation.push(reactant.elements.get(element) ?? 0));
        this.products.forEach(product => equation.push(-(product.elements.get(element) ?? 0)));
        equations.push(equation);
    }

    // one more equation for net charge, built the same way
    const chargeEquation = [];
    this.reactants.forEach(reactant => chargeEquation.push(reactant.charge));
    this.products.forEach(product => chargeEquation.push(-product.charge));
    equations.push(chargeEquation);

    // ... solving happens here, see below
}
```

Equations are built with plain numbers — `Fraction` wrapping happens entirely inside `Matrix`'s constructor, so `Reaction` never needs to import or reason about `Fraction` directly. This keeps `Reaction` focused purely on chemistry: parsing, validation, and equation framing.

### Solving the Equations

Solving is handled by a static method on `Matrix`, `solveHomogeneousSystem()`, which has no awareness of chemistry — it operates purely on a generic homogeneous linear system:

```javascript
static solveHomogeneousSystem(equations) {
    const matrix = new Matrix(equations);          // wraps every entry in a Fraction internally
    const pivots = matrix.toRowEchelonForm();       // { pivotColumn: pivotRow }
    const solution = Array(matrix.cols).fill(0);

    // back-substitute right to left
    for (let col = solution.length-1; col > -1; --col) {
        if (!pivots.has(col)) {
            // no pivot in this column — it's a free variable, anchored to 1
            solution[col] = new Fraction(1);
            continue;
        }

        const row = pivots.get(col);
        for (let i = col+1; i < solution.length; i++) {
            solution[col] = Fraction.subtract(solution[col], Fraction.multiply(matrix.matrix[row][i], solution[i]));
        }

        // a zero numerator here means only the trivial (all-zero) solution exists
        if (!solution[col].num) throw new Error("Only trivial solution is possible for this system");
        solution[col] = Fraction.divide(solution[col], matrix.matrix[row][col]);
    }

    // scale every value up to integers: multiply by the LCM of all denominators...
    const factor = solution.reduce((lcm, frac) => Fraction.LCM(lcm, frac.den), 1);
    solution.forEach((frac, index) => solution[index] = Fraction.multiply(factor, frac).num);

    // ...then divide out the GCD so the coefficients are in lowest terms
    const divisor = solution.reduce((gcd, num) => Fraction.GCD(gcd, num));
    solution.forEach((num, index) => solution[index] = num / divisor);

    return solution;
}
```

Row reduction (`toRowEchelonForm`) uses partial pivoting — for each column, if the current pivot row has a zero entry, rows below are scanned for a non-zero candidate and swapped in:

```javascript
toRowEchelonForm() {
    const pivots = new Map();
    let pivotRow = 0;

    for (let pivotCol = 0; pivotCol < this.cols && pivotRow < this.rows; ++pivotCol) {
        // if the pivot position is zero, look below for a row to swap in
        if (!this.matrix[pivotRow][pivotCol].num) {
            for (let row = pivotRow+1; row < this.rows; ++row) {
                if (this.matrix[row][pivotCol].num) {
                    [this.matrix[pivotRow], this.matrix[row]] = [this.matrix[row], this.matrix[pivotRow]];
                    break;
                }
            }
        }

        // still zero after searching — no pivot in this column, move on
        if (!this.matrix[pivotRow][pivotCol].num) continue;

        // eliminate this column from every row below the pivot
        for (let row = pivotRow+1; row < this.rows; ++row) {
            if (!this.matrix[row][pivotCol].num) continue;
            const multiplier = Fraction.divide(this.matrix[row][pivotCol], this.matrix[pivotRow][pivotCol]);
            for (let col = 0; col < this.cols; ++col) {
                this.matrix[row][col] = Fraction.subtract(this.matrix[row][col], Fraction.multiply(this.matrix[pivotRow][col], multiplier));
            }
        }

        pivots.set(pivotCol, pivotRow);
        ++pivotRow;
    }

    return pivots;
}
```

`Reaction.balanced()` calls `Matrix.solveHomogeneousSystem()` inside a `try`/`catch`, re-throwing with a chemistry-appropriate message on failure — `Matrix` itself has no concept of "reactions," so its own error message stays generic:

```javascript
try {
    const coeffs = Matrix.solveHomogeneousSystem(equations).values();
    // ... structuring the result, see below
}
catch (error) {
    throw new Error("This reaction cannot be balanced for any non-zero coefficient");
}
```

This keeps `Matrix` fully reusable as a general-purpose linear algebra utility, independent of any chemistry-specific concerns.

### Structuring the Result

`balanced()` returns a structured result — each `Compound` mapped directly to its resolved integer coefficient, split into `reactants` and `products`:

```javascript
const coeffs = Matrix.solveHomogeneousSystem(equations).values();
const reactants = new Map();
const products = new Map();

for (const reactant of this.reactants) {
    const coeff = coeffs.next().value;
    // a negative coefficient means this species actually belongs on the other side
    if (coeff > 0) reactants.set(reactant, coeff);
    else products.set(reactant, -coeff);
}

for (const product of this.products) {
    const coeff = coeffs.next().value;
    if (coeff > 0) products.set(product, coeff);
    else reactants.set(product, -coeff);
}

return { reactants, products };
```

The return shape is `{ reactants: Map<Compound, number>, products: Map<Compound, number> }`, so callers can iterate directly without tracking array indices to match coefficients back to compounds. Sign correction is automatic — if back-substitution resolves a coefficient to a negative number, the compound is moved to the opposite map with the coefficient negated back to positive, handling cases where the chosen free variable produces a species that belongs on the other side of the equation.

The full pipeline runs in three stages: `Reaction` parses and validates the input (arrow format, charge syntax, bracket matching during parsing; element presence and charge feasibility in `assertValidReaction()`), frames the linear system, and hands it to `Matrix`, which performs row reduction, back-substitution, and integer scaling with no awareness of chemistry at all. `Fraction` arithmetic runs throughout the solving stage, keeping every intermediate value exact so that scaling to the smallest integer coefficients is always correct.