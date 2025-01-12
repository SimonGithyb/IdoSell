const express = require('express');
const router = express.Router();
const fs = require('fs');

const { convertJsonToCsv } = require('../utils/csv');
const orderModel = require('../models/order');
const userModel = require('../models/user');

//get all orders
router.get('/',
async (req, res) => {
    try {
        const { clientId } = req.body;
        const user = validAcess(clientId);
        if (!user) {
            res.status(400).json('Do not have access');
            return;
        }
        let allOrders;
        if (user.role === 'superadmin') {
            allOrders = await orderModel.find({});
        } else {
            allOrders = await orderModel.find({clientId});
        }

        const dataCsv = convertJsonToCsv(allOrders);
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
            const { clientId } = req.body;
            const { id } = req.params;

            const user = validAcess(clientId);
            if (!user) {
                res.status(400).json('Do not have access');
                return;
            }

            const data = [];
            if (user.role === 'superadmin') {
                data.push(
                    await orderModel.findOne({ orderID: id })
                )
            } else {
                data.push(
                    await orderModel.findOne({ orderID: id, clientId })
                )
            }

            const dataCsv = convertJsonToCsv(data);
            
            res.status(200).send(dataCsv);
        } catch(err) {
            console.error(err);
            res.status(500).json('Server error');
        }
});
//get order by minWorth and maxWorth
router.get('/byWorth/:minWorth?/:maxWorth?',
    async (req, res) => {
        try {
            const { clientId } = req.body;
            const user = validAcess(clientId);
            if (!user) {
                res.status(400).json('Do not have access');
                return;
            }
            let dataBetween;
            const { minWorth, maxWorth } = req.params;
            if (user.role === 'superadmin') {
                dataBetween = await orderModel.find({
                    orderWorth: {
                        $gte: minWorth,
                        $lt: maxWorth
                    },
                    clientId
                });
            } else {
                dataBetween = await orderModel.find({
                    orderWorth: {
                        $gte: minWorth,
                        $lt: maxWorth
                    },
                    clientId
                });
            }
            const dataCsv = convertJsonToCsv(dataBetween);
            
            res.status(200).send(dataCsv);
        } catch(err) {
            console.error(err);
            res.status(500).json('Server error');
        }
});

const validAcess = async (id) => {
    const user = await userModel.find({clientId: id});

    if(user.length == 0) return false;

    return user;
};

module.exports = router;
