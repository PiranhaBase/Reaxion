export class Fraction {

    constructor(num, den=1) {
        [this.num, this.den] = Fraction.reduce(num, den);
    }

    static GCD(a, b) {
        while (b) {
            [a, b] = [b, a%b];
        }
        return a;
    }

    static LCM(a, b) {
        return a*b/Fraction.GCD(a, b);
    }

    static reduce(num, den) {
        if (!den) throw new Error("Denominator cannot be zero");
        const gcd = Fraction.GCD(Math.abs(num), Math.abs(den));
        if (den < 0) {
            num *= -1;
            den *= -1;
        }
        return [num/gcd, den/gcd];
    }

    static add(frac1, frac2) {
        if (typeof(frac1) === "number") frac1 = new Fraction(frac1, 1);
        if (typeof(frac2) === "number") frac2 = new Fraction(frac2, 1);
        return new Fraction(frac1.num*frac2.den + frac1.den*frac2.num, frac1.den*frac2.den);
    }

    static subtract(frac1, frac2) {
        return Fraction.add(frac1, Fraction.multiply(frac2, -1));
    }

    static multiply(frac1, frac2) {
        if (typeof(frac1) === "number") frac1 = new Fraction(frac1, 1);
        if (typeof(frac2) === "number") frac2 = new Fraction(frac2, 1);
        return new Fraction(frac1.num*frac2.num, frac1.den*frac2.den);
    }

    static divide(frac1, frac2) {
        if (!frac2.num) throw new Error("Cannot divide by zero");
        if (typeof(frac2) === "number") frac2 = new Fraction(frac2, 1);
        return Fraction.multiply(frac1, new Fraction(frac2.den, frac2.num));
    }
}


export class Matrix {

    constructor(matrix) {
        this.matrix = matrix;
        this.rows = matrix.length;
        this.cols = matrix[0].length;
    }

    toRowEchelonForm() {
        const pivots = new Map();
        let pivotRow = 0;
        for (let pivotCol = 0; pivotCol < this.cols && pivotRow < this.rows; ++pivotCol) {
            if (!this.matrix[pivotRow][pivotCol].num) {
                for (let row = pivotRow+1; row < this.rows; ++row) {
                    if (this.matrix[row][pivotCol].num) {
                        [this.matrix[pivotRow], this.matrix[row]] = [this.matrix[row], this.matrix[pivotRow]];
                        break;
                    }
                }
            }
            if (!this.matrix[pivotRow][pivotCol].num) continue;
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
}