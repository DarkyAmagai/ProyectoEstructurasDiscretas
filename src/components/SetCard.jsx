import React from 'react';
import styles from '@/styles/SetTheory.module.css';

/**
 * Componente para mostrar un conjunto con sus elementos o definición
 */
export default function SetCard({name, setData, onRemove, onDragStart}) {
    // Renderiza un elemento anidado recursivamente
    const renderNestedElement = (element) => {
        if (!element) return null;

        if (typeof element === 'object' && element.type) {
            if (element.type === 'primitive') {
                return String(element.value);
            } else if (element.type === 'set') {
                // Manejar conjuntos anidados recursivamente
                const nestedContent = element.elements.map(renderNestedElement).join(', ');
                return `{${nestedContent}}`;
            } else if (element.type === 'setRef') {
                return element.reference;
            }
        }

        // Fallback para versiones antiguas
        return String(element);
    };

    // Renderiza un elemento individual del conjunto
    const renderElement = (element, key) => {
        if (!element) return null;

        if (element.type === 'primitive') {
            return <span key={key} className={styles.chip}>{element.value}</span>;
        } else if (element.type === 'setRef') {
            return (
                <span key={key} className={`${styles.chip} ${styles.setRefChip}`}>
                    {element.reference}
                </span>
            );
        } else if (element.type === 'set') {
            // Clase especial para conjuntos anidados con mejor estilo
            return (
                <span key={key} className={`${styles.chip} ${styles.nestedSetChip}`}>
                    {`{${element.elements.map(renderNestedElement).join(', ')}}`}
                </span>
            );
        }

        // Compatibilidad con versiones anteriores - elementos que son strings directamente
        return <span key={key} className={styles.chip}>{element}</span>;
    };

    // Determina cómo mostrar el conjunto basado en su tipo
    const renderSetContent = () => {
        if (!setData) return null;

        if (setData.type === 'finite') {
            return (
                <div className={styles.setContent}>
                    {setData.elements.length === 0 ? (
                        <span className={styles.emptySet}>∅</span> // Conjunto vacío con estilo mejorado
                    ) : (
                        <div className={styles.elementsContainer}>
                            {Array.isArray(setData.elements) && setData.elements.map((element, index) =>
                                renderElement(element, index)
                            )}
                        </div>
                    )}
                </div>
            );
        } else if (setData.type === 'infinite') {
            // Verificar si tenemos muestras o una representación personalizada para mostrar
            const hasSamples = setData.samples && Array.isArray(setData.samples) && setData.samples.length > 0;
            const sampleDisplay = setData.sampleDisplay || setData.representation;
            
            return (
                <div className={`${styles.setContent} ${styles.infiniteSet}`}>
                    <div className={styles.infiniteSetHeader}>
                        {setData.representation}
                    </div>
                    {hasSamples && (
                        <div className={styles.infiniteSetSamples}>
                            {setData.samples.map((sample, index) => (
                                <span key={index} className={styles.infiniteSample}>
                                    {sample}
                                </span>
                            ))}
                        </div>
                    )}
                    {!hasSamples && sampleDisplay !== setData.representation && (
                        <div className={styles.infiniteSetSamples}>
                            {sampleDisplay}
                        </div>
                    )}
                </div>
            );
        } else if (setData.type === 'relation') {
            return (
                <div className={styles.setContent}>
                    <span className={styles.relation}>{setData.representation}</span>
                    {setData.evaluation === 'indeterminate' &&
                        <p className={styles.note}>(Indeterminado para conjuntos infinitos)</p>
                    }
                </div>
            );
        }

        return <div className={styles.setContent}>Conjunto inválido</div>;
    };

    // Función para manejar el inicio del arrastre
    const handleDragStart = (e) => {
        if (onDragStart) {
            e.dataTransfer.setData('text/plain', name);
            onDragStart(name);
        }
    };

    return (
        <div
            className={styles.setCard}
            draggable={!!onDragStart}
            onDragStart={handleDragStart}
        >
            <div className={styles.setHeader}>
                <h3 className={styles.setName}>{name}</h3>
                <div className={styles.setActions}>
                    {onDragStart && (
                        <span className={styles.dragHandle} title="Arrastrar para usar en operaciones">
                            ⠿
                        </span>
                    )}
                    {onRemove && (
                        <button
                            className={`${styles.actionButton} ${styles.danger}`}
                            onClick={() => onRemove(name)}
                            aria-label={`Eliminar conjunto ${name}`}
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            </div>
            {renderSetContent()}
        </div>
    );
}