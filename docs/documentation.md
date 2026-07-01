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

Physical state labels (`(s)`, `(l)`, `(g)`, `(aq)`) are not supported. Omit them to avoid element identification errors.

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
    if (!/\s+-+>\s+/.test(reaction)) {
        throw new Error("Reaction arrow is missing or incorrectly formatted, use spaces around the arrow");
    }
    let [reactants, products] = reaction.split(/\s+-+>\s+/);
    // ...
}
```

Each side is then split on `+` and the resulting strings are converted to `Compound` objects. Any leading coefficient (e.g., the `4` in `4H2O`) is stripped before construction, since `Compound` does not accept them.

```javascript
reactants = reactants.split(/\s+\+\s+/).map(reactant => new Compound(reactant.replace(/^\d+/, "")));

// same for products

return [reactants, products];    // lists of Compound objects
```

Each compound string is then parsed in two passes:

1. **Formula and charge.** `Compound.parse()` splits on `^`, validates the charge token against `/^\d+[+-]$/`, and returns the formula (`String`) and charge (`Number`). A malformed charge throws immediately.
    
    ```javascript
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
    ```

2. **Element frequencies.** `getElements()` builds the element-to-count map needed for balancing. It calls `getGroups()` first, which walks the formula character by character. Rather than tracking a simple nesting depth, it maintains an `openingBraces` stack so it can validate that each closing bracket matches its opener — `)` must close `(`, `]` must close `[`, and so on. An unmatched bracket throws immediately.

    ```javascript
    static getGroups(formula) {
        const elements = [];    // e.g. ["Na2", "P4"]
        const groups = [];      // e.g. ["(NH4)2", "[Co(H2O)6]1"]

        let openingBraces = [];    // stack — tracks unmatched openers
        let buffer = [];           // character accumulator

        function flush() {
            // push buffer to the correct list
            // dot-notation hydrates ".5H2O" are converted to group notation "(H2O)5"
            buffer = [];
        }

        for (const char of formula) {
            if ("[{(".includes(char)) openingBraces.push(char);
            else if (")}]".includes(char)) {
                const opener = openingBraces.pop();
                if (closingBrace.get(opener) !== char) throw new Error(...);
            }
            // call flush() when a new element or group starts at depth zero
        }

        if (openingBraces.length) throw new Error(...);
        flush();    // push any remaining buffer
        return [elements, groups];
    }
    ```

    `getElements()` then uses regex to extract symbol and count from each element token, and recurses into each group — multiplying element counts by the group's outer multiplier before merging into the frequency map.
    
    ```javascript
        static getElements(formula) {
            const [elements, groups] = Compound.getGroups(formula);
            const elementCount = new Map();

            for (const element of elements) {
                let {symbol, count} = element.match(/(?<symbol>[a-z]+)(?<count>\d*)/i).groups;
                // update frequency map
            }

            for (const group of groups) {
                let {grp, multiplier} = group.match(/[\[\{\(](?<grp>.+)[\]\}\)](?<multiplier>\d*)/).groups;
                for (const [element, count] of Compound.getElements(grp)) {
                    // scale by multiplier and merge into frequency map
                }
            }

            return elementCount;
        }
    ```
    
    The electron `e^1-` requires no special handling — `getGroups()` parses it identically to any other compound.

The formula, charge, and frequency map are stored as attributes of the `Compound` object.

### Framing the Equations

`Reaction.getElements()` collects the set of unique elements across all compounds. The electron is excluded — balancing charge implicitly balances electron mass.

```javascript
getElements() {
    const elements = new Set();
    for (const compound of [...this.reactants, ...this.products]) {
        compound.elements.keys().forEach((element) => elements.add(element));
    }

    elements.delete(ELECTRON);    // ELECTRON = 'e'
    return elements;
}
```

`balancedCoeffs()` iterates over this set to build one equation per element — a row whose entries are the element's count in each reactant (positive) and each product (negative). A charge-balance row is appended the same way.

```javascript
balancedCoeffs() {
    const equations = [];
    for (const element of this.getElements()) {
        const equation = [];
        this.reactants.forEach(reactant => equation.push(new Fraction(reactant.elements.get(element) ?? 0)));
        this.products.forEach(product => equation.push(new Fraction(-(product.elements.get(element) ?? 0))));
        equations.push(equation);
    }

    // charge equation added the same way
    // return ...
}
```

All coefficients are wrapped in `Fraction` objects from the start to keep arithmetic exact. `Fraction` stores values as reduced numerator/denominator pairs and implements the four arithmetic operations over the rationals.

```javascript
class Fraction {

    constructor(num, den=1) {
        [this.num, this.den] = Fraction.reduce(num, den);    // always stored in lowest terms
    }

    // static add, subtract, multiply, divide
}
```

### Solving the Equations

`Reaction.solveEquations()` passes the equation list to a `Matrix` object and calls `toRowEchelonForm()`, which reduces the matrix in place using partial pivoting and returns a `Map` of `{ pivotColumn: pivotRow }` entries. For each column, if the current pivot row has a zero entry, rows below are scanned for a non-zero candidate and swapped in. Rows beneath the pivot are then zeroed out by subtracting the appropriate rational multiple of the pivot row.

```javascript
toRowEchelonForm() {
    const pivots = new Map();    // { pivotColumn: pivotRow }
    let pivotRow = 0;

    for (let pivotCol = 0; pivotCol < this.cols && pivotRow < this.rows; ++pivotCol) {
        if (!this.matrix[pivotRow][pivotCol].num) {
            // scan below for a non-zero entry and swap
        }
        if (!this.matrix[pivotRow][pivotCol].num) continue;    // no pivot in this column

        for (let row = pivotRow+1; row < this.rows; ++row) {
            // subtract (row[col] / pivot) * pivotRow from each row below
        }

        pivots.set(pivotCol, pivotRow);
        ++pivotRow;
    }

    return pivots;
}
```

Back-substitution is handled in `solveEquations()` using the returned pivot map. Variables are resolved right to left; columns absent from the map are free variables, anchored to `1`. If back-substitution produces a zero numerator for a pivot variable, the reaction cannot be balanced and an error is thrown.

```javascript
static solveEquations(equations) {
    const matrix = new Matrix(equations);
    const pivots = matrix.toRowEchelonForm();
    const solution = Array(matrix.cols).fill(0);

    for (let col = solution.length-1; col > -1; --col) {
        if (!pivots.has(col)) {
            solution[col] = new Fraction(1);    // free variable — any non-zero value is valid
            continue;
        }
        // substitute known values to solve for this variable
        if (!solution[col].num) throw new Error("This reaction cannot be balanced.");
    }

    // multiply by LCM of denominators, then divide by GCD of numerators
    return solution;
}
```

The three subsections above cover the full pipeline from raw string to integer coefficients. Input validation is front-loaded — arrow format, charge syntax, and bracket matching are all checked during parsing, before any arithmetic begins. The balancing itself is handled by two cooperating classes: Reaction frames the linear system and drives back-substitution, while Matrix encapsulates the row reduction. Fraction arithmetic runs throughout, keeping every intermediate value exact so that scaling to the smallest integers at the end is always correct.