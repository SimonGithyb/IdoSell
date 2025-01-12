const idosellSvc = require('../svc/idosellSvc');
const fs = require('fs');
const mongoose = require('mongoose');

const orderModel = require("../models/order");

const main = async () => {
    const newOrderList = [];

    if (!fs.existsSync('./data/lastOrderSerialNumber.txt')){
        fs.writeFileSync("./data/lastOrderSerialNumber.txt", JSON.stringify(0));
    }

    let lastOrderSerialnumber = Number(fs.readFileSync('./data/lastOrderSerialNumber.txt', 'utf-8'));
    const orderList = await idosellSvc.getOrdersFromSerialnumber(++lastOrderSerialnumber);

    if (orderList.errors) {
        console.log(orderList.errors.faultString);
        return;
    }

    orderList.Results.map(order => {
        const products = [];
        order.orderDetails.productsResults.forEach(product => {
            products.push({
                productID: product.productId,
                quantity: product.productQuantity
            });
        });

        newOrderList.push({
            orderID: order.orderId,
            products,
            orderWorth: order.orderDetails.payments.orderBaseCurrency.orderProductsCost,
            clientId: order.orderDetails.clientDeliveryAddressId
        });

        if (order.orderSerialNumber > lastOrderSerialnumber) {
            lastOrderSerialnumber = order.orderSerialNumber;
            fs.writeFileSync("./data/lastOrderSerialNumber.txt", JSON.stringify(order.orderSerialNumber));
        }

    });
    
    await mongoose.connect('mongodb://127.0.0.1:27017/idosell', {
        autoIndex: true
      })
        .then(() => console.log('Connected successfully to idosell db [JOB]!'))
        .catch(err => console.error(err + "[JOB]"));

    await orderModel.insertMany(newOrderList)
        .then( () => {
            console.log("Get Idosell DATA with sucessful");  
        }).catch(function (error) {
            console.log(error)
        });
}

main().catch(e => {
    console.log(e);
});
