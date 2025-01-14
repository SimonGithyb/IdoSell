const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const { convertJsonToCsv } = require('../utils/csv');
const orderModel = require('../models/order');
const userModel = require('../models/user');

const authenticateToken = (req,res,next) =>{
    const accessToken = req.headers['access-token'];
  
    if (accessToken == null)
        return res.sendStatus(401);
  
    jwt.verify(accessToken , process.env.SECRET_ACCESS_TOKEN,(err,data)=>{
      if (err) return res.status(402).send(err);
      req.user = data[0];
      next();
    })
  }

router.post("/login", async (req, res) => {
    const { login, password } = req.body;

    const user = await userModel.find({login, password});

    if(user == null)
        return res.sendStatus(401);
    
    const accessToken = jwt.sign(JSON.stringify(user) , process.env.SECRET_ACCESS_TOKEN);
    res.send({accessToken : accessToken});
});

//get all orders
router.get('/',
    authenticateToken,
    async (req, res) => {
        try {
            const user = req.user;

            let allOrders;
            if (user.role === 'superadmin') {
                allOrders = await orderModel.find({});
            } else {
                allOrders = await orderModel.find({clientId: user.clientId});
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
    authenticateToken,
    async (req, res) => {
        try {
            const user = req.user;

            const data = [];
            if (user.role === 'superadmin') {
                data.push(
                    await orderModel.findOne({ orderID: id })
                )
            } else {
                data.push(
                    await orderModel.findOne({ orderID: id, clientId: user.clientId })
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
    authenticateToken,
    async (req, res) => {
        try {
            const user = req.user;
            let dataBetween;
            const { minWorth, maxWorth } = req.params;
            if (user.role === 'superadmin') {
                dataBetween = await orderModel.find({
                    orderWorth: {
                        $gte: minWorth,
                        $lt: maxWorth
                    }
                });
            } else {
                dataBetween = await orderModel.find({
                    orderWorth: {
                        $gte: minWorth,
                        $lt: maxWorth
                    },
                    clientId: user.clientId
                });
            }
            const dataCsv = convertJsonToCsv(dataBetween);
            
            res.status(200).send(dataCsv);
        } catch(err) {
            console.error(err);
            res.status(500).json('Server error');
        }
});

module.exports = router;
