const User = require("../models/user");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

//api_user:  
//api_key: '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'
exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'SignUp',
        path: '/signup',
        isAuthenticated: false,
        errorMessage: message,
        oldInput: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
     //validate email 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({email: email})
    .then(user => {
        if(!user){
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                isAuthenticated: false,
                errorMessage: 'Invalid email or password.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: errors.array()
            })
        }
        //let's compare the passwords
        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if(doMatch){
                req.session.user = user;
                req.session.isLoggedIn = true;
                return req.session.save( (err) => {
                    console.log(err);
                    res.redirect('/');
                })
            }
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                isAuthenticated: false,
                errorMessage: 'Invalid email or password.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: errors.array()
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const name = req.body.name;
    //validate email 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            pageTitle: 'SignUp',
            path: '/signup',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: errors.array()
        })
    }
    //first find the email, whether it exitsts
    //inside the database or not
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: {items: []}
            })
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'souravprasaddas2000@gmail.com',
                subject: 'Signup Succeeded!',
                html: '<h1>You successfully signed up!</h1>'
            });
        })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy( (err) => {
        console.log(err);
        res.redirect('/');
    })
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
};

exports.postReset = (req, res, next) => {
    //we will create a special token to check
    //that the link send to the user is sent by us
    //for that we use crypto library
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                req.flash('error', 'No account exists with this email. Please check')
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            //we will send reset password link
            transporter.sendMail({
                to: req.body.email,
                from: 'souravprasaddas2000@gmail.com',
                subject: 'Reset Password',
                html: `
                   <p> You requested a password reset. </p>
                   <p> Here is the Link. </p>
                   <p> Click the <a href="http://localhost:3000/reset/${token}">link </a> to reset password. </p>
                `
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
};

exports.getNewPassword = (req, res, next) => {
    //check whether the token is valid or not
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        let message = req.flash('error');
        if(message.length > 0){
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    let userEmail;
    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
    .then(user => {
        resetUser = user;
        userEmail = user.email;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
        transporter.sendMail({
            to: userEmail,
            from: 'souravprasaddas2000@gmail.com',
            subject: 'Password Change',
            html: `
               <p> You password has changed. </p>
            `
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}