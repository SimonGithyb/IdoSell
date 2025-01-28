const idosellSvc = require('../svc/idosellSvc');
const fs = require('fs');
const mongoose = require('mongoose');

const orderModel = require("../models/order");

const main = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/idosell', {
        autoIndex: true
      })
        .then(() => console.log('Connected successfully to idosell db [JOB get idosell data]!'))
        .catch(err => console.error(err + "[JOB get idosell data]"));

    let newOrderList = [];
    let lastOrderSerialnumber = 0;

    for (;;) {
        const lastModel = await orderModel.find().sort( [['serialNumber', -1]]).limit(1);

        if (lastModel.length > 0) {
            lastOrderSerialnumber = lastModel[0].serialNumber;
            lastOrderSerialnumber++;
        }
    
        const orderList = await idosellSvc.getOrdersFromSerialnumber(lastOrderSerialnumber);
    
        if (orderList.errors) {
            console.log(orderList.errors.faultString);
            process.exit(0);
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
                clientId: order.orderDetails.clientDeliveryAddressId,
                serialNumber: order.orderSerialNumber
            });
        });

        await orderModel.insertMany(newOrderList)
            .then( () => {
                console.log("Get Idosell DATA with sucessful");  
            }).catch(function (error) {
                console.log(error)
            });

        newOrderList = [];
    }
}

main().catch(e => {
    console.log(e);
});
