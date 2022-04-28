import '../styles/globals.css'
import '../styles/bootstrap-grid.min.css'
import 'rsuite/dist/rsuite.min.css';
import {useRouter} from "next/router";
import {AuthProvider} from "../context/AuthContext";
import {CustomProvider} from "rsuite";
import Navigation from "../components/navigation/Navigation";

function MyApp({Component, pageProps}) {

    const router = useRouter();

    // if trying to access anything backend must include AuthProvider
    if (router.pathname.includes('/admin')) {
        return (
            <CustomProvider theme={"dark"}>
                <AuthProvider>
                    {router.pathname.includes("/dashboard") && <Navigation />}
                    <div className={"page-root"}>
                        <Component {...pageProps} />
                    </div>
                </AuthProvider>
            </CustomProvider>
        )
    } else {
        return <Component {...pageProps} />
    }
}

export default MyApp
