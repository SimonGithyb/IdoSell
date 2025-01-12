const mongoose = require('mongoose');
const Schema = mongoose.Schema;

orderSchema = new Schema({
        _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        orderID: { type: String },
        products: [
            {
                productID: { type: String },
                quantity: { type: Number },
            }
        ],
        orderWorth: { type: Number },
        clientId: { type: Number },
}, {collection: 'order'});

Order = mongoose.model('Order', orderSchema);


module.exports = Order;
