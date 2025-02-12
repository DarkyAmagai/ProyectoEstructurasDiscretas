import GlobalStyles from '../../styles/globals.module.css';
import Table from '../../components/Table.jsx';
import Link from 'next/link';

export default function Home() {
    return (
        <div className={GlobalStyles.mainContainer}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                paddingLeft: '5%',
                width: '100%'
            }}>
                <Link href={'/'}>Inicio</Link>
            </div>
            <Table></Table>
        </div>
    )
}