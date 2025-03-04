import globalStyles from '../styles/globals.module.css';

export default function ContentContainer({ children, title }) {
    return (
        <div className={globalStyles.container}>
            <div className={globalStyles.leftSection}>
                <h2 className={globalStyles.sectionTitle}>{title}</h2>
            </div>
            <div className={globalStyles.divider}></div>
            <div className={globalStyles.rightSection}>
                {children}
            </div>
        </div>
    )
}