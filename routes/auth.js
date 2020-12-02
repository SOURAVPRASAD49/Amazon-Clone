const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth");
const User = require("../models/user");

const { check, body } = require("express-validator/check");

//login page
router.get('/login', authControllers.getLogin);

router.get('/signup', authControllers.getSignup);

router.post('/login', 
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail()
    ,
    body('password',
        'Password has to be valid'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ,
    authControllers.postLogin
);

router.post('/signup',
  [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail()
        .custom( (value, { req }) => {
            return User.findOne({email: value})
                .then(userDoc => {
                if(userDoc){
                    return Promise.reject(
                        'E-Mail exists already, please pick a different one.'
                    );
                }
            });
        })
    ,
    body('password',
        'Please enter a password with only numbers and text and at lest 5 characters'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ,
    //now password and confirm password should match
    body('confirmPassword')
        .trim()
        .custom( (value, { req }) => {
            if(value !== req.body.password){
                throw new Error('Passwords have to match!');
            }
            return true;
        })
  ],

    authControllers.postSignup
);

router.post('/logout', authControllers.postLogout);

router.get('/reset', authControllers.getReset);

router.post('/reset', authControllers.postReset);

router.get('/reset/:token', authControllers.getNewPassword);

router.post('/new-password', authControllers.postNewPassword);

module.exports = router;

