import GlobalStyles from '../../styles/globals.module.css';
import Table from '../../components/Table.jsx';
import Link from 'next/link';
import {Logic} from '@/logic/TruthTableLogic';
import {useState} from 'react';

export default function Home() {
    const [expression, setExpression] = useState('');
    const creador_tabla = () => {
        try {
            const tempLogic = new Logic();
            tempLogic.generateTruthTable(expression);
            return (<Table expression={expression}></Table>)
        } catch (e) {
            return (
                <div style={{
                    textAlign: 'center'
                }}>
                    <span style={{
                        color: 'red'
                    }}>
                        <h1>Hubo un error</h1>
                        <p>{e.message}</p>
                    </span>
                </div>
            )
        }
    }
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
            <label>
                Introduce la expresión: <input value={expression} onChange={e => setExpression(e.target.value)}></input>
            </label>
            {
                creador_tabla()
            }
        </div>
    )
}