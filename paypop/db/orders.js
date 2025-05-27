const db = require('./connection');

// Function to create a new order
const createOrder = async (orderData) => {
    try {
        const newOrder = await db.orders.insert(orderData);
        return newOrder;
    } catch (error) {
        throw new Error('Error creating order: ' + error.message);
    }
};

// Function to get an order by ID
const getOrderById = async (orderId) => {
    try {
        const order = await db.orders.findById(orderId);
        return order;
    } catch (error) {
        throw new Error('Error fetching order: ' + error.message);
    }
};

// Function to update an existing order
const updateOrder = async (orderId, updatedData) => {
    try {
        const updatedOrder = await db.orders.update(orderId, updatedData);
        return updatedOrder;
    } catch (error) {
        throw new Error('Error updating order: ' + error.message);
    }
};

// Function to delete an order
const deleteOrder = async (orderId) => {
    try {
        await db.orders.delete(orderId);
        return { message: 'Order deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting order: ' + error.message);
    }
};

// Function to list all orders
const listOrders = async () => {
    try {
        const orders = await db.orders.findAll();
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    listOrders,
};