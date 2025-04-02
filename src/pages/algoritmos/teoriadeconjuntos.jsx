import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import styles from '@/styles/SetTheory.module.css';
import GlobalStyles from '@/styles/globals.module.css';
import {SetTheory} from '@/logic/SetTheory';
import SetCard from '@/components/SetCard';
import {FaChevronDown, FaChevronUp, FaLightbulb} from 'react-icons/fa';

export default function SetTheoryPage() {
    // Estado para almacenar la instancia de SetTheory
    const [setTheory, setSetTheory] = useState(null);
    // Estado para almacenar los conjuntos
    const [sets, setSets] = useState({});
    // Estados para el formulario de nuevo conjunto
    const [newSetName, setNewSetName] = useState('');
    const [newSetElements, setNewSetElements] = useState('');
    const [error, setError] = useState('');
    // Estados para las operaciones
    const [operation, setOperation] = useState('union');
    const [set1, setSet1] = useState('');
    const [set2, setSet2] = useState('');
    const [result, setResult] = useState(null);
    // Estados para paso a paso
    const [stepByStepMode, setStepByStepMode] = useState(true);
    const [steps, setSteps] = useState([]);
    const [showSteps, setShowSteps] = useState(false);

    // Inicializar la instancia de SetTheory
    useEffect(() => {
        const theory = new SetTheory();
        // Activamos el modo paso a paso
        theory.setStepByStepMode(stepByStepMode);
        // Inicializamos una instancia sin ningún conjunto predefinido
        setSetTheory(theory);
        setSets(theory.getAllSets());
    }, [stepByStepMode]);

    // Manejar la creación de un nuevo conjunto
    const handleAddSet = (e) => {
        e.preventDefault();
        setError('');

        if (!newSetName.trim()) {
            setError('El nombre del conjunto es obligatorio');
            return;
        }

        try {
            // Parsear los elementos del conjunto
            const elements = newSetElements.split(',')
                .map(elem => elem.trim())
                .filter(elem => elem !== '');

            setTheory.addSet(newSetName, elements);
            setSets(setTheory.getAllSets());

            // Limpiar el formulario
            setNewSetName('');
            setNewSetElements('');
        } catch (err) {
            setError(err.message);
        }
    };

    // Manejar la eliminación de un conjunto
    const handleRemoveSet = (setName) => {
        try {
            // No permitir eliminar conjuntos predefinidos
            if (['N', 'Z', 'Q', 'R', 'C', 'U'].includes(setName)) {
                setError(`No se puede eliminar el conjunto predefinido ${setName}`);
                return;
            }

            setTheory.removeSet(setName);
            setSets(setTheory.getAllSets());

            // Si el conjunto eliminado estaba seleccionado en una operación, resetear
            if (set1 === setName) setSet1('');
            if (set2 === setName) setSet2('');

            setResult(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Memoizar el resultado de operaciones
    const memoizedOperations = React.useMemo(() => {
        if (!setTheory || !set1 || !set2) return null;

        try {
            // Resultado de todas las operaciones posibles
            const results = {};

            // Calcular unión
            results.union = setTheory.union(set1, set2);

            // Calcular intersección
            results.intersection = setTheory.intersection(set1, set2);

            // Calcular diferencia
            results.difference = setTheory.difference(set1, set2);

            // Calcular diferencia simétrica
            results.symmetricDifference = setTheory.symmetricDifference(set1, set2);

            // Verificar si es subconjunto
            results.isSubset = setTheory.isSubset(set1, set2);

            // Calcular complemento (nueva operación)
            results.complement = setTheory.complement(set1, set2);

            return results;
        } catch (err) {
            // No manejar el error aquí, dejarlo para handleOperation
            return null;
        }
    }, [setTheory, set1, set2]);

    // Manejar la ejecución de operaciones entre conjuntos
    const handleOperation = (e) => {
        e.preventDefault();
        setError('');

        if (!set1 || !set2) {
            setError('Seleccione dos conjuntos para la operación');
            return;
        }

        try {
            let operationResult, stepsData = [];

            // Calcular el resultado bajo demanda
            switch (operation) {
                case 'union':
                    operationResult = setTheory.union(set1, set2);
                    break;
                case 'intersection':
                    operationResult = setTheory.intersection(set1, set2);
                    break;
                case 'difference':
                    operationResult = setTheory.difference(set1, set2);
                    break;
                case 'symmetricDifference':
                    operationResult = setTheory.symmetricDifference(set1, set2);
                    break;
                case 'isSubset':
                    operationResult = setTheory.isSubset(set1, set2);
                    break;
                case 'complement':
                    operationResult = setTheory.complement(set1, set2);
                    break;
                default:
                    throw new Error('Operación no válida');
            }

            // Procesar resultado según si estamos en modo paso a paso
            if (stepByStepMode && operationResult && operationResult.steps) {
                stepsData = operationResult.steps;
                operationResult = operationResult.result || operationResult;
                setSteps(stepsData);
                setShowSteps(true);
            } else {
                setSteps([]);
                setShowSteps(false);
            }

            // Formatear el resultado
            if (Array.isArray(operationResult)) {
                setResult({
                    type: 'finite',
                    elements: operationResult,
                    representation: `{${operationResult.join(', ')}}`
                });
            } else if (typeof operationResult === 'boolean') {
                setResult({
                    type: 'relation',
                    representation: `${set1} ${operationResult ? '⊆' : '⊈'} ${set2}`,
                    evaluation: operationResult ? 'true' : 'false'
                });
            } else {
                setResult(operationResult);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Renderizar etiquetas para la operación seleccionada
    const getOperationSymbol = () => {
        switch (operation) {
            case 'union':
                return '∪';
            case 'intersection':
                return '∩';
            case 'difference':
                return '-';
            case 'symmetricDifference':
                return 'Δ';
            case 'isSubset':
                return '⊆';
            case 'complement':
                return 'ᶜ';
            default:
                return '';
        }
    };

    // Componente para mostrar diagrama de Venn según la operación
    const VennDiagram = ({operation}) => {
        return (
            <div
                className={`${styles.vennContainer} ${styles[`vennCircle${operation.charAt(0).toUpperCase() + operation.slice(1)}`]}`}>
                <div className={`${styles.vennCircle} ${styles.vennCircleA}`}></div>
                <div className={`${styles.vennCircle} ${styles.vennCircleB}`}></div>
                <div className={`${styles.vennLabel} ${styles.vennLabelA}`}>A</div>
                <div className={`${styles.vennLabel} ${styles.vennLabelB}`}>B</div>
            </div>
        );
    };

    // Descripción de la operación
    const getOperationDescription = () => {
        switch (operation) {
            case 'union':
                return 'La unión de dos conjuntos A y B es el conjunto que contiene todos los elementos de A y B.';
            case 'intersection':
                return 'La intersección de dos conjuntos A y B es el conjunto que contiene los elementos comunes a A y B.';
            case 'difference':
                return 'La diferencia de dos conjuntos A y B (A - B) es el conjunto de elementos que están en A pero no en B.';
            case 'symmetricDifference':
                return 'La diferencia simétrica de A y B es el conjunto de elementos que están en A o en B, pero no en ambos.';
            case 'isSubset':
                return 'Un conjunto A es subconjunto de B si todos los elementos de A están también en B.';
            case 'complement':
                return 'El complemento de A respecto a B es el conjunto de elementos que están en B pero no en A.';
            default:
                return '';
        }
    };

    return (
        <div className={GlobalStyles.mainContainer}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                width: '100%'
            }}>
                <Link style={{marginTop: '2%', marginLeft: '2.5%'}} href={'/'}>Inicio</Link>
            </div>

            <h1 className={`${GlobalStyles.multicolor}`} style={{fontSize: '3rem', marginBottom: '20px'}}>
                TEORÍA DE CONJUNTOS
            </h1>

            <div className={styles.container}>
                {/* Formulario para agregar nuevo conjunto */}
                <div className={styles.controls}>
                    <form onSubmit={handleAddSet} className={styles.operationForm}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="setName">Nombre del conjunto</label>
                            <input
                                id="setName"
                                type="text"
                                className={styles.input}
                                value={newSetName}
                                onChange={(e) => setNewSetName(e.target.value)}
                                placeholder="Ej: D"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="setElements">Elementos (separados por coma)</label>
                            <input
                                id="setElements"
                                type="text"
                                className={styles.input}
                                value={newSetElements}
                                onChange={(e) => setNewSetElements(e.target.value)}
                                placeholder="Ej: 1, 2, 3, 4"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`${styles.actionButton} ${styles.primary}`}
                            style={{alignSelf: 'flex-end'}}
                        >
                            Agregar conjunto
                        </button>
                    </form>
                </div>

                {/* Mensaje de error */}
                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* Mensaje de bienvenida con tutorial básico */}
                <div className={styles.welcomeMessage}>
                    <h2 className={styles.welcomeTitle}>¡Bienvenido al Laboratorio de Teoría de Conjuntos!</h2>
                    <p className={styles.welcomeText}>
                        Esta herramienta te permite trabajar con conjuntos matemáticos y realizar
                        operaciones entre ellos. Para comenzar, crea tus propios conjuntos utilizando
                        el formulario de arriba.
                    </p>
                    <p className={styles.welcomeText}>
                        Ejemplos de conjuntos que puedes crear:
                    </p>
                    <div className={styles.exampleContainer}>
                        <div className={styles.exampleBox}>
                            <h3 className={styles.exampleTitle}>Conjunto de números pares</h3>
                            <p>Nombre: <strong>Pares</strong></p>
                            <p>Elementos: <strong>2, 4, 6, 8, 10</strong></p>
                        </div>
                        <div className={styles.exampleBox}>
                            <h3 className={styles.exampleTitle}>Conjunto de vocales</h3>
                            <p>Nombre: <strong>Vocales</strong></p>
                            <p>Elementos: <strong>a, e, i, o, u</strong></p>
                        </div>
                    </div>
                </div>

                {/* Mostrar conjuntos existentes */}
                <h2 className={styles.sectionTitle}>Conjuntos definidos</h2>

                {Object.keys(sets).length === 0 ? (
                    <div className={styles.emptySetPlaceholder}>
                        No hay conjuntos definidos. Crea un nuevo conjunto utilizando el formulario.
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {Object.entries(sets).map(([name, data]) => (
                            <SetCard
                                key={name}
                                name={name}
                                setData={data}
                                onRemove={handleRemoveSet}
                                onDragStart={() => {
                                }} // Habilitamos el arrastrar para usarlo en las operaciones
                            />
                        ))}
                    </div>
                )}

                {/* Operaciones entre conjuntos */}
                <div className={styles.operationsContainer}>
                    <h2 className={styles.sectionTitle}>Operaciones con Conjuntos</h2>

                    <form onSubmit={handleOperation} className={styles.operationForm}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="set1">Primer conjunto (A)</label>
                            <select
                                id="set1"
                                className={styles.select}
                                value={set1}
                                onChange={(e) => setSet1(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {Object.keys(sets).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup} style={{maxWidth: 'fit-content', alignSelf: 'flex-end'}}>
                            <label>Operación</label>
                            <select
                                className={styles.select}
                                value={operation}
                                onChange={(e) => setOperation(e.target.value)}
                            >
                                <option value="union">Unión (∪)</option>
                                <option value="intersection">Intersección (∩)</option>
                                <option value="difference">Diferencia (-)</option>
                                <option value="symmetricDifference">Diferencia simétrica (Δ)</option>
                                <option value="isSubset">Es subconjunto (⊆)</option>
                                <option value="complement">Complemento (ᶜ)</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="set2">Segundo conjunto (B)</label>
                            <select
                                id="set2"
                                className={styles.select}
                                value={set2}
                                onChange={(e) => setSet2(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {Object.keys(sets).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.actionButton} ${styles.primary}`}
                            style={{alignSelf: 'flex-end'}}
                        >
                            Calcular
                        </button>
                    </form>

                    {/* Descripción de la operación */}
                    <div className={styles.operationDescription}>
                        <p className={styles.descriptionText}>{getOperationDescription()}</p>
                        <VennDiagram operation={operation}/>
                    </div>

                    {/* Mostrar resultado */}
                    {result && (
                        <div className={styles.resultCard}>
                            <h3 className={styles.resultTitle}>
                                {operation === 'complement'
                                    ? `Resultado: ${set1}${getOperationSymbol()} respecto a ${set2}`
                                    : `Resultado: ${set1} ${getOperationSymbol()} ${set2}`
                                }
                            </h3>

                            <SetCard
                                name="Resultado"
                                setData={result}
                            />

                            {/* Mostrar pasos de la operación */}
                            {steps.length > 0 && (
                                <div className={styles.stepsContainer}>
                                    <button
                                        className={styles.stepsToggle}
                                        onClick={() => setShowSteps(!showSteps)}
                                    >
                                        <FaLightbulb/>
                                        {showSteps ? 'Ocultar pasos' : 'Mostrar pasos de solución'}
                                        {showSteps ? <FaChevronUp/> : <FaChevronDown/>}
                                    </button>

                                    {showSteps && (
                                        <div className={styles.stepsContent}>
                                            {steps.map((step, index) => (
                                                <div key={index} className={styles.stepItem}>
                                                    <div className={styles.stepTitle}>
                                                        <span className={styles.stepNumber}>{index + 1}</span>
                                                        {step.description}
                                                    </div>
                                                    <div className={styles.stepDetail}>
                                                        {step.detail}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Opción para activar/desactivar el modo paso a paso */}
                    <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'center'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <input
                                type="checkbox"
                                checked={stepByStepMode}
                                onChange={(e) => setStepByStepMode(e.target.checked)}
                            />
                            Mostrar los pasos de las operaciones
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}