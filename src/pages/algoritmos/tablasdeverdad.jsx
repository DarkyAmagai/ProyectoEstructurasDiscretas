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

    const ExpressionButton = ({expression}) => {
        return (
            <button className={GlobalStyles.button} onClick={() => add_expression_text(expression)}>
                <span style={{textAlign: 'Center', justifyContent: 'center'}}>{expression}</span>
            </button>
        )
    }

    return (
        <div className={GlobalStyles.mainContainer}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                width: '100%'
            }}>
                <Link style={{marginTop: '2%', marginLeft: '2.5%'}} href={'/'}>Inicio</Link>
            </div>
            <label style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                marginTop: '20px',
                alignItems: 'center'
            }}>
                <h1 style={{
                    margin: '10px 10px'
                }}
                    className={GlobalStyles.multicolor} style={{fontSize: '3rem', marginBottom: '20px'}}>TABLAS DE
                    VERDAD</h1>
                <input className={GlobalStyles.inputText} value={expression}
                       onChange={e => setExpression(e.target.value)}></input>
            </label>
            <div style={{
                display: 'flex',
                width: '100%',
                flexAlign: 'row',
                justifyContent: 'center',
                itemAlign: 'center',
                gap: '10px'
            }}>
                <ExpressionButton expression={'¬'}></ExpressionButton>
                <ExpressionButton expression={'∧'}></ExpressionButton>
                <ExpressionButton expression={'∨'}></ExpressionButton>
                <ExpressionButton expression={'⊕'}></ExpressionButton>
                <ExpressionButton expression={'↔'}></ExpressionButton>
                <ExpressionButton expression={'→'}></ExpressionButton>
            </div>
            {
                creador_tabla()
            }
        </div>
    )
}