import globalStyles from '../styles/globals.module.css';

export default function ContentContainer({ children, title }) {
    return (
        <div className={globalStyles.container}>
            <h1 className={globalStyles.leftSection}>{title}</h1>
            <div className={globalStyles.divider}></div>
            <div className={globalStyles.rightSection}>
                {children}
            </div>
        </div>
    )
}