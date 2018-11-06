const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const parseJson = require('parse-json');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var exports = module.exports = {};
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

MongoClient.connect('mongodb://localhost:27017/notes', function (err, client) {
let db = client.db('notes')
let notes = db.collection('notes')
  if (err) throw err

  
 app.get('/notes/', (req,res) => {
    notes.find().toArray((err, result) => {
        res.render('index', {
            title:'Get all notes',
            notes: result
        })
})
})

app.get('/notes/add', (req,res) => {
        res.render('add_note', {
            title:'Add notes'
        })

})

app.get('/notes/update', (req,res) => {
    res.render('update_note', {
        title:'Update notes'
    })

})

app.get('/notes/delete', (req,res) => {
    res.render('delete_note', {
        title:'Delete note by ID'
    })

})

app.post('/notes/add', (req,res) => {
    let body = req.body
    notes.insert(body, (err, result) => {
        if (err){
            console.log(err)
            res.status(500).send("Some internal error");
        }
        else{
            res.send("RECORD ADDED");
        }
    })
})

app.post('/notes/update', (req,res) => {
    let id = ObjectID.createFromHexString(req.body.id);
    let title = req.body.title;
    let author = req.body.author;
    let numPages = req.body.numPages;
    let newvalues = {$set : {title : `${title}`,author : `${author}`,numPages : `${numPages}`} };

    notes.updateOne({"_id" : id}, newvalues , (err, note) => {
    if (err) {
        console.log(err)
        res.status(500).send("internal Server Error")
    }
    else {
        (note === null) ? res.status(404).send("Data not found") : res.status(200).send("Record Updated");
    }
    })
})

app.post('/notes/delete', (req,res) => {
    
    let id = ObjectID.createFromHexString(req.body.id);

    notes.removeOne({'_id': id}, (err, note) => {
        if (err) {
            console.log(err)
            res.status(500).send("internal Server Error")
        }
        else {
            (note === null) ? res.status(404).send("Data not found") : res.status(200).send("Record Deleted");
    }
    })

})

    app.get('/api/notes/', (req, res) => {
        notes.find().toArray((err, result) => {
            if (err) throw err;
            else{
                (result === null) ? res.status(404).send("Data not found") : res.status(200).send(result);
            }   
        })
    })  

app.get('/api/notes/:id', (req, res) => {

    let id = ObjectID.createFromHexString(req.params.id)

    notes.findOne({'_id': id}, (err, note) => {
        if (err) {
            console.log(err)
            res.status(500).send("internal Server Error")
        }
        else {
            (note === null) ? res.status(404).send("Data not found") : res.send(note);
    }
    })
})

app.post('/api/notes', (req, res) => {
    let body = req.body
    notes.insert(body, (err, result) => {
        if (err){
            console.log(err)
            res.status(500).send("Some internal error");
        }
        else{
            res.send(result);
        }
    })
})

app.put('/api/notes/:id', (req, res) => {

    let id = ObjectID.createFromHexString(req.params.id);
    let title = req.body.title;
    let author = req.body.author;
    let numPages = req.body.numPages;
    let newvalues = {$set : {title : `${title}`,author : `${author}`,numPages : `${numPages}`} };
    notes.updateOne({"_id" : id}, newvalues , (err, note) => {
    if (err) {
        console.log(err)
        res.status(500).send("internal Server Error")
    }
    else {
	
        (note === null) ? res.status(404).send("Data not found") : res.status(204).send(note);
    }
    })

})  

app.delete('/api/notes/:id', (req, res) => {

    let id = ObjectID.createFromHexString(req.params.id)

    notes.removeOne({'_id': id}, (err, note) => {
        if (err) {
            console.log(err)
            res.status(500).send("internal Server Error")
        }
        else {
            (note === null) ? res.status(404).send("Data not found") : res.status(204).send(note);
    }
    })
})

})

var server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

