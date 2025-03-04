import GlobalStyles from '@/styles/globals.module.css';
import {useState} from 'react';
import Link from 'next/link';
import TruthTable from '@/components/TruthTable';
import styles from '@/styles/TruthTable.module.css';

export default function TruthTablePage() {
    const [expression, setExpression] = useState('');

    // Agregar símbolos lógicos al input
    const addSymbol = (symbol) => {
        setExpression(prevExpression => prevExpression + symbol);
    };

    // Componente para botones de símbolos lógicos
    const SymbolButton = ({symbol, label}) => {
        return (
            <button
                className={GlobalStyles.button}
                onClick={() => addSymbol(symbol)}
                aria-label={label || symbol}
                type="button"
            >
                {symbol}
            </button>
        );
    };

    return (
        <div className={GlobalStyles.mainContainer}>
            {/* Barra de navegación */}
            <div style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'left',
                padding: '1rem 2.5%'
            }}>
                <Link href="/">Inicio</Link>
            </div>

            {/* Título principal */}
            <h1 className={GlobalStyles.multicolor} style={{fontSize: '3rem', marginBottom: '2rem'}}>
                TABLAS DE VERDAD
            </h1>

            {/* Formulario de expresión lógica */}
            <div className={styles.formContainer}>
                <label htmlFor="logicExpression" className={styles.inputLabel}>
                    Introduce una expresión lógica:
                </label>
                <input
                    id="logicExpression"
                    className={GlobalStyles.inputText}
                    style={{fontFamily: 'Fira Code, monospace'}}
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="Ej: p ∧ (q → r)"
                />

                {/* Botones de símbolos lógicos */}
                <div className={styles.symbolButtons}>
                    <SymbolButton symbol="¬" label="Negación"/>
                    <SymbolButton symbol="∧" label="Conjunción (Y)"/>
                    <SymbolButton symbol="∨" label="Disyunción (O)"/>
                    <SymbolButton symbol="⊕" label="Disyunción exclusiva (XOR)"/>
                    <SymbolButton symbol="↔" label="Bicondicional (Si y solo si)"/>
                    <SymbolButton symbol="→" label="Condicional (Si...entonces)"/>
                    <SymbolButton symbol="(" label="Paréntesis izquierdo"/>
                    <SymbolButton symbol=")" label="Paréntesis derecho"/>
                </div>
            </div>

            {/* Tabla de verdad */}
            <TruthTable expression={expression}/>
        </div>
    );
}