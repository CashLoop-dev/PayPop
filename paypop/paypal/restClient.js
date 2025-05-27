const axios = require('axios');

class RestClient {
    constructor(baseURL, clientId, clientSecret) {
        this.baseURL = baseURL;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.token = null;
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
    }

    async request(method, endpoint, data = {}) {
        if (!this.token) {
            await this.authenticate();
        }

        const response = await axios({
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            data
        });

        return response.data;
    }
}

module.exports = RestClient;