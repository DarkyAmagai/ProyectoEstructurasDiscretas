import React from 'react';
import styles from '@/styles/SetTheory.module.css';

/**
 * Componente para mostrar un conjunto con sus elementos o definición
 */
export default function SetCard({name, setData, onRemove, onDragStart}) {
    // Determina cómo mostrar el conjunto basado en su tipo
    const renderSetContent = () => {
        if (!setData) return null;

        if (setData.type === 'finite') {
            return (
                <div className={styles.setContent}>
                    {setData.elements.length === 0
                        ? <span className={styles.emptySet}>∅</span> // Conjunto vacío con estilo mejorado
                        : setData.elements.map((element, index) => (
                            <span key={index} className={styles.chip}>{element}</span>
                        ))
                    }
                </div>
            );
        } else if (setData.type === 'infinite') {
            return (
                <div className={`${styles.setContent} ${styles.infiniteSet}`}>
                    {setData.representation}
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