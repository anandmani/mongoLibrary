var express = require('express');
var ObjectID = require('mongodb').ObjectID
var router = express.Router();

const pageSize = 20

router.get('/', function (req, res, next) {
    var db = require('../app.js').db
    const findObj = {}
    if (req.query.name) {
        const nameRegex = new RegExp(req.query.name, 'i')
        findObj.name = { $regex: nameRegex }
    }
    if (req.query.author) {
        const authorRegex = new RegExp(req.query.author, 'i')
        findObj.authors = { $regex: authorRegex }
    }
    if (req.query.category) {
        const categoryRegex = new RegExp(req.query.category, 'i')
        findObj.categories = { $regex: categoryRegex }
    }

    if (req.query.page) {
        const cursor = db.collection('books').find(findObj).skip((req.query.page - 1) * pageSize).limit(pageSize)
        let data = null
        let count = null
        Promise.all([
            new Promise((resolve, reject) => {
                cursor.toArray((err, r) => {
                    data = r
                    resolve()
                })
            }),
            cursor.count()
                .then((r) => {
                    count = r
                })
        ])
            .then(() => {
                res.send({ count, data })
            })
    }
    else {
        db.collection('books').find(findObj).toArray((err, r) => {
            res.send(r)
        })
    }

});

router.post('/', function (req, res, next) {
    var db = require('../app.js').db
    db.collection('books').insertOne({
        name: req.body.name,
        category: req.body.category,
        authors: req.body.authors,
        quantity: req.body.quantity
    }, function (err, r) {
        res.send(r.insertedId)
    })
})

router.delete('/', function (req, res, next) {
    var db = require('../app.js').db
    db.collection('books').deleteOne({ _id: ObjectID(req.query.id) }, (err, r) => {
        console.log("r", r)
        res.send({})
    })
})

module.exports = router;
