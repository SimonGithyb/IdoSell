
const convertJsonToCsv = (data) => {
    const header = ['orderID', 'productID', 'quantity', 'orderWorth' ];
    const columnDelimiter = ",";
    const lineDelimiter = "\n";
    keys = Object.keys(data[0])
    
    result = ""
    result += header.join(columnDelimiter)
    result += lineDelimiter
    
    data.forEach(item => {
        ctr = 0
        keys.forEach(key => {
            if (ctr > 0) {
                result += columnDelimiter
            }
            if(key === 'products') {
                item[key].forEach(prod => {
                    prod;
                    result += `${prod.productID},` + `${prod.quantity},`
                });
            } else {
                result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key]
     
            }
            ctr++;
        })
        result += lineDelimiter
    })

    return result;
}
module.exports = {
    convertJsonToCsv
}
