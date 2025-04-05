class SetTheory {
    constructor() {
        this.sets = new Map();
        this.infiniteSets = new Map();
        this.operationCache = new Map();
        this.stepByStepMode = false;

        // Inicializar conjuntos infinitos predefinidos con muestras para mejor visualización
        this.addInfiniteSet('N', 'ℕ = {0, 1, 2, 3, ...}',
            n => Number.isInteger(n) && n >= 0,
            [0, 1, 2, 3, 4, 5, '...']
        );

        this.addInfiniteSet('Z', 'ℤ = {..., -2, -1, 0, 1, 2, ...}',
            n => Number.isInteger(n),
            ['...', -2, -1, 0, 1, 2, '...']
        );

        this.addInfiniteSet('Q', 'ℚ = {racionales}',
            n => typeof n === 'number' && isFinite(n),
            ['-2', '-1', '0', '1/2', '1', '2', '22/7', '...']
        );

        this.addInfiniteSet('R', 'ℝ = {reales}',
            n => typeof n === 'number',
            ['-π', '-1', '0', '1/2', '√2', 'π', '...']
        );

        this.addInfiniteSet('E', 'E = {2, 4, 6, ...}',
            n => Number.isInteger(n) && n % 2 === 0 && n > 0,
            [2, 4, 6, 8, 10, '...']
        );

        this.addInfiniteSet('O', 'O = {1, 3, 5, ...}',
            n => Number.isInteger(n) && n % 2 === 1 && n > 0,
            [1, 3, 5, 7, 9, '...']
        );

        this.addInfiniteSet('P', 'P = {2, 3, 5, 7, 11, ...}',
            n => {
                if (n <= 1) return false;
                if (n <= 3) return true;
                if (n % 2 === 0 || n % 3 === 0) return false;
                for (let i = 5; i * i <= n; i += 6) {
                    if (n % i === 0 || n % (i + 2) === 0) return false;
                }
                return true;
            },
            [2, 3, 5, 7, 11, 13, '...']
        );

        // Conjunto universal
        this.addInfiniteSet('U', 'U = {universal}',
            () => true,
            ['...', 'todos los elementos', '...']
        );

        // Conjunto de números complejos
        this.addInfiniteSet('C', 'ℂ = {complejos}',
            n => true, // Simplificado para este contexto
            ['1', 'i', '1+i', '2-3i', '...']
        );
    }

    setStepByStepMode(mode) {
        this.stepByStepMode = Boolean(mode);
    }

    _clearCache() {
        this.operationCache.clear();
    }

    _getCacheKey(operation, set1, set2 = null) {
        return `${operation}:${set1}:${set2}`;
    }

    _validateSetsExist(set1, set2) {
        if (!(this.sets.has(set1) || this.infiniteSets.has(set1))) {
            throw new Error(`El conjunto '${set1}' no existe`);
        }

        if (!(this.sets.has(set2) || this.infiniteSets.has(set2))) {
            throw new Error(`El conjunto '${set2}' no existe`);
        }
    }

    // Método auxiliar para formatear un único elemento con mejor soporte para conjuntos anidados
    _formatSingleElement(element) {
        if (!element) return '';

        // Si el elemento es directamente un valor primitivo (string, número, etc.)
        if (typeof element !== 'object') {
            return String(element);
        }

        // Estructura de elementos mejorada
        if (element.type === 'primitive') {
            return String(element.value);
        } else if (element.type === 'set') {
            // Manejo recursivo para conjuntos anidados
            const formattedElements = element.elements.map(elem =>
                this._formatSingleElement(elem)
            );
            return `{${formattedElements.join(', ')}}`;
        } else if (element.type === 'setRef') {
            return element.reference;
        }

        // Si no coincide con ninguno de los anteriores, convertir a string
        return JSON.stringify(element);
    }

    // Método para formatear un array de elementos a string
    _formatElementsArray(elements) {
        if (!elements || elements.length === 0) return '';
        return elements.map(element => this._formatSingleElement(element)).join(', ');
    }

    // Obtiene una representación textual de los elementos de un conjunto
    _getSetElementsString(setName) {
        if (this.sets.has(setName)) {
            const elements = this.sets.get(setName);
            if (elements.length === 0) return '∅';
            return this._formatElementsArray(elements);
        } else if (this.infiniteSets.has(setName)) {
            return this.infiniteSets.get(setName).definition;
        }
        return '?';
    }

    // Método para obtener representación completa con llaves
    _getSetRepresentation(setName) {
        const elementsStr = this._getSetElementsString(setName);
        if (elementsStr === '∅') return '∅';
        if (elementsStr === '?') return '?';
        return `{${elementsStr}}`;
    }

    // Método auxiliar para crear un elemento primitivo estructurado
    _createPrimitiveElement(value) {
        return {type: 'primitive', value};
    }

    // Método auxiliar para crear un elemento de conjunto anidado
    _createSetElement(elements) {
        return {type: 'set', elements};
    }

    // Método auxiliar para crear una referencia a otro conjunto
    _createSetReference(name) {
        return {type: 'setRef', reference: name};
    }

    // Método mejorado para procesar texto de entrada y detectar conjuntos anidados
    _parseSetInput(input) {
        // Si ya es un objeto con el formato correcto, devolverlo sin cambios
        if (input && typeof input === 'object' && input.type) {
            return input;
        }

        // Convertir a string para procesamiento uniforme
        const strInput = String(input).trim();

        // Verificar si es un conjunto anidado con formato {a,b,c,...}
        if (strInput.startsWith('{') && strInput.endsWith('}')) {
            return this._parseNestedSet(strInput);
        }

        // Verificar si es una referencia a un conjunto existente
        if (this.sets.has(strInput) || this.infiniteSets.has(strInput)) {
            return this._createSetReference(strInput);
        }

        // Si es un número, convertirlo apropiadamente
        if (!isNaN(Number(strInput)) && String(Number(strInput)) === strInput) {
            return this._createPrimitiveElement(Number(strInput));
        }

        // Por defecto, tratar como valor primitivo (string)
        return this._createPrimitiveElement(strInput);
    }

    // Método para parsear un conjunto anidado completo
    _parseNestedSet(setStr) {
        // Remover las llaves externas y dividir por comas, respetando conjuntos anidados
        const content = setStr.substring(1, setStr.length - 1);
        const parsedElements = this._parseNestedContent(content);

        // Convertir los elementos analizados a la estructura correcta
        const structuredElements = parsedElements.map(elem => this._parseSetInput(elem));

        // Devolver un elemento de tipo conjunto
        return this._createSetElement(structuredElements);
    }

    // Método mejorado para analizar el contenido de un conjunto anidado
    _parseNestedContent(content) {
        if (!content || content.trim() === '') {
            return [];
        }

        let tokens = [];
        let currentToken = '';
        let nestedLevel = 0;

        // Recorrer caracter por caracter para detectar correctamente conjuntos anidados
        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            if (char === ',' && nestedLevel === 0) {
                // Si encontramos una coma fuera de un conjunto anidado, terminamos el token actual
                if (currentToken.trim()) {
                    tokens.push(currentToken.trim());
                }
                currentToken = '';
            } else if (char === '{') {
                // Incrementamos el nivel de anidamiento
                nestedLevel++;
                currentToken += char;
            } else if (char === '}') {
                // Decrementamos el nivel de anidamiento
                nestedLevel--;
                currentToken += char;
            } else {
                // Cualquier otro caracter se agrega al token actual
                currentToken += char;
            }
        }

        // No olvidar el último token
        if (currentToken.trim()) {
            tokens.push(currentToken.trim());
        }

        return tokens;
    }

    // Método para comparar si dos elementos son iguales (mejorado para conjuntos anidados)
    _elementsEqual(elem1, elem2) {
        // Si alguno de los elementos es null o undefined
        if (!elem1 || !elem2) return elem1 === elem2;

        // Si los tipos son diferentes, no son iguales
        if (elem1.type !== elem2.type) return false;

        if (elem1.type === 'primitive') {
            // Comparación estricta para valores primitivos
            return elem1.value === elem2.value;
        } else if (elem1.type === 'setRef') {
            // Comparación de referencias a conjuntos
            return elem1.reference === elem2.reference;
        } else if (elem1.type === 'set') {
            // Para conjuntos anidados, comparación profunda
            if (elem1.elements.length !== elem2.elements.length) return false;

            // Verificar que todos los elementos del primer conjunto estén en el segundo
            // y viceversa (comparación de conjuntos)
            return this._compareNestedSetElements(elem1.elements, elem2.elements);
        }

        return false;
    }

    // Método mejorado para comparar elementos de conjuntos anidados
    _compareNestedSetElements(elements1, elements2) {
        if (elements1.length !== elements2.length) return false;

        // Para cada elemento en elements1, debe haber un elemento igual en elements2
        const matched = new Array(elements2.length).fill(false);

        for (const elem1 of elements1) {
            let foundMatch = false;

            for (let i = 0; i < elements2.length; i++) {
                if (matched[i]) continue; // Este elemento ya fue emparejado

                const elem2 = elements2[i];

                if (this._elementsEqual(elem1, elem2)) {
                    matched[i] = true;
                    foundMatch = true;
                    break;
                }
            }

            // Si no encontramos un elemento igual en elements2, los conjuntos son diferentes
            if (!foundMatch) return false;
        }

        // Todos los elementos de elements1 tienen una correspondencia en elements2
        return true;
    }

    // Método para asegurar elementos únicos en un conjunto
    _getUniqueElements(elements) {
        const uniqueElements = [];
        const seen = new Set();

        for (const element of elements) {
            // Generamos una clave única para cada elemento
            let key;

            if (element.type === 'primitive') {
                key = `p:${String(element.value)}`;
            } else if (element.type === 'set') {
                // Para conjuntos anidados, usamos una representación ordenada y serializada
                const sortedElements = [...element.elements].sort((a, b) => {
                    return this._formatSingleElement(a).localeCompare(this._formatSingleElement(b));
                });
                key = `s:${this._formatElementsArray(sortedElements)}`;
            } else if (element.type === 'setRef') {
                key = `r:${element.reference}`;
            } else {
                // Fallback para cualquier otro tipo
                key = `o:${JSON.stringify(element)}`;
            }

            if (!seen.has(key)) {
                seen.add(key);
                uniqueElements.push(element);
            }
        }

        return uniqueElements;
    }

    // Método mejorado para añadir un conjunto
    addSet(name, inputElements) {
        if (!name || name.trim() === '') {
            throw new Error('El nombre del conjunto no puede estar vacío');
        }

        // Si inputElements es una string, analizarla como un conjunto completo
        if (typeof inputElements === 'string') {
            const processedSet = this._parseSetInput(inputElements);
            // Si parseSetInput devuelve un objeto con type='set', usamos sus elementos
            if (processedSet.type === 'set') {
                this.sets.set(name, this._getUniqueElements(processedSet.elements));
                this._clearCache();
                return;
            }
        }

        // Procesar cada elemento individualmente
        const processedElements = Array.isArray(inputElements)
            ? inputElements.map(element => this._parseSetInput(element))
            : [this._parseSetInput(inputElements)];

        // Asegurar elementos únicos
        this.sets.set(name, this._getUniqueElements(processedElements));
        this._clearCache();
    }

    addInfiniteSet(name, definition, membershipTest, samples = []) {
        if (!name || name.trim() === '') {
            throw new Error('El nombre del conjunto no puede estar vacío');
        }

        if (!definition || typeof definition !== 'string') {
            throw new Error('La definición del conjunto infinito debe ser una cadena de texto');
        }

        if (typeof membershipTest !== 'function') {
            throw new Error('La prueba de pertenencia debe ser una función');
        }

        // Determinar si el conjunto tiene elementos de muestra para visualización
        const hasSamples = Array.isArray(samples) && samples.length > 0;
        const sampleDisplay = hasSamples
            ? `{${samples.join(', ')}}`
            : definition;

        this.infiniteSets.set(name, {
            definition,
            membershipTest,
            samples: hasSamples ? samples : [],
            representation: definition,
            sampleDisplay
        });
        
        this._clearCache();
    }

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

    // Método mejorado para determinar si un elemento pertenece a un conjunto
    isMember(element, setName) {
        if (this.sets.has(setName)) {
            const setElements = this.sets.get(setName);
            const elementToCheck = this._parseSetInput(element);

            // Buscar el elemento en el conjunto
            return setElements.some(setElement => this._elementsEqual(setElement, elementToCheck));
        } else if (this.infiniteSets.has(setName)) {
            const set = this.infiniteSets.get(setName);
            return set.membershipTest(element);
        }

        throw new Error(`El conjunto '${setName}' no existe`);
    }

    // Operación de unión (optimizada para conjuntos anidados)
    union(set1, set2) {
        this._validateSetsExist(set1, set2);

        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('union', set1, set2);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('union', set1, set2);
            // Asegurar que el resultado tenga el formato correcto
            const normalizedResult = this._normalizeResult(result, 'union', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La unión de conjuntos infinitos se representa simbólicamente`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} ∪ ${set2} = ${normalizedResult.representation}`
                });
                return {result: normalizedResult, steps};
            }

            this.operationCache.set(this._getCacheKey('union', set1, set2), normalizedResult);
            return normalizedResult;
        }

        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Tomar todos los elementos del primer conjunto ${set1}`,
                detail: `Elementos iniciales: ${this._getSetRepresentation(set1)}`
            });

            // Identificar elementos únicos para mostrar en los pasos
            const uniqueInSecond = elements2.filter(element2 =>
                !elements1.some(element1 => this._elementsEqual(element1, element2))
            );

            steps.push({
                description: `Agregar elementos del segundo conjunto ${set2} que no estén en el primero`,
                detail: `Elementos a agregar: ${uniqueInSecond.length > 0 ? '{' + this._formatElementsArray(uniqueInSecond) + '}' : '∅'}`
            });
        }

        // Combinar elementos sin duplicados
        const result = [...elements1];
        for (const element2 of elements2) {
            if (!result.some(element1 => this._elementsEqual(element1, element2))) {
                result.push(element2);
            }
        }

        if (this.stepByStepMode) {
            steps.push({
                description: `Resultado final`,
                detail: `${set1} ∪ ${set2} = {${this._formatElementsArray(result)}}`
            });

            return {
                result,
                steps,
                type: 'finite',
                elements: result,
                representation: `{${this._formatElementsArray(result)}}`
            };
        }

        this.operationCache.set(this._getCacheKey('union', set1, set2), result);
        return result;
    }

    // Operación de intersección (optimizada para conjuntos anidados)
    intersection(set1, set2) {
        this._validateSetsExist(set1, set2);

        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('intersection', set1, set2);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('intersection', set1, set2);
            // Normalizar el resultado para asegurar consistencia
            const normalizedResult = this._normalizeResult(result, 'intersection', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La intersección de conjuntos infinitos requiere analizar cada caso particular`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} ∩ ${set2} = ${normalizedResult.representation}`
                });
                return {result: normalizedResult, steps};
            }

            this.operationCache.set(this._getCacheKey('intersection', set1, set2), normalizedResult);
            return normalizedResult;
        }

        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Examinar cada elemento del primer conjunto ${set1}`,
                detail: `Buscar cuáles elementos de ${set1} también están en ${set2}`
            });
        }

        // Encontrar elementos comunes
        const result = elements1.filter(element1 =>
            elements2.some(element2 => this._elementsEqual(element1, element2))
        );

        if (this.stepByStepMode) {
            const commonElements = result.length > 0 ? this._formatElementsArray(result) : '∅';
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
                representation: `{${this._formatElementsArray(result)}}`
            };
        }

        this.operationCache.set(this._getCacheKey('intersection', set1, set2), result);
        return result;
    }

    // Operación de diferencia (optimizada para conjuntos anidados)
    difference(set1, set2) {
        this._validateSetsExist(set1, set2);

        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('difference', set1, set2);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('difference', set1, set2);
            // Normalizar el resultado para asegurar consistencia
            const normalizedResult = this._normalizeResult(result, 'difference', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La diferencia entre conjuntos infinitos requiere un tratamiento especial`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} - ${set2} = ${normalizedResult.representation}`
                });
                return {result: normalizedResult, steps};
            }

            this.operationCache.set(this._getCacheKey('difference', set1, set2), normalizedResult);
            return normalizedResult;
        }

        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Examinar cada elemento del primer conjunto ${set1}`,
                detail: `Debemos identificar qué elementos de ${set1} NO están en ${set2}`
            });
        }

        // Elementos en set1 que no están en set2
        const result = elements1.filter(element1 =>
            !elements2.some(element2 => this._elementsEqual(element1, element2))
        );

        if (this.stepByStepMode) {
            // Elementos comunes (para mostrar en los pasos)
            const elementsInBoth = elements1.filter(element1 =>
                elements2.some(element2 => this._elementsEqual(element1, element2))
            );

            const commonStr = elementsInBoth.length > 0 ? this._formatElementsArray(elementsInBoth) : '∅';

            steps.push({
                description: `Identificar elementos comunes`,
                detail: `Elementos que aparecen en ambos conjuntos: {${commonStr}}`
            });

            const resultStr = result.length > 0 ? this._formatElementsArray(result) : '∅';

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
                representation: `{${this._formatElementsArray(result)}}`
            };
        }

        this.operationCache.set(this._getCacheKey('difference', set1, set2), result);
        return result;
    }

    // Operación de diferencia simétrica (optimizada para conjuntos anidados)
    symmetricDifference(set1, set2) {
        this._validateSetsExist(set1, set2);

        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Identificar los elementos de los conjuntos ${set1} y ${set2}`,
                detail: `Conjunto ${set1}: ${this._getSetRepresentation(set1)}\nConjunto ${set2}: ${this._getSetRepresentation(set2)}`
            });
        }

        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('symmetricDifference', set1, set2);
            // Normalizar el resultado para asegurar consistencia
            const normalizedResult = this._normalizeResult(result, 'symmetricDifference', set1, set2);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La diferencia simétrica entre conjuntos infinitos requiere un tratamiento especial`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set1} Δ ${set2} = ${normalizedResult.representation}`
                });
                return {result: normalizedResult, steps};
            }

            return normalizedResult;
        }

        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        if (this.stepByStepMode) {
            steps.push({
                description: `Calcular diferencias en ambas direcciones`,
                detail: `La diferencia simétrica es (${set1} - ${set2}) ∪ (${set2} - ${set1})`
            });
        }

        // Elementos en set1 pero no en set2
        const inSet1NotInSet2 = elements1.filter(element1 =>
            !elements2.some(element2 => this._elementsEqual(element1, element2))
        );

        // Elementos en set2 pero no en set1
        const inSet2NotInSet1 = elements2.filter(element2 =>
            !elements1.some(element1 => this._elementsEqual(element1, element2))
        );

        // Unir ambas diferencias
        const result = [...inSet1NotInSet2, ...inSet2NotInSet1];

        if (this.stepByStepMode) {
            const formattedInSet1NotInSet2 = this._formatElementsArray(inSet1NotInSet2);
            const formattedInSet2NotInSet1 = this._formatElementsArray(inSet2NotInSet1);
            const formattedResult = this._formatElementsArray(result);

            steps.push({
                description: `Elementos únicos en cada conjunto`,
                detail: `Elementos en ${set1} pero no en ${set2}: {${inSet1NotInSet2.length > 0 ? formattedInSet1NotInSet2 : '∅'}}\nElementos en ${set2} pero no en ${set1}: {${inSet2NotInSet1.length > 0 ? formattedInSet2NotInSet1 : '∅'}}`
            });

            steps.push({
                description: `Resultado final`,
                detail: `${set1} Δ ${set2} = {${result.length > 0 ? formattedResult : '∅'}}`
            });

            return {
                result,
                steps,
                type: 'finite',
                elements: result,
                representation: `{${formattedResult}}`
            };
        }

        return result;
    }

    // Verificar si un conjunto es subconjunto de otro (optimizado para conjuntos anidados)
    isSubset(subset, superset) {
        this._validateSetsExist(subset, superset);

        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Verificar si ${subset} es subconjunto de ${superset}`,
                detail: `Conjunto ${subset}: ${this._getSetRepresentation(subset)}\nConjunto ${superset}: ${this._getSetRepresentation(superset)}`
            });
        }

        if (this.infiniteSets.has(subset) || this.infiniteSets.has(superset)) {
            const result = this._handleInfiniteOperation('isSubset', subset, superset);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `La verificación de subconjunto con conjuntos infinitos requiere reglas especiales`
                });

                let conclusion;
                if (typeof result === 'boolean') {
                    conclusion = result ?
                        `${subset} es subconjunto de ${superset}` :
                        `${subset} NO es subconjunto de ${superset}`;
                } else if (result && result.evaluation) {
                    conclusion = result.evaluation === 'true' ?
                        `${subset} es subconjunto de ${superset}` :
                        result.evaluation === 'false' ?
                            `${subset} NO es subconjunto de ${superset}` :
                            `No se puede determinar si ${subset} es subconjunto de ${superset}`;
                } else {
                    conclusion = `No se puede determinar con certeza si ${subset} es subconjunto de ${superset}`;
                }

                steps.push({
                    description: `Resultado final`,
                    detail: conclusion
                });

                return {
                    result,
                    steps
                };
            }

            return result;
        }

        const subsetElements = this.sets.get(subset);
        const supersetElements = this.sets.get(superset);

        if (this.stepByStepMode) {
            steps.push({
                description: `Examinar cada elemento de ${subset}`,
                detail: `Verificar si todos los elementos de ${subset} están también en ${superset}`
            });
        }

        const isSubsetResult = subsetElements.every(subElement =>
            supersetElements.some(superElement => this._elementsEqual(subElement, superElement))
        );

        if (this.stepByStepMode) {
            const notInSuperset = isSubsetResult ? [] :
                subsetElements.filter(subElement =>
                    !supersetElements.some(superElement => this._elementsEqual(subElement, superElement))
                );

            const formattedNotInSuperset = this._formatElementsArray(notInSuperset);

            if (isSubsetResult) {
                steps.push({
                    description: `Todos los elementos de ${subset} están en ${superset}`,
                    detail: `Por lo tanto, ${subset} es subconjunto de ${superset}`
                });
            } else {
                steps.push({
                    description: `Elementos de ${subset} que no están en ${superset}`,
                    detail: `Estos elementos impiden que ${subset} sea subconjunto de ${superset}: {${formattedNotInSuperset}}`
                });
            }

            steps.push({
                description: `Resultado final`,
                detail: isSubsetResult ?
                    `${subset} ⊆ ${superset} (Verdadero)` :
                    `${subset} ⊈ ${superset} (Falso)`
            });

            return {
                result: isSubsetResult,
                steps,
                type: 'relation',
                representation: `${subset} ${isSubsetResult ? '⊆' : '⊈'} ${superset}`,
                evaluation: isSubsetResult ? 'true' : 'false'
            };
        }

        return isSubsetResult;
    }

    // Operación de complemento (optimizada para conjuntos anidados)
    complement(set, universe) {
        this._validateSetsExist(set, universe);

        if (!this.stepByStepMode) {
            const cacheKey = this._getCacheKey('complement', set, universe);
            if (this.operationCache.has(cacheKey)) {
                return this.operationCache.get(cacheKey);
            }
        }

        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Calcular el complemento de ${set} respecto a ${universe}`,
                detail: `Conjunto ${set}: ${this._getSetRepresentation(set)}\nUniverso ${universe}: ${this._getSetRepresentation(universe)}`
            });
        }

        if (this.infiniteSets.has(set) || this.infiniteSets.has(universe)) {
            const result = this._handleInfiniteOperation('complement', set, universe);
            // Normalizar el resultado para asegurar consistencia
            const normalizedResult = this._normalizeResult(result, 'complement', set, universe);

            if (this.stepByStepMode) {
                steps.push({
                    description: `Operación con conjuntos infinitos`,
                    detail: `El complemento con conjuntos infinitos requiere un tratamiento especial`
                });
                steps.push({
                    description: `Resultado final`,
                    detail: `${set}ᶜ (respecto a ${universe}) = ${normalizedResult.representation}`
                });
                return {result: normalizedResult, steps};
            }

            this.operationCache.set(cacheKey, normalizedResult);
            return normalizedResult;
        }

        const setElements = this.sets.get(set);
        const universeElements = this.sets.get(universe);

        if (this.stepByStepMode) {
            steps.push({
                description: `Examinar cada elemento del universo ${universe}`,
                detail: `Identificar qué elementos de ${universe} NO están en ${set}`
            });
        }

        const result = universeElements.filter(universeElement =>
            !setElements.some(setElement => this._elementsEqual(universeElement, setElement))
        );

        if (this.stepByStepMode) {
            const resultStr = result.length > 0 ? this._formatElementsArray(result) : '∅';

            steps.push({
                description: `Elementos del complemento`,
                detail: `Elementos que están en ${universe} pero no en ${set}: {${resultStr}}`
            });

            steps.push({
                description: `Resultado final`,
                detail: `${set}ᶜ (respecto a ${universe}) = {${resultStr}}`
            });

            return {
                result,
                steps,
                type: 'finite',
                elements: result,
                representation: `{${this._formatElementsArray(result)}}`
            };
        }

        this.operationCache.set(cacheKey, result);
        return result;
    }

    // Adaptador para convertir elementos estructurados a formatos simples para las pruebas de pertenencia
    _adaptElementForMembershipTest(element) {
        if (!element) return null;

        // Si ya es un objeto con nuestra estructura interna
        if (typeof element === 'object' && element.type) {
            if (element.type === 'primitive') {
                return element.value; // Extraer el valor primitivo
            } else if (element.type === 'setRef') {
                return element.reference; // Usar la referencia para comparar
            } else if (element.type === 'set') {
                // Para conjuntos anidados, podemos usar una representación simplificada
                return element.elements.map(e => this._adaptElementForMembershipTest(e));
            }
        }

        // Para elementos directos (strings, números, etc.)
        return element;
    }

    // Método para normalizar un resultado y asegurar que tenga la estructura correcta
    _normalizeResult(result, operation, set1, set2) {
        // Si el resultado ya tiene el formato correcto, lo devolvemos
        if (result && typeof result === 'object' && result.type) {
            return result;
        }

        // Si es un array, asumimos que son elementos de un conjunto finito
        if (Array.isArray(result)) {
            return {
                type: 'finite',
                elements: result,
                representation: `{${this._formatElementsArray(result)}}`,
            };
        }

        // Si es un booleano (como en isSubset)
        if (typeof result === 'boolean') {
            return {
                type: 'relation',
                representation: `${set1} ${result ? '⊆' : '⊈'} ${set2}`,
                evaluation: result ? 'true' : 'false'
            };
        }

        // Caso por defecto: resultado vacío
        return {
            type: 'finite',
            elements: [],
            representation: '∅'
        };
    }

    // Método para manejar operaciones con conjuntos infinitos
    _handleInfiniteOperation(operation, set1, set2) {
        const isSet1Infinite = this.infiniteSets.has(set1);
        const isSet2Infinite = this.infiniteSets.has(set2);

        // Obtener información de los conjuntos
        const set1Info = isSet1Infinite ? this.infiniteSets.get(set1) : null;
        const set2Info = isSet2Infinite ? this.infiniteSets.get(set2) : null;

        // Preparar definiciones y muestras para visualización
        const set1Def = isSet1Infinite
            ? set1Info.definition
            : `{${this._formatElementsArray(this.sets.get(set1))}}`;

        const set2Def = isSet2Infinite
            ? set2Info.definition
            : `{${this._formatElementsArray(this.sets.get(set2))}}`;

        // Obtener muestras para visualización
        const set1Samples = isSet1Infinite && set1Info.samples
            ? set1Info.samples
            : [];

        const set2Samples = isSet2Infinite && set2Info.samples
            ? set2Info.samples
            : [];

        let result;

        switch (operation) {
            case 'union':
                if (this._isUniversalSet(set1) || this._isUniversalSet(set2)) {
                    return {
                        type: 'infinite',
                        definition: 'U',
                        representation: 'U',
                        samples: ['todos los elementos']
                    };
                }

                if (!isSet1Infinite) {
                    // Conjunto finito unido con infinito
                    const elements1 = this.sets.get(set1);
                    // Combinar los elementos finitos con muestras del infinito
                    const combinedSamples = [...new Set([
                        ...elements1.map(el => this._formatSingleElement(el)),
                        ...set2Samples
                    ])];

                    return {
                        type: 'infinite',
                        definition: `${set1Def} ∪ ${set2Def}`,
                        representation: `${set1} ∪ ${set2}`,
                        samples: combinedSamples
                    };
                }

                if (!isSet2Infinite) {
                    // Infinito unido con finito
                    const elements2 = this.sets.get(set2);
                    // Combinar muestras del infinito con elementos finitos
                    const combinedSamples = [...new Set([
                        ...set1Samples,
                        ...elements2.map(el => this._formatSingleElement(el))
                    ])];

                    return {
                        type: 'infinite',
                        definition: `${set1Def} ∪ ${set2Def}`,
                        representation: `${set1} ∪ ${set2}`,
                        samples: combinedSamples
                    };
                }

                // Dos conjuntos infinitos
                return {
                    type: 'infinite',
                    definition: `${set1Def} ∪ ${set2Def}`,
                    representation: `${set1} ∪ ${set2}`,
                    samples: [...new Set([...set1Samples, ...set2Samples])]
                };

            case 'intersection':
                if (!isSet1Infinite) {
                    const elements1 = this.sets.get(set1);
                    const set2Test = set2Info.membershipTest;

                    // Usar el adaptador para compatibilidad
                    const resultElements = elements1.filter(el => {
                        try {
                            return set2Test(this._adaptElementForMembershipTest(el));
                        } catch (err) {
                            // Manejar errores en la función de prueba
                            console.warn(`Error en prueba de pertenencia: ${err.message}`);
                            return false;
                        }
                    });

                    // Asegurar que el formato es correcto
                    return {
                        type: 'finite',
                        elements: resultElements,
                        representation: `{${this._formatElementsArray(resultElements)}}`
                    };
                }
                
                if (!isSet2Infinite) {
                    const elements2 = this.sets.get(set2);
                    const set1Test = set1Info.membershipTest;

                    // Usar el adaptador para compatibilidad
                    const resultElements = elements2.filter(el => {
                        try {
                            return set1Test(this._adaptElementForMembershipTest(el));
                        } catch (err) {
                            console.warn(`Error en prueba de pertenencia: ${err.message}`);
                            return false;
                        }
                    });

                    // Asegurar formato correcto
                    return {
                        type: 'finite',
                        elements: resultElements,
                        representation: `{${this._formatElementsArray(resultElements)}}`
                    };
                }

                // Dos conjuntos infinitos - determinación especial por tipo
                const commonSamples = this._findCommonSamples(set1Samples, set2Samples);
                
                return {
                    type: 'infinite',
                    definition: `${set1Def} ∩ ${set2Def}`,
                    representation: `${set1} ∩ ${set2}`,
                    samples: commonSamples.length ? commonSamples : ['...']
                };

            case 'difference':
                if (!isSet1Infinite) {
                    const elements1 = this.sets.get(set1);
                    const set2Test = set2Info.membershipTest;

                    // Usar adaptador y manejar errores
                    const resultElements = elements1.filter(el => {
                        try {
                            return !set2Test(this._adaptElementForMembershipTest(el));
                        } catch (err) {
                            console.warn(`Error en prueba de pertenencia: ${err.message}`);
                            return true; // En caso de error, lo incluimos (enfoque conservador)
                        }
                    });

                    return {
                        type: 'finite',
                        elements: resultElements,
                        representation: `{${this._formatElementsArray(resultElements)}}`
                    };
                }

                // Conjunto infinito menos otro - muestras especiales
                const diffSamples = this._computeDifferenceSamples(set1Samples, set2Samples, isSet2Infinite);
                
                return {
                    type: 'infinite',
                    definition: `${set1Def} - ${set2Def}`,
                    representation: `${set1} - ${set2}`,
                    samples: diffSamples
                };

            case 'symmetricDifference':
                // Calcular muestras para diferencia simétrica
                const symDiffSamples = this._computeSymmetricDifferenceSamples(
                    set1, set2, set1Samples, set2Samples, isSet1Infinite, isSet2Infinite
                );
                
                return {
                    type: 'infinite',
                    definition: `(${set1Def} - ${set2Def}) ∪ (${set2Def} - ${set1Def})`,
                    representation: `${set1} Δ ${set2}`,
                    samples: symDiffSamples
                };

            case 'complement':
                if (this._isUniversalSet(set2)) {
                    // Complemento respecto al universo
                    const complementSamples = isSet1Infinite ? ['elementos fuera de ' + set1] :
                        this._computeComplementSamples(set1, set2Info, isSet1Infinite);
                        
                    return {
                        type: 'infinite',
                        definition: `${set2Def} - ${set1Def}`,
                        representation: `${set1}ᶜ`,
                        samples: complementSamples
                    };
                }

                if (!isSet1Infinite) {
                    // Complemento de un conjunto finito respecto a otro
                    const elements1 = this.sets.get(set1);
                    const elements2 = this.sets.get(set2);

                    if (!isSet2Infinite) {
                        // Ambos finitos, calcular normalmente
                        const resultElements = elements2.filter(el2 =>
                            !elements1.some(el1 => this._elementsEqual(el1, el2))
                        );

                        return {
                            type: 'finite',
                            elements: resultElements,
                            representation: `{${this._formatElementsArray(resultElements)}}`
                        };
                    } else {
                        // Conjunto finito respecto a infinito
                        const complementSamples = this._computeComplementSamples(set1, set2Info, isSet1Infinite);

                        return {
                            type: 'infinite',
                            definition: `${set2Def} - ${set1Def}`,
                            representation: `${set1}ᶜ en ${set2}`,
                            samples: complementSamples
                        };
                    }
                }

                // Complemento entre infinitos - usar muestras
                return {
                    type: 'infinite',
                    definition: `${set2Def} - ${set1Def}`,
                    representation: `${set2} - ${set1}`,
                    samples: this._computeDifferenceSamples(set2Samples, set1Samples, isSet1Infinite)
                };

            case 'isSubset':
                if (this._isUniversalSet(set2)) return true;
                if (this._isUniversalSet(set1) && !this._isUniversalSet(set2)) return false;

                if (!isSet1Infinite) {
                    const elements = this.sets.get(set1);
                    const superTest = set2Info.membershipTest;

                    try {
                        const isSubset = elements.every(el => superTest(this._adaptElementForMembershipTest(el)));

                        return {
                            type: 'relation',
                            representation: `${set1} ${isSubset ? '⊆' : '⊈'} ${set2}`,
                            evaluation: isSubset ? 'true' : 'false'
                        };
                    } catch (err) {
                        console.warn(`Error en prueba de subconjunto: ${err.message}`);
                        return {
                            type: 'relation',
                            representation: `${set1} ⊆ ${set2}`,
                            evaluation: 'indeterminate'
                        };
                    }
                }

                const relation = this._checkKnownSetRelation(set1, set2);
                if (relation !== null) {
                    return {
                        type: 'relation',
                        representation: `${set1} ${relation ? '⊆' : '⊈'} ${set2}`,
                        evaluation: relation ? 'true' : 'false'
                    };
                }

                return {
                    type: 'relation',
                    representation: `${set1} ⊆ ${set2}`,
                    evaluation: 'indeterminate'
                };

            default:
                throw new Error(`Operación '${operation}' no soportada para conjuntos infinitos`);
        }
    }

    // Método auxiliar para encontrar elementos comunes en las muestras
    _findCommonSamples(samples1, samples2) {
        const common = [];

        // Convertir a strings para comparación simple
        const set2Strings = new Set(samples2.map(String));

        for (const sample of samples1) {
            if (set2Strings.has(String(sample))) {
                common.push(sample);
            }
        }

        return common.length ? common : ['elementos comunes'];
    }

    // Método auxiliar para calcular muestras de diferencia
    _computeDifferenceSamples(samples1, samples2, isSet2Infinite) {
        if (!isSet2Infinite && samples2.length === 0) {
            return samples1; // Si el segundo conjunto está vacío, la diferencia es el primer conjunto
        }

        // Encontrar elementos que estén en samples1 pero no en samples2
        const diffSamples = [];
        const set2Strings = new Set(samples2.map(String));

        for (const sample of samples1) {
            if (!set2Strings.has(String(sample))) {
                diffSamples.push(sample);
            }
        }

        return diffSamples.length ? diffSamples : ['elementos no comunes'];
    }

    // Método auxiliar para calcular muestras de diferencia simétrica
    _computeSymmetricDifferenceSamples(set1, set2, samples1, samples2, isSet1Infinite, isSet2Infinite) {
        const diff1 = this._computeDifferenceSamples(samples1, samples2, isSet2Infinite);
        const diff2 = this._computeDifferenceSamples(samples2, samples1, isSet1Infinite);

        // Combinar ambas diferencias sin duplicados
        const combined = [...new Set([...diff1, ...diff2])];

        return combined.length ? combined : ['elementos exclusivos de cada conjunto'];
    }

    // Método auxiliar para calcular muestras del complemento
    _computeComplementSamples(set, universeInfo, isSetInfinite) {
        if (isSetInfinite) {
            // Para un conjunto infinito, usar una descripción
            return ['elementos fuera de ' + set];
        }

        // Para un conjunto finito, si tenemos muestras del universo, calcular diferencia
        if (universeInfo && universeInfo.samples && universeInfo.samples.length) {
            return this._computeDifferenceSamples(universeInfo.samples,
                this.sets.get(set).map(el => this._formatSingleElement(el)), false);
        }

        return ['elementos del complemento'];
    }

    _isUniversalSet(setName) {
        if (!this.infiniteSets.has(setName)) return false;
        const def = this.infiniteSets.get(setName).definition;
        return def === 'U' || def === 'Universal';
    }

    _checkKnownSetRelation(set1, set2) {
        if (!this.infiniteSets.has(set1) || !this.infiniteSets.has(set2)) return null;

        const def1 = this.infiniteSets.get(set1).definition;
        const def2 = this.infiniteSets.get(set2).definition;

        const hierarchy = ['N', 'Z', 'Q', 'R', 'C', 'U'];
        const index1 = hierarchy.indexOf(def1);
        const index2 = hierarchy.indexOf(def2);

        if (index1 >= 0 && index2 >= 0) {
            return index1 <= index2;
        }

        return null;
    }

    // Método para evaluar expresiones de conjuntos
    evaluateExpression(expression) {
        const steps = [];
        if (this.stepByStepMode) {
            steps.push({
                description: `Tokenizar la expresión`,
                detail: `Expresión original: ${expression}\nIdentificamos cada símbolo como un token individual.`
            });
        }

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

        const result = this._parseAndEvaluate(tokens, steps);

        if (this.stepByStepMode) {
            return {
                result,
                steps
            };
        }

        return result;
    }

    _tokenizeExpression(expression) {
        let processedExpr = expression;

        // Eliminar llaves externas y preparar el complemento
        processedExpr = processedExpr.replace(/[{}]/g, ' ');
        processedExpr = processedExpr.replace(/\(([A-Z])\)ᶜ/g, '($1) ᶜ');

        // Separar todos los tokens con espacios
        processedExpr = processedExpr
            .replace(/([A-Z])/g, ' $1 ')
            .replace(/([∪∩\-Δ⊆ᶜ(){}|])/g, ' $1 ');

        // Dividir por espacios y filtrar espacios vacíos
        const tokens = processedExpr.split(/\s+/).filter(token => token.trim() !== '');

        return tokens;
    }

    _parseAndEvaluate(tokens, steps = []) {
        try {
            if (!tokens || tokens.length === 0) {
                if (this.stepByStepMode && steps) {
                    steps.push({
                        description: `Expresión procesada como vacía`,
                        detail: `La expresión no contiene operadores o conjuntos válidos para procesar.`
                    });
                }

                return {
                    type: 'finite',
                    elements: [],
                    representation: `{}`
                };
            }

            // Verificar conjuntos no definidos y crearlos vacíos solo en modo educativo
            const setNames = [...this.sets.keys(), ...this.infiniteSets.keys()];
            const unknownSets = tokens.filter(t =>
                /^[A-Z]$/.test(t) && !setNames.includes(t));

            if (unknownSets.length > 0) {
                if (this.stepByStepMode && steps) {
                    steps.push({
                        description: `Conjuntos no definidos detectados`,
                        detail: `Los siguientes conjuntos no están definidos: ${unknownSets.join(', ')}\nSe necesita definir estos conjuntos antes de usarlos en una expresión.`
                    });

                    for (const setName of unknownSets) {
                        this.addSet(setName, []);

                        steps.push({
                            description: `Definición automática de conjunto`,
                            detail: `Se ha creado automáticamente el conjunto ${setName} = {} (vacío) para continuar con la evaluación.`
                        });
                    }
                } else {
                    throw new Error(`Conjuntos no definidos: ${unknownSets.join(', ')}`);
                }
            }

            // Convertir a notación postfija
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

            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Error en la evaluación`,
                    detail: `Se produjo un error: ${error.message}`
                });
            }

            if (!this.stepByStepMode) {
                throw error;
            } else {
                return {
                    type: 'finite',
                    elements: [],
                    representation: `{}`,
                    error: error.message
                };
            }
        }
    }

    _convertToPostfix(tokens) {
        try {
            // Verificar si hay al menos un operando
            let hasOperand = false;
            for (const token of tokens) {
                if (/^[A-Z]$/.test(token)) {
                    hasOperand = true;
                    break;
                }
            }

            if (!hasOperand && this.stepByStepMode) {
                return [];
            }

            const output = [];
            const operatorStack = [];

            // Precedencia de operadores
            const precedence = {
                '⊆': 1,  // Subconjunto (menor precedencia)
                '∪': 2,  // Unión
                'Δ': 2,  // Diferencia simétrica
                '∩': 3,  // Intersección
                '-': 3,  // Diferencia
                'ᶜ': 4   // Complemento (mayor precedencia)
            };

            // Algoritmo Shunting Yard
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                // Si es un conjunto (operando)
                if (/^[A-Z]$/.test(token)) {
                    output.push(token);

                    // Comprobar si va seguido de un complemento
                    if (i + 1 < tokens.length && tokens[i + 1] === 'ᶜ') {
                        output.push(tokens[i + 1]);
                        i++;
                    }
                }
                // Si es un paréntesis izquierdo
                else if (token === '(') {
                    operatorStack.push(token);
                }
                // Si es un paréntesis derecho
                else if (token === ')') {
                    // Desapilar operadores hasta encontrar el paréntesis izquierdo
                    while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                        output.push(operatorStack.pop());
                    }

                    // Quitar el paréntesis izquierdo
                    if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                        operatorStack.pop();
                    } else {
                        throw new Error('Paréntesis desbalanceados en la expresión');
                    }

                    // Comprobar si va seguido de un complemento
                    if (i + 1 < tokens.length && tokens[i + 1] === 'ᶜ') {
                        output.push(tokens[i + 1]);
                        i++;
                    }
                }
                // Si es un operador
                else if (precedence[token] !== undefined) {
                    if (token === 'ᶜ') {
                        // El complemento es un operador unario y va inmediatamente después del operando
                        output.push(token);
                    } else {
                        // Para operadores binarios, aplicar las reglas de precedencia
                        while (
                            operatorStack.length > 0 &&
                            operatorStack[operatorStack.length - 1] !== '(' &&
                            precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
                            ) {
                            output.push(operatorStack.pop());
                        }

                        operatorStack.push(token);
                    }
                }
                else {
                    // Token no reconocido
                    console.warn(`Token no reconocido y será ignorado: ${token}`);
                }
            }

            // Desapilar los operadores restantes
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
            // Devolver un token de conjunto por defecto para evitar errores críticos
            return ['A'];
        }
    }

    _evaluatePostfix(tokens, steps = []) {
        try {
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

            // Procesar cada token
            for (const token of tokens) {
                // Si es un conjunto
                if (/^[A-Z]$/.test(token)) {
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

                    // Buscar un conjunto universal para el complemento
                    const allSets = [...this.sets.keys(), ...this.infiniteSets.keys()];

                    if (allSets.includes('U')) {
                        universe = 'U';
                    }
                    else {
                        // Crear un universo ad-hoc si no existe uno definido
                        const nonTempSets = allSets.filter(name =>
                            !name.startsWith('_temp') && name !== set);

                        if (nonTempSets.length > 0) {
                            if (!this.sets.has('U') && !this.infiniteSets.has('U')) {
                                try {
                                    // Usar el primer conjunto disponible o crear uno combinando todos
                                    if (nonTempSets.length === 1) {
                                        universe = nonTempSets[0];
                                    } else {
                                        // Crear un universo combinando todos los conjuntos disponibles
                                        const unionElements = [];

                                        for (const setName of nonTempSets) {
                                            if (this.sets.has(setName)) {
                                                const elements = this.sets.get(setName);
                                                for (const elem of elements) {
                                                    if (!unionElements.some(e => this._elementsEqual(e, elem))) {
                                                        unionElements.push(elem);
                                                    }
                                                }
                                            }
                                        }

                                        if (unionElements.length > 0) {
                                            this.addSet('U', unionElements);
                                            universe = 'U';

                                            if (this.stepByStepMode && steps) {
                                                steps.push({
                                                    description: `Creación del universo U`,
                                                    detail: `Se ha creado automáticamente el universo U = {${this._formatElementsArray(unionElements)}} como la unión de todos los conjuntos existentes.`
                                                });
                                            }
                                        } else {
                                            universe = nonTempSets[nonTempSets.length - 1];
                                        }
                                    }
                                } catch (err) {
                                    universe = nonTempSets[nonTempSets.length - 1];
                                }
                            } else {
                                universe = 'U';
                            }
                        } else if (allSets.length > 0) {
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
                    const tempSetName = `_temp${tempSetCounter++}`;
                    this._storeResultAsSet(tempSetName, result);

                    let resultRepresentation;
                    if (Array.isArray(result)) {
                        resultRepresentation = `{${this._formatElementsArray(result)}}`;
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

                    // Ejecutar la operación correspondiente
                    let result;
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

                    // Formatear el resultado para mostrarlo en los pasos
                    let resultRepresentation;
                    if (Array.isArray(result)) {
                        resultRepresentation = `{${this._formatElementsArray(result)}}`;
                    } else if (result && result.representation) {
                        resultRepresentation = result.representation;
                    } else if (result && result.result && result.result.elements) {
                        resultRepresentation = `{${this._formatElementsArray(result.result.elements)}}`;
                    } else if (result && result.result && Array.isArray(result.result)) {
                        resultRepresentation = `{${this._formatElementsArray(result.result)}}`;
                    } else {
                        resultRepresentation = "Resultado de la operación";
                    }

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Resultado de la ${operationDescription}`,
                            detail: `${set1} ${token} ${set2} = ${resultRepresentation}`
                        });
                    }

                    // Almacenar el resultado como conjunto temporal
                    const tempSetName = `_temp${tempSetCounter++}`;
                    this._storeResultAsSet(tempSetName, result);
                    stack.push(tempSetName);

                    if (this.stepByStepMode && steps) {
                        steps.push({
                            description: `Estado actual de la pila`,
                            detail: `Pila: [${stack.join(', ')}]`
                        });
                    }
                }
            }

            // Al final debe quedar exactamente un resultado en la pila
            if (stack.length !== 1) {
                if (this.stepByStepMode && steps) {
                    steps.push({
                        description: `Problema detectado en la evaluación`,
                        detail: `La evaluación de la expresión resultó en ${stack.length} valores en lugar de uno solo.\nEsto puede deberse a operadores faltantes o sobrantes en la expresión.`
                    });

                    // Intentar recuperarse combinando los resultados si hay más de uno
                    if (stack.length > 1) {
                        steps.push({
                            description: `Recuperación: combinando resultados`,
                            detail: `Se combinarán los ${stack.length} conjuntos con la operación de unión para obtener un resultado final.`
                        });

                        while (stack.length > 1) {
                            const set2 = stack.pop();
                            const set1 = stack.pop();

                            let result;
                            try {
                                result = this.union(set1, set2);
                            } catch (error) {
                                const tempSetName = `_temp_recovery${tempSetCounter++}`;
                                this.addSet(tempSetName, []);
                                result = tempSetName;

                                steps.push({
                                    description: `Error en la combinación`,
                                    detail: `No se pudieron combinar ${set1} y ${set2}. Se usará un conjunto vacío.`
                                });
                            }

                            const tempSetName = `_temp${tempSetCounter++}`;
                            this._storeResultAsSet(tempSetName, result);
                            stack.push(tempSetName);

                            steps.push({
                                description: `Combinación de conjuntos`,
                                detail: `${set1} ∪ ${set2} = ${tempSetName}`
                            });
                        }
                    } else if (stack.length === 0) {
                        // Si no queda nada en la pila, devolver un conjunto vacío
                        const tempSetName = `_temp_empty${tempSetCounter++}`;
                        this.addSet(tempSetName, []);
                        stack.push(tempSetName);

                        steps.push({
                            description: `Pila vacía`,
                            detail: `No hay resultados en la pila. Se usará un conjunto vacío como resultado.`
                        });
                    }
                } else {
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

            // Formatear el resultado según su tipo
            if (finalSetName.startsWith('_temp')) {
                if (this.sets.has(finalSetName)) {
                    const elements = this.sets.get(finalSetName);
                    const formattedElements = this._formatElementsArray(elements);
                    finalResult = {
                        type: 'finite',
                        elements,
                        representation: `{${formattedElements}}`
                    };
                } else {
                    finalResult = {
                        type: 'unknown',
                        representation: 'Resultado desconocido'
                    };
                }
            }
            else {
                if (this.sets.has(finalSetName)) {
                    const elements = this.sets.get(finalSetName);
                    const formattedElements = this._formatElementsArray(elements);
                    finalResult = {
                        type: 'finite',
                        elements,
                        representation: `{${formattedElements}}`
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

            // Limpieza de conjuntos temporales
            this._cleanupTempSets();

            return finalResult;

        } catch (error) {
            console.error('Error en evaluación postfija:', error);

            if (this.stepByStepMode && steps) {
                steps.push({
                    description: `Error en la evaluación`,
                    detail: `Se produjo un error: ${error.message}\nSe devolverá un conjunto vacío como resultado.`
                });
            }

            return {
                type: 'finite',
                elements: [],
                representation: `{}`,
                error: error.message
            };
        }
    }

    // Método auxiliar para almacenar un resultado como conjunto temporal
    _storeResultAsSet(setName, result) {
        if (!setName || typeof setName !== 'string') {
            console.error('Nombre de conjunto inválido:', setName);
            return;
        }

        try {
            if (Array.isArray(result)) {
                this.addSet(setName, result);
                return;
            }

            if (result && typeof result === 'object') {
                if (result.type === 'finite' && Array.isArray(result.elements)) {
                    this.addSet(setName, result.elements);
                    return;
                }

                if (result.result) {
                    if (Array.isArray(result.result)) {
                        this.addSet(setName, result.result);
                        return;
                    } else if (result.result.elements && Array.isArray(result.result.elements)) {
                        this.addSet(setName, result.result.elements);
                        return;
                    }
                }

                if (result.elements && Array.isArray(result.elements)) {
                    this.addSet(setName, result.elements);
                    return;
                }

                if (result.type === 'infinite' || (result.result && result.result.type === 'infinite')) {
                    this.addSet(setName, []);
                    return;
                }
            }

            // Si no se pudo procesar, crear un conjunto vacío
            this.addSet(setName, []);

        } catch (error) {
            console.error('Error al almacenar resultado como conjunto:', error);
            try {
                this.addSet(setName, []);
            } catch (innerError) {
                console.error('Error crítico al crear conjunto vacío:', innerError);
            }
        }
    }

    // Método para eliminar conjuntos temporales
    _cleanupTempSets() {
        for (const setName of this.sets.keys()) {
            if (setName.startsWith('_temp')) {
                this.sets.delete(setName);
            }
        }
    }

    // Método para obtener todos los conjuntos definidos
    getAllSets() {
        const allSets = {};

        // Procesar conjuntos finitos
        for (const [name, elements] of this.sets.entries()) {
            if (!name.startsWith('_temp')) {
                allSets[name] = {
                    type: 'finite',
                    elements,
                    representation: `{${this._formatElementsArray(elements)}}`
                };
            }
        }

        // Procesar conjuntos infinitos con sus muestras
        for (const [name, info] of this.infiniteSets.entries()) {
            allSets[name] = {
                type: 'infinite',
                definition: info.definition,
                representation: info.definition,
                // Pasar las muestras si existen
                samples: info.samples && Array.isArray(info.samples) ? info.samples : [],
                // Usar sampleDisplay si está definido
                sampleDisplay: info.sampleDisplay || info.definition
            };
        }

        return allSets;
    }
}

export {SetTheory};