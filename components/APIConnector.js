import axios from "axios";
import { setupCache } from 'axios-cache-adapter';

const cache = setupCache({
    maxAge: 15 * 60 * 1000
});

// Create `axios` instance passing the newly created `cache.adapter`
export const axiosCached = axios.create({
    adapter: cache.adapter
});

export class APIConnector {
    // Cache-Control: public, max-age=120, stale-while-revalidate=60
    static async create(timeout, currentUser) {
        return axios.create({
            baseURL: '/api',
            timeout: timeout || 5000,
            headers: {
                common: {
                    "authorization": await currentUser.getIdToken(true)
                }
            }
        })
    }

}