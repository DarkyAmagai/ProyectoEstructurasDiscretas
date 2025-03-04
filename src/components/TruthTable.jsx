import {Logic} from '@/logic/TruthTableLogic';
import styles from '@/styles/TruthTable.module.css';

export default function TruthTable({expression}) {
    if (!expression || expression.trim() === '') {
        return <div className={styles.emptyMessage}>Ingrese una expresión lógica</div>;
    }

    try {
        const logic = new Logic();
        logic.generateTruthTable(expression);
        const truthTable = logic.truthTable;

        if (truthTable.length === 0) {
            return <div className={styles.emptyMessage}>No hay resultados</div>;
        }

        // Extract all keys for headers
        const headers = Object.keys(truthTable[0]);

        return (
            <div className={styles.tableContainer}>
                <table className={styles.truthTable}>
                    <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className={header === 'result' ? styles.resultColumn : ''}>
                                {header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {truthTable.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map((header, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`${header === 'result' ? styles.resultColumn : ''} ${row[header] === 'true' ? styles.trueValue : styles.falseValue}`}
                                >
                                    {row[header]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    } catch (error) {
        return (
            <div className={styles.errorContainer}>
                <h2 className={styles.errorTitle}>Error</h2>
                <p className={styles.errorMessage}>{error.message}</p>
            </div>
        );
    }
}