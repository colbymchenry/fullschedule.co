import React, {useContext, useEffect, useState} from 'react'
import {FirebaseClient} from "../utils/firebase/FirebaseClient";
import {useRouter} from "next/router";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {

    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(undefined);
    const [loading, setLoading] = useState(true);

    async function login(email, password) {
        return await FirebaseClient.signIn(email, password);
    }

    async function logout() {
        await FirebaseClient.signOut();
        if (router) {
            router.push("/admin");
        }
    }

    useEffect(() => {
        return FirebaseClient.auth().onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });
    }, [])

    // put user at login page if not authenticated
    useEffect(() => {
        if (!currentUser && router) {
            router.push("/admin");
        }
    }, router ? [router.pathname] : [])

    const value = {
        currentUser,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}