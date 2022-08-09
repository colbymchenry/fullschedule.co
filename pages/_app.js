import '../styles/globals.css'
import '../styles/normalize.css'
import '../styles/webflow.css'
import '../styles/full-schedule.webflow.css'
import 'rsuite/dist/rsuite.min.css';
import {useRouter} from "next/router";
import {AuthProvider} from "../context/AuthContext";
import Navigation from "../components/navigation/Navigation";
import Head from "next/head";
import React from "react";
import Script from "next/script";

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
                <Script src={"https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=62f2af52c96fcad263ea1d2a"} />
                <Script src="/webflow.js"/>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,regular,500,700,900%7CPoppins:200,300,regular,500,600,700,800,900%7CManrope:200,300,regular,500,600,700,800%7CInter:100,200,300,regular,500,600,700,800,900" media="all" />
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
            <Script src={"https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=62f2af52c96fcad263ea1d2a"} />
            <Script src="/webflow.js"/>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </Head>
            <Component {...pageProps} />
            </>
        )
    }
}

export default MyApp
