import Head from 'next/head';
import GlobalStyle, {fontFaceRules} from '../components/GlobalStyle.css';

import icon from "../../public/icon.svg"

export default function App({Component, pageProps}) {
    return (
        <>
            <Head>
                    <link rel="shortcut icon" href={icon} type="image/x-icon"/>
                <style
                    dangerouslySetInnerHTML={{
                        __html: fontFaceRules,
                    }}
                ></style>

                <script async src="https://cdn.splitbee.io/sb.js"></script>
                <script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-PR31CLCPW1"
                ></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PR31CLCPW1');`,
                    }}
                />
            </Head>
            <GlobalStyle/>
            <Component {...pageProps} />
        </>
    );
}
