// Importações e Configurações iniciais
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const crypto = require('crypto');
const { User, PasswordReset } = require('./models'); // Import models
const initializePassport = require("./passport-config");
const sendMail = require('./mailer'); // Import the sendMail function

initializePassport(
    passport,
    async email => await User.findOne({ where: { email } }),
    async id => await User.findByPk(id)
);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');

// Rotas
app.get('/', (req, res) => {
    res.render("index.ejs", { userAuthenticated: req.isAuthenticated() });
});

app.get('/Login', (req, res) => {
    res.render("Login.ejs", { message: req.flash('error') });
});

app.get('/Register', (req, res) => {
    res.render("Register.ejs");
});

app.get('/Logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/Login');
    });
});


app.get('/Dinosaurs', (req, res) => {
    res.render("Dinosaur.ejs", { userAuthenticated: req.isAuthenticated() });
});

app.get('/News', (req, res) => {
    res.render("News.ejs", { userAuthenticated: req.isAuthenticated() });
});

// Password Reset Routes
app.get('/forgot-password', (req, res) => {
    res.render('ForgotPassword.ejs', { message: req.flash('error') });
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot-password');
        }

        const token = crypto.randomBytes(20).toString('hex');
        await PasswordReset.create({ email, token });

        const mailOptions = {
            to: email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await sendMail(mailOptions);
        req.flash('info', 'An e-mail has been sent to ' + email + ' with further instructions.');
        res.redirect('/forgot-password');
    } catch (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'Error sending the reset email. Please try again later.');
        res.redirect('/forgot-password');
    }
});

app.get('/reset-password/:token', async (req, res) => {
    const token = req.params.token;

    try {
        const resetRequest = await PasswordReset.findOne({ where: { token } });
        if (!resetRequest) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        res.render('ResetPassword.ejs', { token });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error accessing the reset page. Please try again later.');
        res.redirect('/forgot-password');
    }
});

app.post('/reset-password/:token', async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    try {
        const resetRequest = await PasswordReset.findOne({ where: { token } });
        if (!resetRequest) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        const user = await User.findOne({ where: { email: resetRequest.email } });
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot-password');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        await PasswordReset.destroy({ where: { token } });

        req.flash('success', 'Success! Your password has been changed.');
        res.redirect('/Login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error resetting the password. Please try again later.');
        res.redirect('/forgot-password');
    }
});

// Login Route
app.post("/Login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/Login",
    failureFlash: true
}));

// Register Route
app.post("/Register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
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

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
