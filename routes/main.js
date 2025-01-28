const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const stream = require('stream'); 

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

const hashPassword = async (pass) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(pass, salt);
}

router.put("/registration", async (req, res) => {
    const { login, password } = req.body;
    const findUser = await userModel.findOne({login});
    
    if(user)
        return res.json('User with this user name exist').sendStatus(401);

    const lastClientId = await userModel.find().sort( [['cilentId', -1]]).limit(1);
    const clientId = lastClientId++;

    new userModel({
        login,
        password,
        clientId,
    })
    .save();


});

router.post("/login", async (req, res) => {
    const { login, password } = req.body;

    const user = await userModel.findOne({ login, password });

    if(user == null)
        return res.sendStatus(401);

    const hashPass = await hashPassword(password);
    user.password = hashPass;
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
            const readStream = new stream.PassThrough();
            readStream.end(Buffer.from(dataCsv));
            res.set('Content-disposition', `attachment; filename=products.csv`);
            res.set('Content-Type', 'text/csv; charset=UTF-8');
            readStream.pipe(res);
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
            const readStream = new stream.PassThrough();
            readStream.end(Buffer.from(dataCsv));
            res.set('Content-disposition', `attachment; filename=products.csv`);
            res.set('Content-Type', 'text/csv; charset=UTF-8');
            readStream.pipe(res);

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
            const readStream = new stream.PassThrough();
            readStream.end(Buffer.from(dataCsv));
            res.set('Content-disposition', `attachment; filename=products.csv`);
            res.set('Content-Type', 'text/csv; charset=UTF-8');
            readStream.pipe(res);
        } catch(err) {
            console.error(err);
            res.status(500).json('Server error');
        }
});

module.exports = router;
