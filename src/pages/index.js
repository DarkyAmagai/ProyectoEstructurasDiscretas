import ContentContainer from '.././components/ContentContainer';
import globalStyles from '../styles/globals.module.css';
import Link from 'next/link';

export default function Home() {
  return (
      <div className={globalStyles.mainContainer}>
        <h1>Estructuras discretas: "Proyecto final"</h1>
        <ContentContainer title={"Tablas de verdad"}>
          <p>Las tablas de verdad son una forma de comprobar todas las condiciones booleanas en una tabla basadas en una expresion logica booleana.</p>
          <Link href={"/algoritmos/tablasdeverdad"}>¿Comprobar datos?</Link>
        </ContentContainer>
        <ContentContainer title={"Otra cosa"}></ContentContainer>
        <ContentContainer title={"Otra cosa"}></ContentContainer>
        <ContentContainer title={"Otra cosa"}></ContentContainer>
        <ContentContainer title={"Otra cosa"}></ContentContainer>
      </div>
  );
}
