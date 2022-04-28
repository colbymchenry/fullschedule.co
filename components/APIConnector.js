import axios from "axios";

export class APIConnector {

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