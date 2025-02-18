class Logic {
    constructor() {
        this.truthTable = [];
    }

    generateTruthTable(expression) {
        this.truthTable = [];
        const variables = this.getVariables(expression);
        const subExpressions = this.getSubExpressions(expression);
        const rows = Math.pow(2, variables.length);

        for (let i = 0; i < rows; i++) {
            const tempRow = {}; // Fila temporal con valores booleanos
            const outputRow = {}; // Fila final con valores en string

            // 1. Asignar valores booleanos a las variables
            for (let j = 0; j < variables.length; j++) {
                const varName = variables[j];
                tempRow[varName] = (i & (1 << j)) !== 0;
                outputRow[varName] = tempRow[varName] ? 'true' : 'false'; // Convertir a string
            }

            // 2. Evaluar subexpresiones y resultado (usando valores booleanos)
            subExpressions.forEach(subExpr => {
                const result = this.evaluate(subExpr, tempRow);
                outputRow[subExpr] = result ? 'true' : 'false'; // Convertir a string
            });

            // Evaluar la expresión principal
            const mainResult = this.evaluate(expression, tempRow);
            outputRow.result = mainResult ? 'true' : 'false';

            this.truthTable.push(outputRow);
        }
    }

    getVariables(expression) {
        const regex = /[A-Za-z]/g;
        return [...new Set(expression.match(regex))].sort(); // Ordenar y eliminar duplicados
    }

    getSubExpressions(expression) {
        const regex = /\([^()]+\)/g; // Captura subexpresiones no anidadas
        const matches = expression.match(regex) || [];
        return [...new Set(matches)]; // Eliminar duplicados
    }

    evaluate(expr, tempRow) {
        // Reemplazar variables por valores booleanos del tempRow
        const exprWithValues = expr.replace(/[A-Za-z]+/g, (match) => tempRow[match]);
        return eval(exprWithValues);
    }
}

export {Logic};