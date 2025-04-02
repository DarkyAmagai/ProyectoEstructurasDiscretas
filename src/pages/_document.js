import {Head, Html, Main, NextScript} from "next/document";

export default function Document() {
  return (
      <Html lang="es">
          <Head>
              <meta name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
              <meta name="theme-color" content="#6a5acd"/>
              <meta name="description" content="Algoritmos matemáticos interactivos"/>
          </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
