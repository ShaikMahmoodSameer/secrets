// requires 
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const encrypt = require("mongoose-encryption");



// middlewares
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
dotenv.config({path:'config.env'});


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

const userRegSchema = new mongoose.Schema({
    mobile_number: String,
    password: String,
});

userRegSchema.plugin(encrypt, {secret: process.env.SCRT_KEY, encryptedFields: ["password"]});
const User = new mongoose.model("Users", userRegSchema);


// routes
app.get('/', (req, res) =>{
    res.render('home');
})
app.get('/login', (req, res) =>{
    res.render('login');
})
app.post('/login', (req, res) => {
    User.findOne({mobile_number: req.body.m_num})
        .then((data) => {
            if (data) {
                if (data.password === req.body.password){
                    res.render('secrets');
                    console.log(`User ${req.body.m_num} logged in.`);
                } else {
                    console.log("Incorrect Password!");
                    res.render('login');
                }
            } else {
                console.log("User not found! ");
                res.render('login');
            }
        }).catch((err) => {
            console.log(err);
        })
})
app.get('/register', (req, res) =>{
    res.render('register');
})
app.post('/register', (req, res) => {
    const newUser = new User({
        mobile_number: req.body.m_num,
        password: req.body.password
    })
    
    newUser
        .save()
        .then(()=>{
            res.render('secrets')
        })
        .catch((err)=>{
            console.log(err);
        })
})



// hosting
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})


