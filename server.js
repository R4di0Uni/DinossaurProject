const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const path = require("path")

const users = [];

app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.set('views', path.join(__dirname, 'public', 'views'));


app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        res.redirect("/Login");
    } catch (error) {
        console.error(error);
        res.redirect("/Register");
    }
});

app.get('/', (req, res) => {
    res.render("index.ejs");
});



app.get('/Login', (req, res) => {
    res.render("Login.ejs");
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
