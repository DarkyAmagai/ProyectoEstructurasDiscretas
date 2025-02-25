import {Logic} from '@/logic/TruthTableLogic';

export default function Table({expression}) {
    const truthTable = new Logic();
    truthTable.generateTruthTable(expression);

    const datos = truthTable.truthTable;
    console.log(datos);
    const columnas = datos.length > 0 ? Object.keys(datos[0]) : [];

    return (
        <table
            style={{
                borderCollapse: 'collapse',
                width: '95%',
                borderRadius: '50%',
            }}
        >
            {/* Cabecera */}
            <thead>
            <tr
                style={{
                    backgroundColor: 'var(--background)',
                }}
            >
                {columnas.map((columna, index) => (
                    <th
                        key={index}
                        style={{
                            padding: '12px',
                            border: '1px solid var(--foreground)',
                            textAlign: 'center',
                        }}
                    >
                        {columna.toUpperCase()}
                    </th>
                ))}
            </tr>
            </thead>

            {/* Cuerpo */}
            <tbody>
            {datos.map((fila, filaIndex) => (
                <tr
                    key={filaIndex}
                    style={{
                        backgroundColor: filaIndex % 2 === 0 ? '#111727' : '#252b3e',
                    }}
                >
                    {columnas.map((columna, columnaIndex) => (
                        <td
                            key={columnaIndex}
                            style={{
                                padding: '12px',
                                border: '1px solid var(--foreground)',
                                color: fila[columna] === 'true' ? 'green' : 'red',
                            }}
                        >
                            {typeof fila[columna] === 'object' ? (
                                <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                                    {Object.entries(fila[columna]).map(([subExp, subVal]) => (
                                        <li key={subExp}>
                                            {subExp}: {subVal}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                fila[columna]
                            )}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}
