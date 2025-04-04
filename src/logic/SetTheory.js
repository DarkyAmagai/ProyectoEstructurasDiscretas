class SetTheory {
    constructor() {
        this.sets = new Map();
        this.infiniteSets = new Map();
        // Caché para operaciones frecuentes
        this.operationCache = new Map();
        // Modo paso a paso
        this.stepByStepMode = false;
    }

    /**
     * Activa o desactiva el modo paso a paso
     * @param {boolean} mode - True para activar, false para desactivar
     */
    setStepByStepMode(mode) {
        this.stepByStepMode = Boolean(mode);
    }

    /**
     * Limpia la caché de operaciones cuando se modifican los conjuntos
     * @private
     */
    _clearCache() {
        this.operationCache.clear();
    }

    /**
     * Genera una clave única para la caché de operaciones
     * @private
     * @param {string} operation - Nombre de la operación
     * @param {string} set1 - Primer conjunto
     * @param {string} set2 - Segundo conjunto (opcional)
     * @returns {string} - Clave para la caché
     */
    _getCacheKey(operation, set1, set2 = null) {
        return `${operation}:${set1}:${set2}`;
    }

    /**
     * Valida que los conjuntos existan
     * @private
     * @param {string} set1 - Primer conjunto
     * @param {string} set2 - Segundo conjunto
     * @throws {Error} Si alguno de los conjuntos no existe
     */
    _validateSetsExist(set1, set2) {
        if (!(this.sets.has(set1) || this.infiniteSets.has(set1))) {
            throw new Error(`El conjunto '${set1}' no existe`);
        }

        if (!(this.sets.has(set2) || this.infiniteSets.has(set2))) {
            throw new Error(`El conjunto '${set2}' no existe`);
        }
    }

    /**
     * Añade un conjunto finito al registro
     * @param {string} name - Nombre del conjunto
     * @param {Array} elements - Elementos del conjunto
     */
    addSet(name, elements) {
        if (!name || name.trim() === '') {
            throw new Error('El nombre del conjunto no puede estar vacío');
        }

        // Asegurarse de que los elementos sean únicos
        const uniqueElements = [...new Set(elements)];
        this.sets.set(name, uniqueElements);

        // Limpiar caché porque se modificaron los conjuntos
        this._clearCache();
    }

    /**
     * Añade un conjunto infinito definido por una expresión
     * @param {string} name - Nombre del conjunto
     * @param {string} definition - Definición del conjunto (ej. "N", "Z", "Q", "R")
     * @param {Function} membershipTest - Función que determina si un elemento pertenece al conjunto
     */
    addInfiniteSet(name, definition, membershipTest) {
        if (!name || name.trim() === '') {
            throw new Error('El nombre del conjunto no puede estar vacío');
        }

        this.infiniteSets.set(name, {definition, membershipTest});

        // Limpiar caché porque se modificaron los conjuntos
        this._clearCache();
    }

    /**
     * Elimina un conjunto
     * @param {string} name - Nombre del conjunto a eliminar
     */
    removeSet(name) {
        if (this.sets.has(name)) {
            this.sets.delete(name);
            this._clearCache();
        } else if (this.infiniteSets.has(name)) {
            this.infiniteSets.delete(name);
            this._clearCache();
        } else {
            throw new Error(`El conjunto '${name}' no existe`);
        }
    }

    /**
     * Verifica si un elemento pertenece a un conjunto
     * @param {any} element - Elemento a verificar
     * @param {string} setName - Nombre del conjunto
     * @returns {boolean}
     */
    isMember(element, setName) {
        if (this.sets.has(setName)) {
            return this.sets.get(setName).includes(element);
        } else if (this.infiniteSets.has(setName)) {
            const set = this.infiniteSets.get(setName);
            return set.membershipTest(element);
        }
        throw new Error(`El conjunto '${setName}' no existe`);
    } //ok

    /**
     * Calcula la unión de dos conjuntos
     * @param {string} set1 - Nombre del primer conjunto
     * @param {string} set2 - Nombre del segundo conjunto
     * @returns {Array|Object} - Resultado de la unión, o un objeto con el resultado y los pasos si stepByStepMode está activo
     */
    union(set1, set2) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(set1, set2);

        // Verificar caché solo si no estamos en modo paso a paso
        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('union', set1, set2);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        // Preparar pasos para el modo paso a paso
        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('union', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La unión de conjuntos infinitos se representa simbólicamente`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} ∪ ${set2} = ${result.representation}`
                });
                return {result, steps};
            }

            this.operationCache.set(this._getCacheKey('union', set1, set2), result);
            return result;
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Tomar todos los elementos del primer conjunto ${set1}`,
                detail: `Elementos iniciales: {${elements1.join(', ')}}`
            });

            const uniqueInSecond = elements2.filter(element => !elements1.includes(element));

            steps.push({
                description: `Agregar elementos del segundo conjunto ${set2} que no estén en el primero`,
                detail: `Elementos a agregar: {${uniqueInSecond.length > 0 ? uniqueInSecond.join(', ') : '∅'}}`
            });
        }

        // Usar un Set para eliminar duplicados de forma eficiente
        const unionSet = new Set(elements1);
        elements2.forEach(element => unionSet.add(element));

        const result = Array.from(unionSet);

        if (this.stepByStepMode) {
            steps.push({
                description: `Resultado final`,
                detail: `${set1} ∪ ${set2} = {${result.join(', ')}}`
            });
            return {
                result,
                steps,
                type: 'finite',
                elements: result,
                representation: `{${result.join(', ')}}`
            };
        }

        this.operationCache.set(this._getCacheKey('union', set1, set2), result);
        return result;
    }

    /**
     * Obtiene una representación textual de un conjunto
     * @private
     * @param {string} setName - Nombre del conjunto
     * @returns {string} - Representación del conjunto
     */
    _getSetRepresentation(setName) {
        if (this.sets.has(setName)) {
            const elements = this.sets.get(setName);
            return elements.length > 0 ? `{${elements.join(', ')}}` : '∅';
        } else if (this.infiniteSets.has(setName)) {
            return this.infiniteSets.get(setName).definition;
        }
        return '?';
    }

    /**
     * Calcula la intersección de dos conjuntos
     * @param {string} set1 - Nombre del primer conjunto
     * @param {string} set2 - Nombre del segundo conjunto
     * @returns {Array|Object} - Resultado de la intersección
     */
    intersection(set1, set2) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(set1, set2);

        // Verificar caché solo si no estamos en modo paso a paso
        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('intersection', set1, set2);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        // Preparar pasos para el modo paso a paso
        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('intersection', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La intersección de conjuntos infinitos requiere analizar cada caso particular`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} ∩ ${set2} = ${typeof result === 'object' ? result.representation : result}`
                });
                return {result, steps};
            }

            this.operationCache.set(this._getCacheKey('intersection', set1, set2), result);
            return result;
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Examinar cada elemento del primer conjunto ${set1}`,
                detail: `Buscar cuáles elementos de ${set1} también están en ${set2}`
            });
        }

        // Optimización: usar un Set para búsqueda O(1) en lugar de includes O(n)
        const set2Elements = new Set(elements2);
        const result = elements1.filter(element => set2Elements.has(element));

        if (this.stepByStepMode) {
            const commonElements = result.length > 0 ? result.join(', ') : '∅';
            steps.push({
                description: `Elementos comunes encontrados`,
                detail: `Elementos que aparecen en ambos conjuntos: {${commonElements}}`
            });

            steps.push({
                description: `Resultado final`,
                detail: `${set1} ∩ ${set2} = {${commonElements}}`
            });

            return {
                result,
                steps,
                type: 'finite',
                elements: result,
                representation: `{${result.join(', ')}}`
            };
        }

        this.operationCache.set(this._getCacheKey('intersection', set1, set2), result);
        return result;
    }

    /**
     * Calcula la diferencia entre dos conjuntos (set1 - set2)
     * @param {string} set1 - Nombre del primer conjunto
     * @param {string} set2 - Nombre del segundo conjunto
     * @returns {Array|Object} - Resultado de la diferencia
     */
    difference(set1, set2) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(set1, set2);

        // Verificar caché solo si no estamos en modo paso a paso
        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('difference', set1, set2);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        // Preparar pasos para el modo paso a paso
        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('difference', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La diferencia entre conjuntos infinitos requiere un tratamiento especial`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} - ${set2} = ${typeof result === 'object' ? result.representation : result}`
                });
                return {result, steps};
            }

            this.operationCache.set(this._getCacheKey('difference', set1, set2), result);
            return result;
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Examinar cada elemento del primer conjunto ${set1}`,
                detail: `Debemos identificar qué elementos de ${set1} NO están en ${set2}`
            });
        }

        // Optimización: usar un Set para búsqueda O(1)
        const set2Elements = new Set(elements2);
        const result = elements1.filter(element => !set2Elements.has(element));

        if (this.stepByStepMode) {
            const elementsInBoth = elements1.filter(element => set2Elements.has(element));
            const commonStr = elementsInBoth.length > 0 ? elementsInBoth.join(', ') : '∅';

            steps.push({
                description: `Identificar elementos comunes`,
                detail: `Elementos que aparecen en ambos conjuntos: {${commonStr}}`
            });

            const resultStr = result.length > 0 ? result.join(', ') : '∅';

            steps.push({
                description: `Eliminar los elementos comunes del primer conjunto`,
                detail: `Elementos que están en ${set1} pero no en ${set2}: {${resultStr}}`
            });

            steps.push({
                description: `Resultado final`,
                detail: `${set1} - ${set2} = {${resultStr}}`
            });

            return {
                result,
                steps,
                type: 'finite',
                elements: result,
                representation: `{${result.join(', ')}}`
            };
        }

        this.operationCache.set(this._getCacheKey('difference', set1, set2), result);
        return result;
    }

    /**
     * Calcula la diferencia simétrica entre dos conjuntos
     * @param {string} set1 - Nombre del primer conjunto
     * @param {string} set2 - Nombre del segundo conjunto
     * @returns {Array|Object} - Resultado de la diferencia simétrica
     */
    symmetricDifference(set1, set2) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(set1, set2);

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            return this._handleInfiniteOperation('symmetricDifference', set1, set2);
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        // Optimización: usar Sets para operaciones de búsqueda O(1)
        const set1Elements = new Set(elements1);
        const set2Elements = new Set(elements2);

        const inSet1NotInSet2 = elements1.filter(element => !set2Elements.has(element));
        const inSet2NotInSet1 = elements2.filter(element => !set1Elements.has(element));

        return [...inSet1NotInSet2, ...inSet2NotInSet1];
    }

    /**
     * Verifica si un conjunto es subconjunto de otro
     * @param {string} subset - Nombre del posible subconjunto
     * @param {string} superset - Nombre del posible superconjunto
     * @returns {boolean}
     */
    isSubset(subset, superset) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(subset, superset);

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(subset) || this.infiniteSets.has(superset)) {
            return this._handleInfiniteOperation('isSubset', subset, superset);
        }

        // Caso de conjuntos finitos - implementación optimizada
        const subsetElements = this.sets.get(subset);
        const supersetElements = this.sets.get(superset);

        // Optimización: usar un Set para búsqueda O(1)
        const supersetSet = new Set(supersetElements);
        return subsetElements.every(element => supersetSet.has(element));
    }

    /**
     * Calcula el complemento de un conjunto respecto a otro
     * @param {string} set - Nombre del conjunto a complementar
     * @param {string} universe - Nombre del conjunto universal de referencia
     * @returns {Array|Object} - Resultado del complemento
     */
    complement(set, universe) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(set, universe);

        // Verificar caché
        const cacheKey = this._getCacheKey('complement', set, universe);
        if (this.operationCache.has(cacheKey)) {
            return this.operationCache.get(cacheKey);
        }

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set) || this.infiniteSets.has(universe)) {
            const result = this._handleInfiniteOperation('complement', set, universe);
            this.operationCache.set(cacheKey, result);
            return result;
        }

        // Caso de conjuntos finitos
        const setElements = this.sets.get(set);
        const universeElements = this.sets.get(universe);

        // El complemento son los elementos del universo que no están en el conjunto
        const setElementsSet = new Set(setElements);
        const result = universeElements.filter(element => !setElementsSet.has(element));

        this.operationCache.set(cacheKey, result);
        return result;
    }

    /**
     * Maneja operaciones con conjuntos infinitos
     * @private
     * @param {string} operation - Tipo de operación
     * @param {string} set1 - Primer conjunto
     * @param {string} set2 - Segundo conjunto
     * @returns {Object} - Resultado de la operación
     */
    _handleInfiniteOperation(operation, set1, set2) {
        const isSet1Infinite = this.infiniteSets.has(set1);
        const isSet2Infinite = this.infiniteSets.has(set2);

        // Definición de los conjuntos
        const set1Def = isSet1Infinite
            ? this.infiniteSets.get(set1).definition
            : `{${this.sets.get(set1).join(', ')}}`;

        const set2Def = isSet2Infinite
            ? this.infiniteSets.get(set2).definition
            : `{${this.sets.get(set2).join(', ')}}`;

        // Implementación para diferentes operaciones
        switch (operation) {
            case 'union':
                // Reglas de unión con conjuntos infinitos
                if (this._isUniversalSet(set1) || this._isUniversalSet(set2)) {
                    return {
                        type: 'infinite',
                        definition: 'U', // Conjunto universal
                        representation: 'U'
                    };
                }

                return {
                    type: 'infinite',
                    definition: `${set1Def} ∪ ${set2Def}`,
                    representation: `${set1} ∪ ${set2}`
                };

            case 'intersection':
                // Si un conjunto es finito, podemos filtrar
                if (!isSet1Infinite) {
                    const elements1 = this.sets.get(set1);
                    const set2Test = this.infiniteSets.get(set2).membershipTest;
                    return elements1.filter(el => set2Test(el));
                }
                if (!isSet2Infinite) {
                    const elements2 = this.sets.get(set2);
                    const set1Test = this.infiniteSets.get(set1).membershipTest;
                    return elements2.filter(el => set1Test(el));
                }

                // Ambos conjuntos son infinitos
                return {
                    type: 'infinite',
                    definition: `${set1Def} ∩ ${set2Def}`,
                    representation: `${set1} ∩ ${set2}`
                };

            case 'difference':
                // Si el primer conjunto es finito, podemos filtrar
                if (!isSet1Infinite) {
                    const elements1 = this.sets.get(set1);
                    const set2Test = this.infiniteSets.get(set2).membershipTest;
                    return elements1.filter(el => !set2Test(el));
                }

                // El resultado es infinito
                return {
                    type: 'infinite',
                    definition: `${set1Def} - ${set2Def}`,
                    representation: `${set1} - ${set2}`
                };

            case 'symmetricDifference':
                return {
                    type: 'infinite',
                    definition: `(${set1Def} - ${set2Def}) ∪ (${set2Def} - ${set1Def})`,
                    representation: `${set1} Δ ${set2}`
                };

            case 'complement':
                // Complemento de un conjunto respecto a otro
                if (this._isUniversalSet(set2)) {
                    return {
                        type: 'infinite',
                        definition: `${set2Def} - ${set1Def}`,
                        representation: `${set1}ᶜ`
                    };
                }

                // Si el conjunto a complementar es finito
                if (!isSet1Infinite) {
                    const elements1 = this.sets.get(set1);
                    const set2Test = this.infiniteSets.get(set2).membershipTest;

                    // Para conjuntos finitos respecto a infinitos, el resultado es infinito
                    return {
                        type: 'infinite',
                        definition: `${set2Def} - ${set1Def}`,
                        representation: `${set2} - ${set1}`
                    };
                }

                return {
                    type: 'infinite',
                    definition: `${set2Def} - ${set1Def}`,
                    representation: `${set2} - ${set1}`
                };

            case 'isSubset':
                // Algunos casos especiales conocidos
                if (this._isUniversalSet(set2)) return true;
                if (this._isUniversalSet(set1) && !this._isUniversalSet(set2)) return false;

                // Si subset es finito, podemos verificar cada elemento
                if (!isSet1Infinite) {
                    const elements = this.sets.get(set1);
                    const superTest = this.infiniteSets.get(set2).membershipTest;
                    return elements.every(el => superTest(el));
                }

                // Relación conocida (por ejemplo, N ⊂ Z ⊂ Q ⊂ R)
                const relation = this._checkKnownSetRelation(set1, set2);
                if (relation !== null) return relation;

                // En otros casos, retornamos una representación de la relación
                return {
                    type: 'relation',
                    representation: `${set1} ⊆ ${set2}`,
                    evaluation: 'indeterminate'
                };

            default:
                throw new Error(`Operación '${operation}' no soportada para conjuntos infinitos`);
        }
    }

    /**
     * Verifica si un conjunto es universal (contiene todos los elementos)
     * @private
     * @param {string} setName - Nombre del conjunto
     * @returns {boolean}
     */
    _isUniversalSet(setName) {
        if (!this.infiniteSets.has(setName)) return false;
        const def = this.infiniteSets.get(setName).definition;
        return def === 'U' || def === 'Universal';
    }

    /**
     * Verifica relaciones conocidas entre conjuntos infinitos
     * @private
     * @param {string} set1 - Primer conjunto
     * @param {string} set2 - Segundo conjunto
     * @returns {boolean|null} - true si es subconjunto, false si no, null si no se conoce
     */
    _checkKnownSetRelation(set1, set2) {
        if (!this.infiniteSets.has(set1) || !this.infiniteSets.has(set2)) return null;

        const def1 = this.infiniteSets.get(set1).definition;
        const def2 = this.infiniteSets.get(set2).definition;

        // Relaciones numéricas conocidas
        const hierarchy = ['N', 'Z', 'Q', 'R', 'C', 'U'];
        const index1 = hierarchy.indexOf(def1);
        const index2 = hierarchy.indexOf(def2);

        if (index1 >= 0 && index2 >= 0) {
            return index1 <= index2; // set1 es subconjunto de set2 si su índice es menor o igual
        }

        return null; // Relación desconocida
    }

    /**
     * Evalúa una expresión de conjuntos
     * @param {string} expression - Expresión a evaluar
     * @returns {Object} - Resultado de la evaluación, o un objeto con el resultado y los pasos si stepByStepMode está activo
     */
    evaluateExpression(expression) {
        // Preparar pasos para el modo paso a paso
        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Tokenizar la expresión`,
                detail: `Expresión original: ${expression}\nIdentificamos cada símbolo como un token individual.`
            });
        }

        // Tokenizar la expresión
        const tokens = this._tokenizeExpression(expression);

        if (this.stepByStepMode) {
            steps.push({
                description: `Tokens identificados`,
                detail: `Tokens: ${tokens.join(' ')}\nEsto incluye operandos (conjuntos), operadores y paréntesis.`
            });

            steps.push({
                description: `Convertir la expresión a notación postfija`,
                detail: `Utilizamos el algoritmo Shunting Yard para convertir la expresión de notación infija a postfija (también conocida como notación polaca inversa).`
            });
        }

        // Construir árbol de sintaxis y evaluar
        const result = this._parseAndEvaluate(tokens, steps);

        // Si estamos en modo paso a paso, devolver tanto el resultado como los pasos
        if (this.stepByStepMode) {
            return {
                result,
                steps
            };
        }

        return result;
    }

    /**
     * Tokeniza una expresión de conjuntos
     * @private
     * @param {string} expression - Expresión a tokenizar
     * @returns {Array} - Array de tokens
     */
    _tokenizeExpression(expression) {
        // Pre-procesamiento: manejar casos especiales como (A)ᶜ
        let processedExpr = expression;

        // Simplemente eliminar llaves sueltas para evitar errores, pero no insertar marcadores
        processedExpr = processedExpr.replace(/[{}]/g, ' ');

        // Detectar patrones de (X)ᶜ y transformarlos a X ᶜ para procesamiento adecuado
        processedExpr = processedExpr.replace(/\(([A-Z])\)ᶜ/g, '($1) ᶜ');

        // Separar explícitamente cada tipo de token
        // Añadir espacios alrededor de operadores y paréntesis para facilitar el split
        processedExpr = processedExpr
            .replace(/([A-Z])/g, ' $1 ')
            .replace(/([∪∩\-Δ⊆ᶜ(){}|])/g, ' $1 ');

        // Dividir por espacios y filtrar tokens vacíos
        const tokens = processedExpr.split(/\s+/).filter(token => token.trim() !== '');

        return tokens;
    }

    /**
     * Parsea y evalúa una expresión de conjuntos tokenizada
     * @private
     * @param {Array} tokens - Tokens de la expresión
     * @param {Array} steps - Array para almacenar los pasos del proceso (opcional)
     * @returns {Object} - Resultado de la evaluación
     */
    _parseAndEvaluate(tokens, steps = []) {
        try {
            // Si después de procesar llegamos a tener tokens vacíos,
            // devolvemos un conjunto vacío en lugar de fallar
            if (!tokens || tokens.length === 0) {
                if (this.stepByStepMode && steps) {
                    steps.push({
                        description: `Expresión procesada como vacía`,
                        detail: `La expresión no contiene operadores o conjuntos válidos para procesar.`
                    });
                }

                // Devolver un resultado vacío en formato adecuado
                return {
                    type: 'finite',
                    elements: [],
                    representation: `{}`
                };
            }

            // Verifica que todos los conjuntos mencionados existan
            const setNames = [...this.sets.keys(), ...this.infiniteSets.keys()];

            // Verificar solo letras mayúsculas que representan conjuntos
            const unknownSets = tokens.filter(t =>
                /^[A-Z]$/.test(t) && !setNames.includes(t));

            if (unknownSets.length > 0) {
                // Si estamos en modo paso a paso, registramos el error pero intentamos continuar
                if (this.stepByStepMode && steps) {
                    steps.push({
                        description: `Conjuntos no definidos detectados`,
                        detail: `Los siguientes conjuntos no están definidos: ${unknownSets.join(', ')}\nSe necesita definir estos conjuntos antes de usarlos en una expresión.`
                    });

                    // Crear conjuntos temporales vacíos para permitir continuar la evaluación
                    for (const setName of unknownSets) {
                        this.addSet(setName, []);

                        steps.push({
                            description: `Definición automática de conjunto`,
                            detail: `Se ha creado automáticamente el conjunto ${setName} = {} (vacío) para continuar con la evaluación.`
                        });
                    }
                } else {
                    // En modo normal, lanzar error
                    throw new Error(`Conjuntos no definidos: ${unknownSets.join(', ')}`);
                }
            }

            // Convertir la expresión infija a postfija (notación polaca inversa)
            const postfixTokens = this._convertToPostfix(tokens);

            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Expresión en notación postfija`,
                    detail: `Notación postfija: ${postfixTokens.join(' ')}\nEn esta notación, los operadores se colocan después de sus operandos, lo que facilita la evaluación computacional.`
                });
            }

            // Evaluar la expresión en notación postfija
            return this._evaluatePostfix(postfixTokens, steps);
        } catch (error) {
            console.error('Error al evaluar expresión:', error);

            // Registrar el error en los pasos si estamos en modo paso a paso
            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Error en la evaluación`,
                    detail: `Se produjo un error: ${error.message}`
                });
            }

            // Propagar el error o devolver un resultado vacío
            if (!this.stepByStepMode) {
                throw error; // Propagar el error para manejo externo
            } else {
                // En modo paso a paso, devolver un resultado con error para mostrar en UI
                return {
                    type: 'finite',
                    elements: [],
                    representation: `{}`,
                    error: error.message
                };
            }
        }
    }

    /**
     * Convierte una expresión infija a postfija usando el algoritmo shunting yard
     * @private
     * @param {Array} tokens - Tokens en notación infija
     * @returns {Array} - Tokens en notación postfija
     */
    _convertToPostfix(tokens) {
        try {
            // Validar que haya al menos un operando
            let hasOperand = false;
            for (const token of tokens) {
                if (/^[A-Z]$/.test(token)) {
                    hasOperand = true;
                    break;
                }
            }

            if (!hasOperand && this.stepByStepMode) {
                // Si no hay operandos, devolvemos un array vacío para que se maneje adecuadamente
                return [];
            }

            const output = [];
            const operatorStack = [];

            // Definir precedencia de operadores (mayor número = mayor precedencia)
            const precedence = {
                '⊆': 1,
                '∪': 2,
                'Δ': 2,
                '∩': 3,
                '-': 3,
                'ᶜ': 4   // Complemento tiene la mayor precedencia
            };

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                // Si es un conjunto (operando)
                if (/^[A-Z]$/.test(token)) {
                    output.push(token);

                    // Verificar si el siguiente token es un complemento y aplicarlo inmediatamente
                    if (i + 1 < tokens.length && tokens[i + 1] === 'ᶜ') {
                        output.push(tokens[i + 1]);
                        i++; // Saltar el complemento
                    }
                }
                // Si es un paréntesis izquierdo
                else if (token === '(') {
                    operatorStack.push(token);
                }
                // Si es un paréntesis derecho
                else if (token === ')') {
                    // Sacar operadores de la pila hasta encontrar el paréntesis izquierdo
                    while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                        output.push(operatorStack.pop());
                    }

                    // Descartar el paréntesis izquierdo
                    if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                        operatorStack.pop();
                    } else {
                        throw new Error('Paréntesis desbalanceados en la expresión');
                    }

                    // Si después del paréntesis hay un complemento, aplicarlo al resultado de la subexpresión
                    if (i + 1 < tokens.length && tokens[i + 1] === 'ᶜ') {
                        output.push(tokens[i + 1]);
                        i++; // Saltar el complemento
                    }
                }
                // Si es un operador
                else if (precedence[token] !== undefined) {
                    // Si es complemento, lo manejamos de manera especial en las otras cláusulas
                    if (token === 'ᶜ') {
                        // Si llega aislado, puede ser un error de parseo previo, pero intentamos manejarlo
                        output.push(token);
                    } else {
                        // Mientras haya operadores en la pila con mayor o igual precedencia
                        while (
                            operatorStack.length > 0 &&
                            operatorStack[operatorStack.length - 1] !== '(' &&
                            precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
                            ) {
                            output.push(operatorStack.pop());
                        }

                        // Añadir el operador actual a la pila
                        operatorStack.push(token);
                    }
                }
                // No necesitamos manejar llaves o barras verticales ya que fueron eliminadas en el preprocesamiento
                else {
                    console.warn(`Token no reconocido y será ignorado: ${token}`);
                    // No lanzar error, simplemente ignorar tokens desconocidos para mayor robustez
                }
            }

            // Sacar los operadores restantes de la pila
            while (operatorStack.length > 0) {
                const op = operatorStack.pop();
                if (op === '(') {
                    throw new Error('Paréntesis desbalanceados en la expresión');
                }
                output.push(op);
            }

            return output;
        } catch (error) {
            console.error('Error en conversión a postfijo:', error);
            // En caso de error, devolver una expresión mínima válida para evitar bloqueos
            return ['A']; // Devolver al menos un token válido
        }
    }

    /**
     * Evalúa una expresión en notación postfija
     * @private
     * @param {Array} tokens - Tokens en notación postfija
     * @param {Array} steps - Array para almacenar los pasos del proceso (opcional)
     * @returns {Object} - Resultado de la evaluación
     */
    _evaluatePostfix(tokens, steps = []) {
        try {
            // Verificar tokens
            if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
                throw new Error('Tokens inválidos para evaluación postfija');
            }

            const stack = [];
            let tempSetCounter = 0;
            let stepCounter = 1;

            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Iniciar evaluación postfija`,
                    detail: `Evaluaremos la expresión postfija procesando cada token de izquierda a derecha.`
                });
            }

            for (const token of tokens) {
                // Si es un conjunto (operando)
                if (/^[A-Z]$/.test(token)) {
                    // Conjunto normal
                    stack.push(token);

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Paso ${stepCounter++}: Procesar operando ${token}`,
                            detail: `Colocamos el conjunto ${token} en la pila.\nPila actual: [${stack.join(', ')}]`
                        });
                    }
                }
                // Si es el operador de complemento (unario)
                else if (token === 'ᶜ') {
                    if (stack.length < 1) {
                        throw new Error('Expresión inválida: falta operando para el complemento');
                    }

                    const set = stack.pop();
                    let universe;

                    // Buscar un conjunto universal adecuado
                    const allSets = [...this.sets.keys(), ...this.infiniteSets.keys()];

                    // Verificar si ya existe un conjunto universal U
                    if (allSets.includes('U')) {
                        universe = 'U';
                    }
                    // Si no hay U, buscar o crear un universo dinámico basado en la unión de todos los conjuntos
                    else {
                        // Filtrar conjuntos temporales y el conjunto que estamos complementando
                        const nonTempSets = allSets.filter(name =>
                            !name.startsWith('_temp') && name !== set);

                        if (nonTempSets.length > 0) {
                            // Si el conjunto "U" no existe, intentamos crearlo como la unión de todos los conjuntos
                            if (!this.sets.has('U') && !this.infiniteSets.has('U')) {
                                try {
                                    // Crear conjunto U como la unión de todos los conjuntos existentes
                                    if (nonTempSets.length === 1) {
                                        // Solo hay un conjunto, usarlo como universo
                                        universe = nonTempSets[0];
                                    } else {
                                        // Hay múltiples conjuntos, crear U como unión de todos
                                        let unionElements = new Set();

                                        for (const setName of nonTempSets) {
                                            if (this.sets.has(setName)) {
                                                // Para conjuntos finitos, añadir sus elementos
                                                const elements = this.sets.get(setName);
                                                elements.forEach(elem => unionElements.add(elem));
                                            }
                                        }

                                        // Añadir U como conjunto universal (solo si no es vacío)
                                        if (unionElements.size > 0) {
                                            this.addSet('U', Array.from(unionElements));
                                            universe = 'U';

                                            if (this.stepByStepMode && steps) {
                                                steps.push({
                                                    description: `Creación del universo U`,
                                                    detail: `Se ha creado automáticamente el universo U = {${Array.from(unionElements).join(', ')}} como la unión de todos los conjuntos existentes.`
                                                });
                                            }
                                        } else {
                                            // Si no hay elementos, usar el último conjunto no temporal
                                            universe = nonTempSets[nonTempSets.length - 1];
                                        }
                                    }
                                } catch (err) {
                                    // En caso de error, usar el último conjunto como universo
                                    universe = nonTempSets[nonTempSets.length - 1];
                                }
                            } else {
                                // Ya existe un U, usarlo
                                universe = 'U';
                            }
                        } else if (allSets.length > 0) {
                            // Si solo hay conjuntos temporales, usar el último como universo
                            universe = allSets[allSets.length - 1];
                        } else {
                            throw new Error('No hay conjunto universal para calcular el complemento');
                        }
                    }

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Paso ${stepCounter++}: Calcular complemento de ${set}`,
                            detail: `Sacamos ${set} de la pila.\nCalculamos el complemento respecto al universo ${universe}.\nFórmula: ${universe} - ${set}`
                        });
                    }

                    // Calcular el complemento
                    const result = this.complement(set, universe);

                    // Crear un conjunto temporal con el resultado
                    const tempSetName = `_temp${tempSetCounter++}`;
                    this._storeResultAsSet(tempSetName, result);

                    // Obtener una representación para mostrar en los pasos
                    let resultRepresentation;
                    if (Array.isArray(result)) {
                        resultRepresentation = `{${result.join(', ')}}`;
                    } else if (result && result.representation) {
                        resultRepresentation = result.representation;
                    } else {
                        resultRepresentation = "Resultado del complemento";
                    }

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Resultado del complemento`,
                            detail: `${set}ᶜ = ${resultRepresentation}\nAlmacenamos el resultado y lo colocamos en la pila.`
                        });
                    }

                    // Poner el conjunto temporal en la pila
                    stack.push(tempSetName);

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Estado actual de la pila`,
                            detail: `Pila: [${stack.join(', ')}]`
                        });
                    }
                }
                // Si es un operador binario
                else {
                    if (stack.length < 2) {
                        throw new Error(`Expresión inválida: faltan operandos para ${token}`);
                    }

                    const set2 = stack.pop();
                    const set1 = stack.pop();

                    let operationDescription;
                    switch (token) {
                        case '∪':
                            operationDescription = 'unión';
                            break;
                        case '∩':
                            operationDescription = 'intersección';
                            break;
                        case '-':
                            operationDescription = 'diferencia';
                            break;
                        case 'Δ':
                            operationDescription = 'diferencia simétrica';
                            break;
                        case '⊆':
                            operationDescription = 'subconjunto';
                            break;
                        default:
                            operationDescription = 'operación';
                    }

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Paso ${stepCounter++}: Calcular ${operationDescription}`,
                            detail: `Sacamos dos operandos de la pila: ${set1} y ${set2}.\nCalculamos ${set1} ${token} ${set2}`
                        });
                    }

                    let result;

                    // Realizar la operación según el operador
                    switch (token) {
                        case '∪':
                            result = this.union(set1, set2);
                            break;
                        case '∩':
                            result = this.intersection(set1, set2);
                            break;
                        case '-':
                            result = this.difference(set1, set2);
                            break;
                        case 'Δ':
                            result = this.symmetricDifference(set1, set2);
                            break;
                        case '⊆':
                            const isSubset = this.isSubset(set1, set2);

                            if (this.stepByStepMode && steps) {
                                steps.push({
                                    description: `Resultado de la relación de subconjunto`,
                                    detail: `¿Es ${set1} subconjunto de ${set2}? ${isSubset ? 'Sí' : 'No'}\n${set1} ${isSubset ? '⊆' : '⊈'} ${set2}`
                                });
                            }

                            return {
                                type: 'relation',
                                representation: `${set1} ${isSubset ? '⊆' : '⊈'} ${set2}`,
                                evaluation: isSubset ? 'true' : 'false'
                            };
                        default:
                            throw new Error(`Operador no reconocido: ${token}`);
                    }

                    // Obtener una representación para mostrar en los pasos
                    let resultRepresentation;
                    if (Array.isArray(result)) {
                        resultRepresentation = `{${result.join(', ')}}`;
                    } else if (result && result.representation) {
                        resultRepresentation = result.representation;
                    } else if (result && result.result && Array.isArray(result.result)) {
                        resultRepresentation = `{${result.result.join(', ')}}`;
                    } else {
                        resultRepresentation = "Resultado de la operación";
                    }

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Resultado de la ${operationDescription}`,
                            detail: `${set1} ${token} ${set2} = ${resultRepresentation}`
                        });
                    }

                    // Crear un conjunto temporal con el resultado
                    const tempSetName = `_temp${tempSetCounter++}`;
                    this._storeResultAsSet(tempSetName, result);

                    // Poner el conjunto temporal en la pila
                    stack.push(tempSetName);

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Estado actual de la pila`,
                            detail: `Pila: [${stack.join(', ')}]`
                        });
                    }
                }
            }

            // Al final debe quedar un solo elemento en la pila (el resultado)
            // Si hay más de un elemento, intentaremos recuperarnos
            if (stack.length !== 1) {
                if (this.stepByStepMode && steps) {
                    steps.push({
                        description: `Problema detectado en la evaluación`,
                        detail: `La evaluación de la expresión resultó en ${stack.length} valores en lugar de uno solo.\nEsto puede deberse a operadores faltantes o sobrantes en la expresión.`
                    });

                    if (stack.length > 1) {
                        // Si hay múltiples elementos, intentamos combinarlos con unión implícita
                        steps.push({
                            description: `Recuperación: combinando resultados`,
                            detail: `Se combinarán los ${stack.length} conjuntos con la operación de unión para obtener un resultado final.`
                        });

                        // Combinar todos los elementos usando unión
                        while (stack.length > 1) {
                            const set2 = stack.pop();
                            const set1 = stack.pop();

                            // Aplicar unión entre los dos conjuntos
                            let result;
                            try {
                                result = this.union(set1, set2);
                            } catch (error) {
                                // Si la unión falla, crear un conjunto vacío como fallback
                                const tempSetName = `_temp_recovery${tempSetCounter++}`;
                                this.addSet(tempSetName, []);
                                result = tempSetName;

                                steps.push({
                                    description: `Error en la combinación`,
                                    detail: `No se pudieron combinar ${set1} y ${set2}. Se usará un conjunto vacío.`
                                });
                            }

                            // Crear un conjunto temporal con el resultado
                            const tempSetName = `_temp${tempSetCounter++}`;
                            this._storeResultAsSet(tempSetName, result);

                            // Poner el conjunto temporal de vuelta en la pila
                            stack.push(tempSetName);

                            steps.push({
                                description: `Combinación de conjuntos`,
                                detail: `${set1} ∪ ${set2} = ${tempSetName}`
                            });
                        }
                    } else if (stack.length === 0) {
                        // Si no hay elementos en la pila, crear un conjunto vacío
                        const tempSetName = `_temp_empty${tempSetCounter++}`;
                        this.addSet(tempSetName, []);
                        stack.push(tempSetName);

                        steps.push({
                            description: `Pila vacía`,
                            detail: `No hay resultados en la pila. Se usará un conjunto vacío como resultado.`
                        });
                    }
                } else {
                    // En modo normal, reportar el error
                    throw new Error('Expresión inválida: la evaluación no resultó en un único valor');
                }
            }

            // Obtener el resultado final
            const finalSetName = stack[0];
            let finalResult;

            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Finalización de la evaluación`,
                    detail: `La expresión ha sido evaluada completamente.\nResultado final en la pila: ${finalSetName}`
                });
            }

            // Si es un conjunto temporal, obtener sus elementos
            if (finalSetName.startsWith('_temp')) {
                if (this.sets.has(finalSetName)) {
                    const elements = this.sets.get(finalSetName);
                    finalResult = {
                        type: 'finite',
                        elements,
                        representation: `{${elements.join(', ')}}`
                    };
                } else {
                    // Si no existe, podría ser un conjunto infinito o un error
                    finalResult = {
                        type: 'unknown',
                        representation: 'Resultado desconocido'
                    };
                }
            }
            // Si es un conjunto existente, devolverlo directamente
            else {
                if (this.sets.has(finalSetName)) {
                    const elements = this.sets.get(finalSetName);
                    finalResult = {
                        type: 'finite',
                        elements,
                        representation: `{${elements.join(', ')}}`
                    };
                } else if (this.infiniteSets.has(finalSetName)) {
                    const info = this.infiniteSets.get(finalSetName);
                    finalResult = {
                        type: 'infinite',
                        definition: info.definition,
                        representation: info.definition
                    };
                }
            }

            if (this.stepByStepMode && steps) {
                let resultDescription;
                if (finalResult.type === 'finite') {
                    resultDescription = `Conjunto finito: ${finalResult.representation}`;
                } else if (finalResult.type === 'infinite') {
                    resultDescription = `Conjunto infinito: ${finalResult.representation}`;
                } else if (finalResult.type === 'relation') {
                    resultDescription = `Relación: ${finalResult.representation}`;
                } else {
                    resultDescription = `Resultado: ${finalResult.representation}`;
                }

                steps.push({
                    description: `Resultado final`,
                    detail: resultDescription
                });
            }

            // Limpiar los conjuntos temporales
            this._cleanupTempSets();

            return finalResult;

        } catch (error) {
            console.error('Error en evaluación postfija:', error);

            // Registrar el error en los pasos si estamos en modo paso a paso
            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Error en la evaluación`,
                    detail: `Se produjo un error: ${error.message}\nSe devolverá un conjunto vacío como resultado.`
                });
            }

            // Devolver un conjunto vacío en caso de error para evitar bloquear la interfaz
            return {
                type: 'finite',
                elements: [],
                representation: `{}`,
                error: error.message
            };
        }
    }

    /**
     * Almacena un resultado como un conjunto temporal
     * @private
     * @param {string} setName - Nombre del conjunto temporal
     * @param {Array|Object} result - Resultado a almacenar
     */
    _storeResultAsSet(setName, result) {
        // Verificación de casos extremos para evitar errores
        if (!setName || typeof setName !== 'string') {
            console.error('Nombre de conjunto inválido:', setName);
            return;
        }

        try {
            // Caso 1: El resultado es un array simple de elementos
            if (Array.isArray(result)) {
                this.addSet(setName, result);
                return;
            }

            // Caso 2: El resultado tiene un formato de objeto con tipo y elementos
            if (result && typeof result === 'object') {
                // Caso 2.1: Objeto con estructura {type: 'finite', elements: [...]}
                if (result.type === 'finite' && Array.isArray(result.elements)) {
                    this.addSet(setName, result.elements);
                    return;
                }

                // Caso 2.2: Objeto con estructura {result: [...]} (del modo paso a paso)
                if (result.result) {
                    if (Array.isArray(result.result)) {
                        this.addSet(setName, result.result);
                        return;
                    } else if (result.result.elements && Array.isArray(result.result.elements)) {
                        this.addSet(setName, result.result.elements);
                        return;
                    }
                }

                // Caso 2.3: Objeto con propiedad elements directa
                if (result.elements && Array.isArray(result.elements)) {
                    this.addSet(setName, result.elements);
                    return;
                }

                // Caso 2.4: Para conjuntos infinitos, hacemos un conjunto mínimo representativo
                if (result.type === 'infinite' || (result.result && result.result.type === 'infinite')) {
                    // Crear un conjunto vacío como representación mínima
                    this.addSet(setName, []);
                    return;
                }
            }

            // Caso por defecto: creamos un conjunto vacío si no pudimos extraer elementos
            // Esto permite que la evaluación continúe sin errores
            this.addSet(setName, []);

        } catch (error) {
            // Manejo de errores: si falla, creamos un conjunto vacío para evitar bloqueos
            console.error('Error al almacenar resultado como conjunto:', error);
            try {
                this.addSet(setName, []);
            } catch (innerError) {
                console.error('Error crítico al crear conjunto vacío:', innerError);
            }
        }
    }

    /**
     * Limpia todos los conjuntos temporales
     * @private
     */
    _cleanupTempSets() {
        // Eliminar todos los conjuntos temporales creados para la evaluación
        for (const setName of this.sets.keys()) {
            if (setName.startsWith('_temp')) {
                this.sets.delete(setName);
            }
        }
    }

    /**
     * Obtiene todos los conjuntos definidos
     * @returns {Object} - Objeto con todos los conjuntos
     */
    getAllSets() {
        const allSets = {};

        // Añadir conjuntos finitos
        for (const [name, elements] of this.sets.entries()) {
            // Omitir conjuntos temporales (los que empiezan con _temp)
            if (!name.startsWith('_temp')) {
                allSets[name] = {
                    type: 'finite',
                    elements,
                    representation: `{${elements.join(', ')}}`
                };
            }
        }

        // Añadir conjuntos infinitos
        for (const [name, info] of this.infiniteSets.entries()) {
            allSets[name] = {
                type: 'infinite',
                definition: info.definition,
                representation: info.definition
            };
        }

        return allSets;
    }

    /**
     * Inicializa conjuntos numéricos comunes (no utilizado en la versión actual)
     */
    initializeCommonSets() {
        // Esta función ya no se utiliza, pero se mantiene por compatibilidad
    }
}

export {SetTheory};