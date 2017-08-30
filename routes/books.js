var express = require('express');
var ObjectID = require('mongodb').ObjectID
var router = express.Router();

const pageSize = 20

const getData = (db, cursor) => {
    let books = null
    let issues = null
    return new Promise((resolve, reject) => {
        cursor.toArray((err, r) => {
            books = r
            resolve()
        })
    })
        .then(() => {
            return Promise.all(
                books.map((book, index) => {
                    return new Promise((resolve, reject) => {
                        db.collection('issues').find({ bookId: book._id.toString(), status: 'issued' }).toArray((err, r) => {
                            resolve(r)
                        })
                    })
                })
            )
        })
        .then((r) => {
            r.forEach((issues, index) => {
                books[index].issues = issues
            })
            // res.send(books)
            return books
        })
}

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
            getData(db, cursor)
                .then((books) => data = books)
            ,
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
        const cursor = db.collection('books').find(findObj)
        getData(db, cursor)
            .then((books) => res.send(books))
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
