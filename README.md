# Reaxion

A lightweight, high-performance web application for chemical equation balancing, built entirely using native vanilla Web Components, custom client-side routing, and background thread processing.

## Getting Started

Since this project leverages native web technologies without a build step, you can run it directly using any static development server.

### Using Python CLI

Run the following terminal command from your root directory:

```Bash
python -m http.server 8000
```

Then navigate to `http://localhost:8000` in your web browser.

### Using VS Code Live Server

1. Ensure the Live Server extension is installed in your editor.
2. Click Go Live on the status bar to spin up the local loop.

## Key Features

- Fast Chemical Typing: Intuitive syntax allows for rapid entry without needing complex keyboard shortcuts for subscripts.
- Ionic & Redox Support: Handles ions and half-reactions by explicitly balancing net charge alongside atomic mass.
- Exact Arithmetic: Uses a custom `Fraction` class to perform calculations over rationals, avoiding floating-point errors and ensuring the smallest possible integer coefficients.
- Offline Capable: All logic runs locally in the browser; once loaded, no internet connection is required.
- Complex Grouping: Supports nested polyatomic groups using round `()`, curly `{}`, or square `[]` brackets to any arbitrary depth.

## Syntax Guide

To ensure accurate parsing, follow these formatting rules:

|Feature	        | Syntax Example   	  |Notes                                                           |
--------------------|---------------------|----------------------------------------------------------------|
|Subscripts 	    | `H2O`, `SO4`	      |Write as plain integers directly after the symbol.              |
|Ions   	        | `SO4^2-`, `Na^1+`   |Prefix charges with ^ followed by explicit magnitude and sign.  |
|Electrons  	    | `e^1-`              |Represent free electrons in half-reactions.                     |
|Reaction Arrow 	| `->` or `=`         |Must have at least one space on both sides.                     |
|Whitespace	        | `A + B -> C`        |At least one space is required between all terms and operators. |
|Case Sensitivity	| `Co` vs `CO`        |Standard chemical capitalization is strictly enforced.          |
|State Symbol       | `H2O (l)`, `CO2(g)` |Enclose state labels inside parentheses. Must be all lowercase. |

## How it Works

The balancer models chemical equations as a homogeneous linear system ($A\vec{x} = \vec{0}$).

1. Parsing: The `Reaction` class tokenizes the input, validating brackets and chemical symbols.
2. Matrix Construction: A coefficient matrix is built where each row represents a conservation constraint (per element and for total charge) and each column represents a species.
3. Gaussian Elimination: The `Matrix` class reduces the system to Row Echelon Form (REF) using partial pivoting and rational arithmetic.
4. Scaling: The parametric solution is scaled using the Least Common Multiple (LCM) of denominators and Greatest Common Divisor (GCD) of numerators to produce irreducible integer coefficients.

## Implementation Details

The project is built with modular JavaScript and utilizes Web Components for the UI:

- `math.js`: Contains the Fraction and Matrix classes for core mathematical operations.
- `chem.js`: Handles core reaction parsing and balancing logic.

## Attributions

This project distributes optimized, local instances of the following open-source libraries:
- [KaTeX](https://github.com/KaTeX/KaTeX) - Math and chemical formatting.
- [Highlight.js](https://github.com/highlightjs/highlight.js) - Code block syntax highlighting.

## License

This project is open-source software. The underlying custom components, routers, and chemistry algorithms are free to use, modify, and distribute under standard open development conventions.
