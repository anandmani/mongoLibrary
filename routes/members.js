var express = require('express');
var ObjectID = require('mongodb').ObjectID
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    var db = require('../app.js').db
    const nameRegex = new RegExp(req.query.name)
    db.collection('members').find({ name: { $regex: nameRegex } }).toArray((err, r) => {
        res.send(r)
    })
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
