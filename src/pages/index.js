import ContentContainer from '@/components/ContentContainer';
import globalStyles from '@/styles/globals.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
      <div className={globalStyles.mainContainer}>
        <h1 className={globalStyles.multicolor} style={{fontSize: '3rem', marginBottom: '2rem'}}>
          Estructuras Discretas - Proyecto Final
        </h1>

        <div className={globalStyles.contentGrid}>
          <ContentContainer title="Tablas de Verdad">
            <p>
              Las tablas de verdad son una herramienta fundamental en lógica para evaluar
              expresiones booleanas bajo todas las posibles combinaciones de valores de sus variables.
            </p>
            <div className={globalStyles.imageContainer}>
              <Image
                  src="/file.svg"
                  alt="Tablas de Verdad"
                  width={60}
                  height={60}
              />
            </div>
            <Link href="/algoritmos/tablasdeverdad" className={globalStyles.button}>
              Explorar
            </Link>
        </ContentContainer>

          <ContentContainer title="Teoría de Conjuntos">
            <p>
              La teoría de conjuntos estudia colecciones de objetos y sus propiedades,
              permitiendo operaciones como unión, intersección y diferencia entre ellos.
            </p>
            <div className={globalStyles.imageContainer}>
              <Image
                  src="/globe.svg"
                  alt="Teoría de Conjuntos"
                  width={60}
                  height={60}
              />
            </div>
            <Link href="/algoritmos/teoriadeconjuntos" className={globalStyles.button}>
              Explorar
            </Link>
          </ContentContainer>

          <ContentContainer title="Sucesiones e Inducción">
            <p>
              Las sucesiones y la inducción matemática permiten analizar secuencias de números y
              demostrar propiedades que se cumplen para todos los números naturales.
            </p>
            <div className={globalStyles.imageContainer}>
              <Image
                  src="/window.svg"
                  alt="Sucesiones e Inducción"
                  width={60}
                  height={60}
              />
            </div>
            <Link href="/algoritmos/sucesiones" className={globalStyles.button}>
              Explorar
            </Link>
          </ContentContainer>
        </div>

        <footer className={globalStyles.footer}>
          <p>Desarrollado con Next.js y React</p>
          <div className={globalStyles.footerLogos}>
            <Image src="/next.svg" alt="Next.js Logo" width={80} height={20}/>
            <Image src="/vercel.svg" alt="Vercel Logo" width={80} height={20}/>
          </div>
        </footer>
      </div>
  );
}