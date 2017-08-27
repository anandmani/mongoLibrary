var express = require('express');
var ObjectID = require('mongodb').ObjectID
var router = express.Router();
var moment = require('moment')

router.get('/', function (req, res, next) {
    var db = require('../app.js').db
    const returnDate = moment(Number(req.query.date)).startOf('day').toDate()
    db.collection('issues').find({ returnDate }).toArray((err, r) => {
        res.send(r)
    })
});


router.post('/', function (req, res, next) {
    var db = require('../app.js').db

    var updateBook = (bookId) => new Promise((resolve, reject) => {
        db.collection('books').updateOne({ _id: ObjectID(bookId) }, { $inc: { quantity: 1 } }, function (err, r) {
            if (err) {
                reject(err)
            }
            else {
                resolve(r)
            }
        })
    })

    var updateMember = (memberId) => new Promise((resolve, reject) => {
        db.collection('members').updateOne({ _id: ObjectID(memberId) }, { $inc: { canIssue: 1 } }, function (err, r) {
            if (err) {
                reject(err)
            }
            else {
                resolve(r)
            }
        })
    })

    new Promise((resolve, reject) => {
        db.collection('issues').findOneAndUpdate(
            {
                _id: ObjectID(req.query.id)
            },
            {
                $set: { status: 'returned' }
            },
            function (err, r) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(r)
                }
            }
        )
    })
        .then((r) => Promise.all([updateBook(r.value.bookId), updateMember(r.value.memberId)]))
        .then(() => res.send('done'))
})

module.exports = router;
