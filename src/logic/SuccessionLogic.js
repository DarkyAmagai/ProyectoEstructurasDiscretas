/**
 * Class for handling mathematical successions and induction
 */
export class SuccessionLogic {
    /**
     * Evaluates a succession formula for each term from lowerLimit to upperLimit
     * @param {string} formula - The formula with 'k' as the variable
     * @param {number} lowerLimit - The lower limit for k
     * @param {number} upperLimit - The upper limit for k
     * @returns {Object} - Object containing terms, sum, and product of the succession
     */
    static evaluateSuccession(formula, lowerLimit, upperLimit) {
        const terms = [];
        let sum = 0;
        let product = 1;

        // Validate input
        if (!formula.includes('k')) {
            throw new Error('La fórmula debe contener la variable k');
        }

        try {
            // Process formula to JavaScript syntax
            let jsFormula = formula;

            // Handle mathematical operators and functions
            jsFormula = jsFormula
                // Power operator
                .replace(/\^/g, '**')

                // Handle custom sqrt(...) function
                .replace(/sqrt\s*\(/g, 'Math.sqrt(');

            // Also handle trigonometric functions
            jsFormula = jsFormula
                .replace(/sin\s*\(/g, 'Math.sin(')
                .replace(/cos\s*\(/g, 'Math.cos(')
                .replace(/tan\s*\(/g, 'Math.tan(');

            // Handle logarithmic functions
            jsFormula = jsFormula
                .replace(/log\s*\(/g, 'Math.log10(')
                .replace(/ln\s*\(/g, 'Math.log(');

            // For debugging purposes
            const debugInfo = {
                originalFormula: formula,
                processedFormula: jsFormula
            };

            // Calculate each term in the sequence
            for (let k = lowerLimit; k <= upperLimit; k++) {
                try {
                    // Create a function from the formula string
                    const code = `return ${jsFormula}`;
                    // eslint-disable-next-line no-new-func
                    const termFunction = new Function('k', code);
                    const termValue = termFunction(k);

                    // Check for valid numeric result
                    if (isNaN(termValue) || !isFinite(termValue)) {
                        throw new Error(`El cálculo para k=${k} resultó en un valor no numérico`);
                    }

                    // Add to results
                    terms.push({
                        k,
                        value: termValue
                    });

                    // Acumular suma
                    sum += termValue;

                    // Acumular producto, pero evitar desbordamientos
                    if (product !== 0) {  // Solo multiplicar si no es cero
                        // Verificar si el producto resultante es finito
                        const newProduct = product * termValue;
                        if (isFinite(newProduct)) {
                            product = newProduct;
                        } else {
                            console.warn(`Desbordamiento en el cálculo de la productoria para k=${k}. Valor demasiado grande.`);
                            product = termValue > 0 ? Number.MAX_VALUE : -Number.MAX_VALUE;
                        }
                    }
                } catch (termError) {
                    console.error(`Error evaluating formula for k=${k}:`, termError);
                    throw new Error(`Error evaluando la fórmula para k=${k}: ${termError.message}`);
                }
            }

            return {
                terms,
                sum,
                product,
                debug: debugInfo
            };
        } catch (error) {
            console.error('Error in evaluateSuccession:', error);

            // Provide improved error messages
            let errorMessage = error.message;

            if (errorMessage.includes('unexpected token') ||
                errorMessage.includes('Unexpected token')) {
                errorMessage = 'Error de sintaxis: Verifica que la fórmula esté escrita correctamente.';
            } else if (errorMessage.includes('SyntaxError')) {
                errorMessage = 'Error de sintaxis en la fórmula. Revisa la estructura de tu expresión.';
            } else if (errorMessage.includes('is not defined')) {
                errorMessage = 'Variable no definida. Recuerda que solo puedes usar "k" como variable.';
            } else if (errorMessage.includes('Paréntesis desbalanceados')) {
                errorMessage = 'Verifica que todos los paréntesis estén correctamente cerrados.';
            }

            throw new Error(errorMessage);
        }
    }
}