import {useState} from 'react';
import Link from 'next/link';
import GlobalStyles from '@/styles/globals.module.css';
import styles from '@/styles/Succession.module.css';
import {SuccessionLogic} from '@/logic/SuccessionLogic';

export default function SuccessionPage() {
    // State for formula and limits
    const [formula, setFormula] = useState('k^2');
    const [lowerLimit, setLowerLimit] = useState(1);
    const [upperLimit, setUpperLimit] = useState(5);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);

    // Calculate the succession on form submit
    const handleCalculate = (e) => {
        e.preventDefault();
        setError('');
        setIsCalculating(true);

        try {
            // Validate inputs
            if (!formula.trim()) {
                setError('La fórmula no puede estar vacía');
                setIsCalculating(false);
                return;
            }

            // Validate parentheses are balanced
            const openParens = (formula.match(/\(/g) || []).length;
            const closeParens = (formula.match(/\)/g) || []).length;

            if (openParens !== closeParens) {
                setError(`Paréntesis desbalanceados: ${openParens} abiertos vs ${closeParens} cerrados. Por favor, revisa tu fórmula.`);
                setIsCalculating(false);
                return; // Detener la ejecución sin lanzar error
            }

            // Validate limits
            const lower = parseInt(lowerLimit, 10);
            const upper = parseInt(upperLimit, 10);

            if (isNaN(lower) || isNaN(upper)) {
                setError('Los límites deben ser números');
                setIsCalculating(false);
                return;
            }

            if (lower > upper) {
                setError('El límite inferior no puede ser mayor que el límite superior');
                setIsCalculating(false);
                return;
            }

            if (upper - lower > 100) {
                setError('El rango máximo permitido es de 100 términos');
                setIsCalculating(false);
                return;
            }

            // Calculate succession
            const successionResult = SuccessionLogic.evaluateSuccession(formula, lower, upper);

            // Log the processed formula for debugging
            console.log('Processed formula:', successionResult.debug?.processedFormula);

            setResult(successionResult);
        } catch (err) {
            console.error('Error calculating succession:', err);

            // El manejo de errores principales ya está en SuccessionLogic
            setError(err.message);
            setResult(null);
        } finally {
            setIsCalculating(false);
        }
    };

    // Add symbol to formula
    const addSymbol = (symbol) => {
        setFormula(prevFormula => prevFormula + symbol);
    };

    // Component for symbol buttons
    const SymbolButton = ({symbol, label}) => {
        return (
            <button
                type="button"
                className={styles.symbolButton}
                onClick={() => addSymbol(symbol)}
                aria-label={label || symbol}
            >
                {symbol}
            </button>
        );
    };

    return (
        <div className={GlobalStyles.mainContainer}>
            {/* Navigation bar */}
            <div style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'left',
                padding: '1rem 2.5%'
            }}>
                <Link href="/">Inicio</Link>
            </div>

            {/* Main title */}
            <h1 className={GlobalStyles.multicolor} style={{fontSize: '3rem', marginBottom: '2rem'}}>
                SUCESIONES E INDUCCIÓN
            </h1>

            {/* Formula form */}
            <div className={styles.container}>
                <div className={styles.controls}>
                    <form onSubmit={handleCalculate} className={styles.formContainer}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="formula">Fórmula (use 'k' como variable)</label>
                            <input
                                id="formula"
                                type="text"
                                className={styles.input}
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                placeholder="Ej: k^2"
                            />

                            {/* Symbols toolbar */}
                            <div className={styles.symbolButtons}>
                                <SymbolButton symbol="+" label="Suma"/>
                                <SymbolButton symbol="-" label="Resta"/>
                                <SymbolButton symbol="*" label="Multiplicación"/>
                                <SymbolButton symbol="/" label="División"/>
                                <SymbolButton symbol="^" label="Potencia"/>
                                <SymbolButton symbol="sqrt(" label="Raíz cuadrada"/>
                                <SymbolButton symbol="sin(" label="Seno"/>
                                <SymbolButton symbol="cos(" label="Coseno"/>
                                <SymbolButton symbol="tan(" label="Tangente"/>
                                <SymbolButton symbol="log(" label="Logaritmo base 10"/>
                                <SymbolButton symbol="ln(" label="Logaritmo natural"/>
                                <SymbolButton symbol="(" label="Paréntesis izquierdo"/>
                                <SymbolButton symbol=")" label="Paréntesis derecho"/>
                            </div>

                            <small className={styles.inputHelper}>
                                <strong>Ejemplos:</strong> k^2, 2*k+1, sqrt(k), sqrt(k^2+1), sin(k*3.14/180)
                                <br/>
                                <strong>Raíz cuadrada:</strong> Usa sqrt(expresión) como una función, siempre con
                                paréntesis.
                                <br/>
                                <strong>Multiplicación:</strong> Usa el símbolo * (por ejemplo, 2*k en lugar de 2k).
                            </small>
                        </div>

                        <div className={styles.limitsContainer}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="lowerLimit">Límite inferior</label>
                                <input
                                    id="lowerLimit"
                                    type="number"
                                    className={styles.input}
                                    value={lowerLimit}
                                    onChange={(e) => setLowerLimit(e.target.value)}
                                    min="0"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="upperLimit">Límite superior</label>
                                <input
                                    id="upperLimit"
                                    type="number"
                                    className={styles.input}
                                    value={upperLimit}
                                    onChange={(e) => setUpperLimit(e.target.value)}
                                    min={lowerLimit}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.actionButton} ${styles.primary}`}
                            disabled={isCalculating}
                        >
                            {isCalculating ? 'Calculando...' : 'Calcular'}
                        </button>
                    </form>
                </div>

                {/* Error message */}
                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* Results */}
                {result && (
                    <div className={styles.resultsContainer}>
                        <h2 className={styles.resultsTitle}>Resultados</h2>

                        <div className={styles.mathematicalNotation}>
                            <div className={styles.notationBox}>
                                <h3>Notación Matemática:</h3>
                                <p className={styles.formulaDisplay}>
                                    <span className={styles.sum}>Σ</span>
                                    <span className={styles.limits}>
                    <span className={styles.upperLimit}>k={upperLimit}</span>
                    <span className={styles.lowerLimit}>k={lowerLimit}</span>
                  </span>
                                    <span className={styles.formula}>{formula}</span>
                                    <span className={styles.equals}> = {result.sum.toFixed(4)}</span>
                                </p>

                                <p className={styles.formulaDisplay}>
                                    <span className={styles.product}>Π</span>
                                    <span className={styles.limits}>
                    <span className={styles.upperLimit}>k={upperLimit}</span>
                    <span className={styles.lowerLimit}>k={lowerLimit}</span>
                  </span>
                                    <span className={styles.formula}>{formula}</span>
                                    <span className={styles.equals}> = {
                                        // Formatear producto según su tamaño
                                        result.product === Number.MAX_VALUE
                                            ? '∞ (demasiado grande para mostrar)'
                                            : result.product === -Number.MAX_VALUE
                                                ? '-∞ (demasiado grande para mostrar)'
                                                : Math.abs(result.product) > 100000
                                                    ? result.product.toExponential(4)  // Notación científica
                                                    : result.product.toFixed(4)
                                    }</span>
                                </p>
                            </div>
                        </div>

                        <div className={styles.termsTable}>
                            <h3>Términos de la sucesión:</h3>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>k</th>
                                    <th>Término</th>
                                </tr>
                                </thead>
                                <tbody>
                                {result.terms.map((term) => (
                                    <tr key={term.k}>
                                        <td>{term.k}</td>
                                        <td>{term.value.toFixed(4)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.summaryContainer}>
                            <div className={styles.summaryBox}>
                                <h3>Sumatoria:</h3>
                                <p className={styles.summaryValue}>{result.sum.toFixed(4)}</p>
                            </div>

                            <div className={styles.summaryBox}>
                                <h3>Productoria:</h3>
                                <p className={styles.summaryValue}>{
                                    // Formatear producto según su tamaño
                                    result.product === Number.MAX_VALUE
                                        ? '∞ (valor muy grande)'
                                        : result.product === -Number.MAX_VALUE
                                            ? '-∞ (valor muy grande)'
                                            : Math.abs(result.product) > 100000
                                                ? result.product.toExponential(4)  // Notación científica
                                                : result.product.toFixed(4)
                                }</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Induction explanation */}
                <div className={styles.inductionContainer}>
                    <h2 className={styles.sectionTitle}>Inducción Matemática</h2>
                    <p className={styles.explanationText}>
                        La inducción matemática es un método de demostración utilizado para probar que una
                        propiedad se cumple para todos los números naturales, o para un subconjunto de los
                        mismos con un límite inferior. Se basa en los siguientes pasos:
                    </p>

                    <ol className={styles.inductionSteps}>
                        <li>
                            <strong>Caso base:</strong> Demostrar que la propiedad se cumple para el primer
                            valor (normalmente n=1 o n=0).
                        </li>
                        <li>
                            <strong>Hipótesis inductiva:</strong> Suponer que la propiedad se cumple para un
                            número k arbitrario.
                        </li>
                        <li>
                            <strong>Paso inductivo:</strong> Demostrar que, bajo la hipótesis inductiva, la
                            propiedad también se cumple para k+1.
                        </li>
                    </ol>

                    <p className={styles.explanationText}>
                        La herramienta de sucesiones de esta página puede ayudarte a verificar los resultados
                        de tus demostraciones por inducción, permitiéndote calcular los valores específicos
                        para una fórmula dada.
                    </p>
                </div>
            </div>
        </div>
    );
}