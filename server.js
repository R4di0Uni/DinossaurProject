if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const path = require("path")
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")

initializePassport(
    passport,
    email=>users.find(user => user.email == email),
id => users.find(user => user.id === id))



const users = [];

app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());




app.use(express.static("public"));
app.set('views', path.join(__dirname, 'public', 'views'));

app.post("/Login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/Login",
    failureFlash:true
}))

//Configure Register
app.post("/Register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
       
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users);
        res.redirect("/Login");
    } catch (error) {
        console.error(error);
        res.redirect("/Register");
    }
});

app.get('/', (req, res) => {
    res.render("index.ejs", { userAuthenticated: req.isAuthenticated() });
});





app.get('/Login', (req, res) => {
    res.render("Login.ejs", { message: req.flash('error') });
});

app.get('/Register', (req, res) => {
    res.render("Register.ejs");
});

app.get('/Dinosaurs', (req, res) => {
    res.render("Dinosaur.ejs");
});

app.get('/News', (req, res) => {
    res.render("News.ejs");
});




app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
