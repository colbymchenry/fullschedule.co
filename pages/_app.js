import '../styles/globals.css'
import '../styles/bootstrap-grid.min.css'
import 'rsuite/dist/rsuite.min.css';
import {useRouter} from "next/router";
import {AuthProvider} from "../context/AuthContext";
import {CustomProvider} from "rsuite";
import Navigation from "../components/navigation/Navigation";
import Head from "next/head";

function MyApp({Component, pageProps}) {

    const router = useRouter();

    if(process.env.NEXT_PUBLIC_PRODUCTION === "true" || process.env.NEXT_PUBLIC_PRODUCTION === true) {
        console.log = function () {};
        console.error = function () {};
    }

    // if trying to access anything backend must include AuthProvider
    if (router.pathname.includes('/admin')) {
        return (
            <>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                </Head>
                <AuthProvider>
                    {router.pathname.includes("/dashboard") && <Navigation />}
                    <div className={"page-root"}>
                        <Component {...pageProps} />
                    </div>
                </AuthProvider>
            </>
        )
    } else {
        return (
            <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </Head>
            <Component {...pageProps} />
            </>
        )
    }
}

export default MyApp
