var express = require('express');
var ObjectID = require('mongodb').ObjectID
var router = express.Router();
var moment = require('moment')

router.get('/', function (req, res, next) {
    var db = require('../app.js').db
    const issueDate = moment(Number(req.query.date)).startOf('day').toDate()
    db.collection('issues').find({ issueDate }).toArray((err, r) => {
        res.send(r)
    })
});


router.post('/', function (req, res, next) {
    var db = require('../app.js').db

    //Check if book is available first 

    var promise1 = new Promise((resolve, reject) => {
        db.collection('issues').insertOne({
            bookId: req.query.bookId,
            memberId: req.query.memberId,
            issueDate: moment().startOf('day').toDate(),
            returnDate: moment().startOf('day').add(3, 'w').toDate(),
            status: 'issued'
        }, function (err, r) {
            if (err) {
                reject(err)
            }
            else {
                resolve(r)
            }
        })
    })

    var promise2 = new Promise((resolve, reject) => {
        db.collection('books').updateOne({ _id: ObjectID(req.query.bookId) }, { $inc: { quantity: -1 } }, function (err, r) {
            if (err) {
                reject(err)
            }
            else {
                resolve(r)
            }
        })
    })

    var promise3 = new Promise((resolve, reject) => {
        db.collection('members').updateOne({ _id: ObjectID(req.query.memberId) }, { $inc: { canIssue: -1 } }, function (err, r) {
            if (err) {
                reject(err)
            }
            else {
                resolve(r)
            }
        })
    })

    Promise.all([promise1, promise2, promise3]).then(() => res.send('done'))

})

module.exports = router;
