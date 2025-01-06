const idosellSvc = require('../svc/idosellSvc');
const fs = require('fs');

const { FILE_NAME } = process.env;

const main = async () => {
    const newOrderList = [];

    if (!fs.existsSync('./data/lastOrderSerialNumber')){
        fs.writeFileSync("./data/lastOrderSerialNumber", JSON.stringify(0));
    }

    let lastOrderSerialnumber = Number(fs.readFileSync('./data/lastOrderSerialNumber', 'utf-8'));
    const orderList = await idosellSvc.getOrdersFromSerialnumber(++lastOrderSerialnumber);
     
    if (fs.existsSync("./data/" + FILE_NAME)){
        const oldOrderList = JSON.parse(fs.readFileSync("./data/" + FILE_NAME));
        newOrderList.push(oldOrderList);
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
            orderWorth: order.orderDetails.payments.orderBaseCurrency.orderProductsCost
        });
    
        if (order.orderSerialNumber > lastOrderSerialnumber) {
            lastOrderSerialnumber = order.orderSerialNumber;
            fs.writeFileSync("./data/lastOrderSerialNumber", JSON.stringify(order.orderSerialNumber));
        }    
    });
    
    fs.writeFileSync("./data/" + FILE_NAME, JSON.stringify(newOrderList));
    console.log("Get Idosell DATA with sucessful");  
}

main().catch(e => {
    console.log(e);
});
