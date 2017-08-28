var express = require('express');
var ObjectID = require('mongodb').ObjectID
var router = express.Router();

const pageSize = 20

/* GET users listing. */
router.get('/', function (req, res, next) {
    var db = require('../app.js').db
    const findObj = {}
    if (req.query.name) {
        const nameRegex = new RegExp(req.query.name)
        findObj.name = { $regex: nameRegex }
    }
    if (req.query.mobile) {
        const mobileRegex = new RegExp(req.query.mobile)
        findObj.mobile = { $regex: mobileRegex }
    }

    if (req.query.page) {
        let data = null
        let count = null
        const cursor = db.collection('members').find(findObj).skip((req.query.page - 1) * pageSize).limit(pageSize)
        Promise.all([
            new Promise((resolve, reject) => {
                cursor.toArray((err, r) => {
                    data = r
                    resolve()
                })
            }),
            cursor.count()
                .then((r) => count = r)
        ])
            .then(() => res.send({
                count,
                data
            }))
    }
    else {
        db.collection('members').find(findObj).toArray((err, r) => {
            res.send(r)
        })
    }
});

router.post('/', function (req, res, next) {
    var db = require('../app.js').db
    db.collection('members').insertOne({
        name: req.query.name,
        mobile: req.query.mobile,
        canIssue: 3
    }, function (err, r) {
        res.send(r.insertedId)
    })
})

router.delete('/', function (req, res, next) {
    var db = require('../app.js').db
    db.collection('members').deleteOne({ _id: ObjectID(req.query.id) }, (err, r) => {
        console.log("r", r)
        res.send({})
    })
})
module.exports = router;
