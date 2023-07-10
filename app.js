// requires 
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const md5 = require("md5");
// const encrypt = require("mongoose-encryption");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


// middlewares
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
dotenv.config({path:'config.env'});
app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());


// db connection
const connectDB = async () => {
    try{
        // mongodb connection string
        const con = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected : ${con.connection.host}`);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}
connectDB();

// mongoose.set("useCreateIndex", true);

const userRegSchema = new mongoose.Schema({
    mobile_number: String,
    password: String,
});

userRegSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("Users", userRegSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// routes
app.get('/', (req, res) =>{
    res.render('home');
})
app.get('/login', (req, res) =>{
    res.render('login');
})
app.post('/login', (req, res) => {
    // User.findOne({mobile_number: req.body.m_num})
    //     .then((data) => {
    //         if (data) {
    //             bcrypt.compare(req.body.password, data.password, function(err, result){
    //                 if(err){
    //                     console.log(err);
    //                 } else if (result) {
    //                     res.render('secrets');
    //                     console.log(`User ${req.body.m_num} logged in.`);
    //                 } else {
    //                     console.log("Incorrect Password!");
    //                     res.render('login');
    //                 }

    //             })
    //             // if (data.password === req.body.password){
    //             //     res.render('secrets');
    //             //     console.log(`User ${req.body.m_num} logged in.`);
    //             // } else {
    //             //     console.log("Incorrect Password!");
    //             //     res.render('login');
    //             // }
    //         } else {
    //             console.log("User not found! ");
    //             res.render('login');
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     })


})

app.get('/register', (req, res) =>{
    res.render('register');
})

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()){
        res.render('secrets')
    } else {
        res.redirect("/login")
    }
    
})

app.post('/register', (req, res) => {
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    //     if (err) {console.log(err);}
    //     else {
    //         const newUser = new User({
    //             mobile_number: req.body.m_num,
    //             // password: req.body.password,
    //             // password: md5(req.body.password),
    //             password: hash
    //         });
    //         newUser.save()
    //             .then(() => {res.render("secrets")})
    //             .catch((err) => {console.log(err);})
    //     }
    // })

    User.register({mobile_number: req.body.m_num}, req.body.password, function(err, user) {
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect('/secrets');
            })
        }

    })
})



// hosting
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})


