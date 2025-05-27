const axios = require('axios');

class RestClient {
    constructor(baseURL, clientId, clientSecret) {
        this.baseURL = baseURL;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.token = null;
        this.tokenExpires = 0;
    }

    async authenticate() {
        const response = await axios.post(`${this.baseURL}/v1/oauth2/token`, null, {
            auth: {
                username: this.clientId,
                password: this.clientSecret
            },
            params: {
                grant_type: 'client_credentials'
            }
        });
        this.token = response.data.access_token;
        // Set token expiration time (minus a buffer)
        this.tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000;
    }

    async getAccessToken() {
        if (!this.token || Date.now() > this.tokenExpires) {
            await this.authenticate();
        }
        return this.token;
    }

    async request(method, endpoint, data = {}, params = {}) {
        const token = await this.getAccessToken();
        const response = await axios({
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data,
            params
        });
        return response.data;
    }
}

let clientInstance = null;
function getClient() {
    if (!clientInstance) {
        clientInstance = new RestClient(
            process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com',
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        );
    }
    return clientInstance;
}

module.exports = {
    RestClient,
    getClient,
    getAccessToken: async () => getClient().getAccessToken()
};