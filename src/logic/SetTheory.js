class SetTheory {
    constructor() {
        this.sets = new Map();
        this.infiniteSets = new Map();
        // Caché para operaciones frecuentes
        this.operationCache = new Map();
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
     * @returns {Array|Object} - Resultado de la unión
     */
    union(set1, set2) {
        // Validación de existencia de conjuntos
        this._validateSetsExist(set1, set2);

        // Verificar caché
        const cacheKey = this._getCacheKey('union', set1, set2);
        if (this.operationCache.has(cacheKey)) {
            return this.operationCache.get(cacheKey);
        }

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            const result = this._handleInfiniteOperation('union', set1, set2);
            this.operationCache.set(cacheKey, result);
            return result;
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        // Usar un Set para eliminar duplicados de forma eficiente
        const unionSet = new Set(elements1);
        elements2.forEach(element => unionSet.add(element));

        const result = Array.from(unionSet);
        this.operationCache.set(cacheKey, result);
        return result;
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

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            return this._handleInfiniteOperation('intersection', set1, set2);
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        // Optimización: usar un Set para búsqueda O(1) en lugar de includes O(n)
        const set2Elements = new Set(elements2);
        return elements1.filter(element => set2Elements.has(element));
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

        // Casos especiales con conjuntos infinitos
        if (this.infiniteSets.has(set1) || this.infiniteSets.has(set2)) {
            return this._handleInfiniteOperation('difference', set1, set2);
        }

        // Caso de conjuntos finitos - implementación optimizada
        const elements1 = this.sets.get(set1);
        const elements2 = this.sets.get(set2);

        // Optimización: usar un Set para búsqueda O(1)
        const set2Elements = new Set(elements2);
        return elements1.filter(element => !set2Elements.has(element));
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
                if (this._isUniversalSet(superset)) return true;
                if (this._isUniversalSet(subset) && !this._isUniversalSet(superset)) return false;

                // Si subset es finito, podemos verificar cada elemento
                if (!isSet1Infinite) {
                    const elements = this.sets.get(subset);
                    const superTest = this.infiniteSets.get(superset).membershipTest;
                    return elements.every(el => superTest(el));
                }

                // Relación conocida (por ejemplo, N ⊂ Z ⊂ Q ⊂ R)
                const relation = this._checkKnownSetRelation(subset, superset);
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
     * Obtiene todos los conjuntos definidos
     * @returns {Object} - Objeto con todos los conjuntos
     */
    getAllSets() {
        const allSets = {};

        // Añadir conjuntos finitos
        for (const [name, elements] of this.sets.entries()) {
            allSets[name] = {
                type: 'finite',
                elements,
                representation: `{${elements.join(', ')}}`
            };
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