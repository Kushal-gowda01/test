import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@frontend/components/Layout';
import '@frontend/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AIR — Air Intelligence & Response</title>
        <meta name="description" content="Transform complex climate and environmental data into clear, visual, and actionable insights." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
