const express = require('express');
const router = express.Router();
const fs = require('fs');

const { convertJsonToCsv } = require('../utils/csv');
const { FILE_NAME } = process.env;
//get all orders
router.get('/',
async (req, res) => {
    try {
        const allDataJson = JSON.parse(fs.readFileSync("./data/" + FILE_NAME))
        const dataCsv = convertJsonToCsv(allDataJson);
        res.status(200).send(dataCsv);
    } catch(err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});
//get order by id
router.get('/:id',
    async (req, res) => {
        try {
            const { id } = req.params;
            const allDataJson = JSON.parse(fs.readFileSync("./data/" + FILE_NAME))
            const dataCsv = convertJsonToCsv(allDataJson);
            const order = dataCsv.filter(data => data.orderID == id);
            
            res.status(200).send(order);
        } catch(err) {
            console.error(err);
            res.status(500).json('Server error');
        }
});
//get order by minWorth and maxWorth
router.get('byWorth/:minWorth?/:maxWorth?',
    async (req, res) => {
        try {
            const { minWorth, maxWorth } = req.params;
            const allDataJson = JSON.parse(fs.readFileSync("./data/" + FILE_NAME))
            const dataCsv = convertJsonToCsv(allDataJson);
            const orders = dataCsv.filter(data => data.orderWorth >= minWorth && data.orderWorth <= maxWorth);
            
            res.status(200).send(orders);
        } catch(err) {
            console.error(err);
            res.status(500).json('Server error');
        }
});

module.exports = router;
