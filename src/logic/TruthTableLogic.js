class Logic {
    constructor() {
        this.truthTable = [];
    }

    generateTruthTable(expression) {
        this.truthTable = [];

        // Validar la expresión antes de procesar
        const validationResult = this.validateExpression(expression);
        if (!validationResult.valid) {
            throw new Error(`Error de sintaxis: ${validationResult.message}`);
        }

        expression = expression.replace(/\s+/g, '');
        const variables = this.getVariables(expression);

        // Encontrar todas las subexpresiones entre paréntesis
        const subexpressions = this.findSubexpressions(expression);

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

            // Evaluar cada subexpresión y añadirla al resultado
            for (const subexpr of subexpressions) {
                if (subexpr !== expression) { // Evitar duplicar la expresión principal
                    const subResult = this.evaluate(subexpr, tempRow);
                    outputRow[`(${subexpr})`] = subResult ? 'true' : 'false';
                }
            }

            // Evaluar expresión principal
            const mainResult = this.evaluate(expression, tempRow);
            outputRow.result = mainResult ? 'true' : 'false';

            this.truthTable.push(outputRow);
        }
    }

    validateExpression(expression) {
        if (!expression || expression.trim() === '') {
            return {valid: false, message: "La expresión está vacía"};
        }

        // Verificar paréntesis balanceados
        const parenthesesResult = this.checkBalancedParentheses(expression);
        if (!parenthesesResult.valid) {
            return parenthesesResult;
        }

        // Verificar operadores válidos y su uso correcto
        const operatorsResult = this.checkOperators(expression);
        if (!operatorsResult.valid) {
            return operatorsResult;
        }

        // Verificar variables válidas
        const variablesResult = this.checkVariables(expression);
        if (!variablesResult.valid) {
            return variablesResult;
        }

        // Verificar que no haya operadores consecutivos incorrectos
        const consecutiveOperatorsResult = this.checkConsecutiveOperators(expression);
        if (!consecutiveOperatorsResult.valid) {
            return consecutiveOperatorsResult;
        }

        return {valid: true};
    }

    checkBalancedParentheses(expression) {
        const stack = [];

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];

            if (char === '(') {
                stack.push({char, position: i});
            } else if (char === ')') {
                if (stack.length === 0 || stack[stack.length - 1].char !== '(') {
                    return {
                        valid: false,
                        message: `Paréntesis de cierre sin su correspondiente apertura en la posición ${i + 1}`
                    };
                }
                stack.pop();
            }
        }

        if (stack.length > 0) {
            const unmatched = stack[stack.length - 1];
            return {
                valid: false,
                message: `Paréntesis de apertura sin su correspondiente cierre en la posición ${unmatched.position + 1}`
            };
        }

        return {valid: true};
    }

    checkOperators(expression) {
        // Definir operadores válidos
        const validOperators = ['∧', '∨', '⊕', '↔', '→', '⇒', '->', '!', '¬', '˜', '~', '&&', '||', 'ǀǀ'];
        const operatorRegex = /[∧∨⊕↔→⇒!¬˜~]|->|&&|\|\||ǀǀ/g;

        // Verificar que la expresión no empiece ni termine con operador binario
        const binaryOperators = ['∧', '∨', '⊕', '↔', '→', '⇒', '->', '&&', '||', 'ǀǀ'];

        const trimmedExpr = expression.trim();

        for (const op of binaryOperators) {
            if (trimmedExpr.startsWith(op)) {
                return {
                    valid: false,
                    message: `La expresión no puede comenzar con el operador binario '${op}'`
                };
            }

            if (trimmedExpr.endsWith(op)) {
                return {
                    valid: false,
                    message: `La expresión no puede terminar con el operador binario '${op}'`
                };
            }
        }

        // Verificar operadores inválidos o malformados
        let match;
        while ((match = operatorRegex.exec(trimmedExpr)) !== null) {
            const operator = match[0];
            if (!validOperators.includes(operator)) {
                return {
                    valid: false,
                    message: `Operador inválido '${operator}' en la posición ${match.index + 1}`
                };
            }
        }

        return {valid: true};
    }

    checkVariables(expression) {
        // Eliminar operadores y paréntesis para verificar que solo queden variables válidas
        const operatorsAndParentheses = /[∧∨⊕↔→⇒!¬˜~()]|->|&&|\|\||ǀǀ/g;
        const cleaned = expression.replace(operatorsAndParentheses, ' ').trim();

        if (cleaned === '') {
            return {valid: true}; // No hay variables, puede ser una expresión como (p)
        }

        const tokens = cleaned.split(/\s+/);

        for (const token of tokens) {
            if (token && !/^[A-Za-z]+$/.test(token)) {
                return {
                    valid: false,
                    message: `Variable inválida '${token}'. Las variables deben ser letras.`
                };
            }
        }

        return {valid: true};
    }

    checkConsecutiveOperators(expression) {
        // Verificar que no haya operadores binarios consecutivos
        const binaryOperators = ['∧', '∨', '⊕', '↔', '→', '⇒', '&&', '||', 'ǀǀ'];

        for (let i = 0; i < expression.length - 1; i++) {
            const current = expression[i];
            const next = expression[i + 1];

            // Manejar caso especial de -> (2 caracteres)
            if (current === '-' && next === '>') {
                if (i === 0 || i === expression.length - 2) {
                    return {
                        valid: false,
                        message: `Operador de implicación '->'' mal colocado en la posición ${i + 1}`
                    };
                }

                // Verificar que el siguiente caracter después de -> no sea un operador binario
                if (i + 2 < expression.length) {
                    const afterImplication = expression[i + 2];
                    if (binaryOperators.some(op => op.startsWith(afterImplication))) {
                        return {
                            valid: false,
                            message: `Operadores binarios consecutivos '-> ${afterImplication}' en la posición ${i + 1}`
                        };
                    }
                }

                // Verificar que el caracter antes de -> no sea un operador binario
                if (i > 0) {
                    const beforeImplication = expression[i - 1];
                    if (binaryOperators.some(op => op.endsWith(beforeImplication))) {
                        return {
                            valid: false,
                            message: `Operadores binarios consecutivos '${beforeImplication} ->' en la posición ${i}`
                        };
                    }
                }

                // Saltamos el siguiente caracter ya que es parte del operador ->
                i++;
                continue;
            }

            // Para operadores de un solo caracter
            if (binaryOperators.includes(current)) {
                if (binaryOperators.includes(next) || next === '-') {
                    return {
                        valid: false,
                        message: `Operadores binarios consecutivos '${current}${next}' en la posición ${i + 1}`
                    };
                }
            }
        }

        return {valid: true};
    }

    getVariables(expression) {
        const regex = /[A-Za-z]+/g;
        return [...new Set(expression.match(regex) || [])].sort();
    }

    findSubexpressions(expression) {
        const subexpressions = new Set([expression]);
        let stack = [];

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];

            if (char === '(') {
                stack.push(i);
            } else if (char === ')' && stack.length > 0) {
                const start = stack.pop();
                const subexpr = expression.substring(start + 1, i);
                subexpressions.add(subexpr);
            }
        }

        return Array.from(subexpressions);
    }

    evaluate(expr, tempRow) {
        // Reemplazar negaciones y variables
        let exprCopy = expr
            .replace(/¬/g, '!').replace(/˜/g, '!').replace(/~/g, '!');

        // Sustituir variables por sus valores
        exprCopy = exprCopy.replace(/[A-Za-z]+/g, match => {
            return tempRow[match] !== undefined ? tempRow[match] : match;
        });

        // Reemplazar operadores básicos excepto implicaciones
        exprCopy = exprCopy
            .replace(/∧/g, '&&')
            .replace(/∨/g, '||').replace(/ǀǀ/g, '||')
            .replace(/⊕/g, '!==');

        // Manejar implicaciones y equivalencias
        let prevExpr;
        do {
            prevExpr = exprCopy;

            // Procesar implicaciones
            exprCopy = this.processAllImplications(exprCopy);

            // Procesar equivalencias después de las implicaciones
            exprCopy = exprCopy.replace(/↔/g, '===');

        } while (prevExpr !== exprCopy); // Repetir hasta que no haya cambios

        // Evaluar la expresión resultante
        try {
            return eval(exprCopy);
        } catch (error) {
            throw new Error(`Error al evaluar la expresión: ${error.message} en "${exprCopy}"`);
        }
    }

    processAllImplications(expr) {
        let result = expr;

        // Buscar todas las implicaciones
        const implicationRegex = /(→|⇒|->)/g;
        let match;

        // Si no hay implicaciones, devolver la expresión original
        if (!result.match(implicationRegex)) {
            return result;
        }

        // Procesar cada implicación
        while ((match = implicationRegex.exec(result)) !== null) {
            const implicationPos = match.index;
            const implicationSymbol = match[0];

            // Encontrar los límites del lado izquierdo (antecedente)
            const leftBoundary = this.findLeftOperandBoundary(result, implicationPos);
            const leftOperand = result.substring(leftBoundary, implicationPos);

            // Encontrar los límites del lado derecho (consecuente)
            const rightStart = implicationPos + implicationSymbol.length;
            const rightBoundary = this.findRightOperandBoundary(result, rightStart);
            const rightOperand = result.substring(rightStart, rightBoundary);

            // Reemplazar la implicación con su equivalencia lógica
            const replacement = `(!(${leftOperand}) || (${rightOperand}))`;
            result = result.substring(0, leftBoundary) + replacement + result.substring(rightBoundary);

            // Reiniciar la búsqueda desde el principio, ya que la cadena ha cambiado
            implicationRegex.lastIndex = 0;
        }

        return result;
    }

    findLeftOperandBoundary(expr, operatorPos) {
        // Casos especiales: principio de cadena o después de operador
        if (operatorPos === 0) return 0;

        let pos = operatorPos - 1;
        let parenCount = 0;

        // Retroceder hasta encontrar el inicio del operando izquierdo
        while (pos >= 0) {
            const char = expr[pos];

            if (char === ')') {
                parenCount++;
            } else if (char === '(') {
                parenCount--;
                if (parenCount < 0) {
                    // Encontramos un paréntesis de apertura sin su correspondiente cierre
                    return pos + 1;
                }
            }

            // Si no estamos dentro de paréntesis y encontramos un operador, ese es nuestro límite
            if (parenCount === 0 && (
                char === '∧' || char === '∨' || char === '⊕' || char === '↔' ||
                char === '→' || char === '⇒' || expr.substring(pos - 1, pos + 1) === '->' ||
                char === '&' && expr[pos - 1] === '&' ||
                char === '|' && expr[pos - 1] === '|' ||
                char === '=' && expr[pos - 1] === '=' && expr[pos - 2] === '='
            )) {
                // Para operadores de 2 caracteres como && o ||
                if ((char === '&' && expr[pos - 1] === '&') ||
                    (char === '|' && expr[pos - 1] === '|')) {
                    return pos - 1;
                }
                // Para operadores de 3 caracteres como ===
                else if (char === '=' && expr[pos - 1] === '=' && expr[pos - 2] === '=') {
                    return pos - 2;
                }
                // Para -> (implicación)
                else if (expr.substring(pos - 1, pos + 1) === '->') {
                    return pos - 1;
                }
                // Para operadores de 1 caracter
                else {
                    return pos + 1;
                }
            }

            pos--;
        }

        return 0; // Si llegamos aquí, el operando izquierdo comienza al principio de la cadena
    }

    findRightOperandBoundary(expr, startPos) {
        if (startPos >= expr.length) return expr.length;

        let pos = startPos;
        let parenCount = 0;

        // Avanzar hasta encontrar el final del operando derecho
        while (pos < expr.length) {
            const char = expr[pos];

            if (char === '(') {
                parenCount++;
            } else if (char === ')') {
                parenCount--;
                if (parenCount < 0) {
                    // Encontramos un paréntesis de cierre sin su correspondiente apertura
                    return pos;
                }
            }

            // Si no estamos dentro de paréntesis y encontramos un operador, ese es nuestro límite
            if (parenCount === 0 && (
                char === '∧' || char === '∨' || char === '⊕' || char === '↔' ||
                char === '→' || char === '⇒' || expr.substring(pos, pos + 2) === '->' ||
                char === '&' && expr[pos + 1] === '&' ||
                char === '|' && expr[pos + 1] === '|' ||
                char === '=' && pos + 2 < expr.length && expr[pos + 1] === '=' && expr[pos + 2] === '='
            )) {
                return pos;
            }

            pos++;
        }

        return expr.length; // Si llegamos aquí, el operando derecho termina al final de la cadena
    }
}

export {Logic};