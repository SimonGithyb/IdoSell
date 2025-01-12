const Json2csvParser = require("json2csv").Parser;

const convertJsonToCsv = (data) => {
    const objectData = data.map(d => d.toObject());
    const dataToContert = [];
    objectData.map(d => dataToContert.push({
        orderID: d.orderID,
        products: d.products,
        orderWorth: d.orderWorth 
    }))

    const json2csvParser = new Json2csvParser({  });
    return json2csvParser.parse(dataToContert);
};

module.exports = {
    convertJsonToCsv
}