class Logic {
    constructor() {
        this.truthTable = [];
    }

    generateTruthTable(expression) {
        this.truthTable = [];
        const variables = this.getVariables(expression);
        const rows = Math.pow(2, variables.length);
        for (let i = 0; i < rows; i++) {
            const row = {};
            for (let j = 0; j < variables.length; j++) {
                row[variables[j]] = (i & Math.pow(2, j)) !== 0;
            }
            row.result = this.evaluate(expression, row);
            this.truthTable.push(row);
        }
    }

    getVariables(expression) {
        const variables = [];
        const regex = /[a-zA-Z]/g;
        let match;
        while ((match = regex.exec(expression)) !== null) {
            if (!variables.includes(match[0])) {
                variables.push(match[0]);
            }
        }
        return variables;
    }

    evaluate(expression, row) {
        const variables = this.getVariables(expression);
        let result = expression;
        for (let i = 0; i < variables.length; i++) {
            result = result.replace(new RegExp(variables[i], 'g'), row[variables[i]]);
        }
        return eval(result);
    }
}