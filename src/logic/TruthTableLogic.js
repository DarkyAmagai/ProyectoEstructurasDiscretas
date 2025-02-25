class Logic {
    constructor() {
        this.truthTable = [];
    }

    generateTruthTable(expression) {
        this.truthTable = [];
        expression = expression.replace(/\s+/g, '');
        const variables = this.getVariables(expression);
        const rows = Math.pow(2, variables.length);

        for (let i = 0; i < rows; i++) {
            const tempRow = {};
            const outputRow = {};

            // Asignar valores a variables
            for (let j = 0; j < variables.length; j++) {
                const varName = variables[j];
                tempRow[varName] = (i & (1 << j)) !== 0;
                outputRow[varName] = tempRow[varName] ? 'true' : 'false';
            }

            // Evaluar expresión principal
            const mainResult = this.evaluate(expression, tempRow);
            outputRow.result = mainResult ? 'true' : 'false';

            this.truthTable.push(outputRow);
        }
    }

    getVariables(expression) {
        const regex = /[A-Za-z]+/g;
        return [...new Set(expression.match(regex) || [])].sort();
    }

    evaluate(expr, tempRow) {
        let exprWithValues = expr.replace(/[A-Za-z]+/g, match => {
            return tempRow[match] !== undefined ? tempRow[match] : match;
        });

        // Reemplazar símbolos lógicos
        exprWithValues = exprWithValues
            .replace(/¬/g, '!').replace(/˜/g, '!')
            .replace(/∧/g, '&&').replace(/&/g, '&&')
            .replace(/∨/g, '||').replace(/ǀǀ/g, '||')
            .replace(/⊕/g, '!==')
            .replace(/↔/g, '===')
            .replace(/→|⇒/g, '->') // Unificar implicaciones
            .replace(/([A-Za-z]+)\s*->\s*/g, (_, left) => `!(${left}) || `);

        return eval(exprWithValues);
    }
}

export {Logic};
