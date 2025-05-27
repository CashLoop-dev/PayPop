const ordersDb = require('../../db/orders');

const listOrders = async (req, res) => {
    try {
        const orders = await ordersDb.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
};

module.exports = listOrders;