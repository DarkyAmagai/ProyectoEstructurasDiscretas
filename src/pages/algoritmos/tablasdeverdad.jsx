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
    const add_expression_text = (text) => {
        setExpression(expression + text);
    }


    return (
        <div className={GlobalStyles.mainContainer}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                width: '100%'
            }}>
                <Link style={{marginTop: '10px', marginLeft: '10px'}} href={'/'}>Inicio</Link>
            </div>
            <label>
                Introduce la expresión: <input value={expression} onChange={e => setExpression(e.target.value)}></input>
            </label>
            <div style={{
                display: 'flex',
                width: '100%',
                flexAlign: 'row',
                justifyContent: 'center',
                itemAlign: 'center'
            }}>
                <button className={GlobalStyles.button} onClick={() => add_expression_text('->')}>texto</button>
            </div>
            {
                creador_tabla()
            }
        </div>
    )
}