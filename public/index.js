const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const parseJson = require('parse-json');
const bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require("mongoose");
var ObjectID = require('mongodb').ObjectID;
var Users = require('./UserSchema');
var exports = module.exports = {};
mongoose.connect("mongodb://localhost:27017/login");
var db = mongoose.connection;
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
     console.log("Connection succeeded to Mongodb using Mongoose");
})

MongoClient.connect('mongodb://localhost:27017/login', function (err, client) {
let db = client.db('users')
let loginUser = db.collection('users')
  if (err) throw err

    app.get('/login/', (req,res) => {
        console.log("Login API")
        res.render('login', {
            title:'Login to Personal Notes',
        })
    })

    app.get('/api/login/', (req, res) => {
        loginUser.find().toArray((err, result) => {
            if (err) throw err;
            else{
                (result === null) ? res.status(404).send("Data not found") : res.status(200).send(result);
                console.log("ELSE part")
                console.log(result)
            }   
        });
    })  
    
    app.get('/register/', (req,res) => {
        console.log("Register API")
        res.render('register', {
            title:'Register to add Personal Notes',
        })
    })
    app.post('/api/login', (req,res) => {
        console.log("Login API")
        console.log(req.body);
        let userSchema = new Users(req.body);
        userSchema.save((err, data)=>{
            if (err) {
                console.log(err)
                res.status(500).send("internal Server Error")
            }else{
                res.send(data);
            }
        })
    }) 
 

    app.post('/api/register', (req,res) => {
        console.log("Register API")
        console.log(req.body);
        let userSchema = new Users(req.body);
        userSchema.save((err, data)=>{
            if (err) {
                console.log(err)
                res.status(500).send("internal Server Error")
            }else{
                res.send(data);
            }
        })
    }) 
    
})
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
    });
})

app.get('/api/notes/', (req, res) => {
        notes.find().toArray((err, result) => {
            if (err) throw err;
            else{
                (result === null) ? res.status(404).send("Data not found") : res.status(200).send(result);
            }   
        });
    })  

app.post('/api/notes/search', (req, res) => {
        let body = req.body;
       // notes.createIndex({message : "text"})
       notes.find({message : {"$regex"  : body.searchText}}).toArray((err, data)=>{
        if (err){
            console.log(err)
            res.status(500).send("Some internal error");
        }
        else{
            res.send(data);
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
    let body = req.body;
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
    let subject = req.body.subject;
    let author = req.body.author;
    let message = req.body.message;
    let noteLength = req.body.noteLength;
    let noteTime  = req.body.noteTime;
    let newvalues = {$set : {subject : `${subject}`,author : `${author}`,message : `${message}`,noteLength : `${noteLength}`,noteTime : `${noteTime}`}};
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
    let id = ObjectID.createFromHexString(req.params.id);
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

