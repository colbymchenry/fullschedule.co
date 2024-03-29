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

    async createCustomer(phone, email, firstname, lastname, metadata) {
        return await this.run('/v3/merchants/{mId}/customers', {
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
            lastName: lastname,
            ...(metadata && { metadata })
        });
    }

    async updateCustomer(id, phone, email, firstname, lastname, metadata) {
        return await this.run(`/v3/merchants/{mId}/customers/${id}`, {
            ...(email && { emailAddresses: [
                {
                    customer: {},
                    emailAddress: email
                }
            ]}),
            ...(phone && { phoneNumbers: [
                {
                    customer: {},
                    phoneNumber: phone
                }
            ]}),
            ...(firstname && { firstName: firstname }),
            ...(lastname && { lastName: lastname }),
            ...(metadata && { metadata })
        });
    }

    async createEmployee(name, nickname) {
        return await this.run('employee.CreateEmployee', {name, nickname, customId: nickname});
    }

    async createCharge(source, amount, receipt_email) {
        return await this.run('/v1/charges', {
            source,
            amount,
            currency: 'usd',
            capture: 'true',
            ...(receipt_email && { receipt_email })
        });
        // return await this.connector.charges.create({
        //     source,
        //     amount,
        //     currency: 'usd',
        //     capture: 'true',
        //     ...(receipt_email && { receipt_email })
        // })
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

    async getCustomers(refresh) {
        if (refresh) {
            const elements = [];

            let offset = 0;
            let res = await this.run('/v3/merchants/{mId}/customers?limit=1000&expand=addresses,emailAddresses,phoneNumbers,cards,metadata');

            while (res.data.elements.length <= 1000 && res.data.elements.length > 0) {
                await Promise.all(res.data.elements.map(async (customer) => {
                    const body = {
                        ...(customer?.firstName && {firstName: customer.firstName }),
                        ...(customer?.lastName && { lastName: customer.lastName }),
                        ...(customer.emailAddresses.elements.length && { email: customer.emailAddresses.elements[0].emailAddress }),
                        ...(customer.phoneNumbers.elements.length && { phoneNumber: customer.phoneNumbers.elements[0].phoneNumber })
                    }

                    if (body?.firstName && body?.lastName && body?.email) {
                        await FirebaseAdmin.firestore().collection("customers").doc(customer.id).set(body);
                        elements.push(body);
                    }
                }));

                offset += 1000;

                res = await this.run(`/v3/merchants/{mId}/customers?offset=${offset}&expand=addresses,emailAddresses,phoneNumbers,cards,metadata`);
            }

            return elements.map((customer) => {
                customer["doc_id"] = customer.id;
                return customer;
            });
        } else {
            return await FirebaseAdmin.getCollectionArray("customers");
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