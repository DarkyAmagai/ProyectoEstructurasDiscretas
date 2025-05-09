import globalStyles from '../styles/globals.module.css';

export default function ContentContainer({ children, title }) {
    // Function to break title into multiple lines if needed
    const formatTitle = (title) => {
        if (title === "Tablas de Verdad") {
            return (
                <>
                    <div>Tablas</div>
                    <div>de Verdad</div>
                </>
            );
        } else if (title === "Teoría de Conjuntos") {
            return (
                <>
                    <div>Teoría de</div>
                    <div>Conjuntos</div>
                </>
            );
        } else if (title === "Sucesiones e Inducción") {
            return (
                <>
                    <div>Sucesiones</div>
                    <div>e Inducción</div>
                </>
            );
        } else {
            return title;
        }
    };

    return (
        <div className={globalStyles.container}>
            <div className={globalStyles.leftSection}>
                <h2 className={globalStyles.sectionTitle}>{formatTitle(title)}</h2>
            </div>
            <div className={globalStyles.divider}></div>
            <div className={globalStyles.rightSection}>
                {children}
            </div>
        </div>
    )
}