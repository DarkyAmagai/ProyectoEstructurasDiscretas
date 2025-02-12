export default function Table() {
    const datos = [
        {id: 1, nombre: 'true', edad: 28},
        {id: 2, nombre: 'Bob', edad: 32},
        {id: 3, nombre: 'Charlie', edad: 25}
    ];
    const columnas = datos.length > 0 ? Object.keys(datos[0]) : [];

    return (
        <table style={{
            borderCollapse: 'collapse',
            width: '95%',
            borderRadius: '50%'
        }}>
            {/* Cabecera */}
            <thead>
            <tr style={{
                backgroundColor: 'var(--background)'
            }}>
                {columnas.map((columna, index) => (
                    <th
                        key={index}
                        style={{
                            padding: '12px',
                            border: '1px solid var(--foreground)',
                            textAlign: 'center'
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
                        backgroundColor: filaIndex % 2 === 0 ? '#111727' : '#252b3e'
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
                            {fila[columna]}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}