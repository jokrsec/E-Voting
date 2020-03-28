require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');
const cool = require('cool-ascii-faces');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.get('/cool', (req, res) => res.send(cool()));
let saltRounds = 10;


mongoose.connect("mongodb+srv://jokr:Hemanth007@cluster0-ymhul.mongodb.net/evotingUsersDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    voterName: String,
    gender: String,
    dob: Date,
    adhaarNo: Number,
    voterId: Number

});

//userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login", {validation: "normal"});
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/result", function(req, res){
    res.render("result");
});

app.post("/register", function(req, res){
    const email = req.body.email; 
    const password = req.body.newPassword;    

    bcrypt.hash(password, saltRounds, function(err, passwordHash){        
        new User({
            email: email,
            password: passwordHash,
            voterName: req.body.voterName,
            gender: req.body.gender,
            dob: req.body.dob,
            adhaarNo: req.body.adhaarNo,
            voterId: req.body.voterId,
        }).save();
    });

    console.log("Registered New User");
    res.render("submit");

});

app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email}, function(err, foundUser){
        if(foundUser==null){
            console.log("User Doesn't Exist");
            res.render("login", {validation: "nouser"});
        }
        else{
            bcrypt.compare(password, foundUser.password, function(err, result){
                if (result === true){
                    console.log("User LoggedIn");
                    res.render("submit");
                }
                else {
                    console.log("Wrong Password");
                    res.render("login", {validation: "wrong"});
                }
            });
        }   
    });
});


let port = process.env.PORT;
if(port == null || port == "")
    port = 3000;


app.listen(port, function(){
    console.log("listening on port "+port);
});


