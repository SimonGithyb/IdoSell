const Json2csvParser = require("json2csv").Parser;

const convertJsonToCsv = (data) => {
    const objectData = data.map(d => d.toObject());
    const dataToContert = [];
    objectData.map(d => {
        d.products.forEach(prod =>
            dataToContert.push({
                orderID: d.orderID,
                productId: prod.productId,
                productQuantity: prod.quantity,
                orderWorth: d.orderWorth 
            })
        )
    })

    const json2csvParser = new Json2csvParser({  });
    return json2csvParser.parse(dataToContert);
};

module.exports = {
    convertJsonToCsv
}