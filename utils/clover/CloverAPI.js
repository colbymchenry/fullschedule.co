import {Settings} from "../../modals/Settings";
import axios from "axios";
import {Clover} from "clover-ecomm-sdk";
import {FirebaseAdmin} from "../firebase/FirebaseAdmin";

export class CloverAPI {

    constructor() {
        this.settings = null;
        this.connector = null;
    }


    static async getInstance() {
        const cloverApi = new CloverAPI();
        cloverApi.settings = await Settings.getInstance();
        cloverApi.connector = new Clover(cloverApi.settings.get("clover_ecomm_private_token"), {environment: 'production'})
        return cloverApi;
    }

    async run(url, body, headers) {
        headers = {
            ...headers,
            authorization: `Bearer ${this.settings.get("clover_api_token")}`,
            mId: this.settings.get("clover_merchant_id")
        }

        if (!body || !Object.keys(body).length) {
            return await axios.get(`https://api.clover.com${url.replace('{mId}', this.settings.get("clover_merchant_id"))}`, { headers });
        } else {
            return await axios.post(`https://api.clover.com${url.replace('{mId}', this.settings.get("clover_merchant_id"))}`, body, { headers });
        }
    }

    async createCustomer(phone, email, firstname, lastname) {
        return await this.run('handlers.CreateCustomer', {
            emailAddresses: [
                {
                    customer: {},
                    emailAddress: email
                }
            ],
            phoneNumbers: [
                {
                    customer: {},
                    phoneNumber: phone
                }
            ],
            firstName: firstname,
            lastName: lastname
        });
    }

    async createEmployee(name, nickname) {
        return await this.run('employee.CreateEmployee', {name, nickname, customId: nickname});
    }

    async createCharge(source, amount) {
        return await this.connector.charges.create({
            source,
            amount,
            currency: 'usd',
            capture: 'true',
        })
    }

    async getInventory(refresh) {
        if (refresh) {
            const resProd = await this.run('/v3/merchants/{mId}/items?orderBy=name&limit=500&expand=itemStock,categories,tags')
            const resCat = await this.run('/v3/merchants/{mId}/categories')
            const cachedItems = await FirebaseAdmin.getCollectionArray("clover_inventory");
            resProd.data.elements.forEach((prod) => {
                const dbItem = cachedItems.find(({id, clover_id}) => clover_id === prod.id);
                if (dbItem) {
                    FirebaseAdmin.firestore().collection("clover_inventory").doc(dbItem.id).update(prod);
                } else {
                    prod["bookable"] = false;
                    FirebaseAdmin.firestore().collection("clover_inventory").add(prod);
                }
            })

            return {products: resProd.data.elements, categories: resCat.data.elements};
        } else {
            const products = await FirebaseAdmin.getCollectionArray("clover_inventory");
            let categories = [];
            products.filter((prod) => prod?.categories && prod?.categories?.elements.length).forEach((prod) => {
                prod.categories.elements.forEach((cat) => {
                    if (!categories.find(({id}) => id === cat.id)) {
                        categories.push(cat)
                    }
                })
            });

            return {products: await FirebaseAdmin.getCollectionArray("clover_inventory"), categories };
        }
    }

    async updateInventoryItem(itemId, body) {
        return await this.run(`/v3/merchants/{mId}/items/${itemId}`, body);
    }

    async createInventoryItem(name, price, hidden, available, autoManage, isRevenue, itemStock, priceType, unitName, cost) {

        const cloverItem = await this.run('/v3/merchants/{mId}/items', {
            name,
            price: parseInt(price) * 100,
            ...(hidden && { hidden } ),
            ...(available && { available }),
            ...(autoManage && { autoManage }),
            defaultTaxRates: 'true',
            ...(isRevenue && { isRevenue }),
            ...(priceType && { priceType }),
            ...(unitName && { unitName }),
            ...(cost  && { cost: parseInt(cost) * 100 })
        });

        if (itemStock && autoManage) {
            await this.run(`/v3/merchants/{mId}/item_stocks/${cloverItem["id"]}`, {
                stockCount: parseInt(itemStock),
                quantity: parseInt(itemStock)
            });
        }


        return cloverItem;
    }

    async createPromotion(name, amount, percentage) {
        const discount = await this.run('inventory.CreateDiscount', {
            name,
            ...(amount && { amount }),
            ...(percentage && { percentage })
        });

        console.log(discount);
    }

    async getCategories() {
        const cats = await this.run(`/v3/merchants/{mId}/categories`);
        return cats?.data?.elements || [];
    }

    async addCategoryToItem(categoryId, itemId) {
        await this.run(`/v3/merchants/{mId}/category_items`, {"elements":[{"item":{"id":itemId},"category":{"id":categoryId}}]});
    }

}