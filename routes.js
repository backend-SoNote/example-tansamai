const passport = require("passport");
const express = require("express");
var connection = require('./lib/db');
const router = express.Router();

router.get("/auth/linkedin",
    passport.authenticate("linkedin", {
        scope: ["r_emailaddress", "r_liteprofile"],
    })
);

router.get("/auth/linkedin/callback",
    passport.authenticate("linkedin", {
        successRedirect: "/",
        failureRedirect: "/login",
    })
);

router.get("/auth/line", passport.authenticate("line"));

router.get("/auth/line/callback",
    passport.authenticate("line", {
        successRedirect: "/",
        failureRedirect: "/login",
    })
);

router.post('/login', function (req, res, next) {
    var user = {
        uid: req.body.uid,
        provider: req.body.provider,
    }
    connection.query('SELECT * FROM users WHERE uid = ? AND provider = ?', user, function  (err, data, fields) {
        if (err) throw err
        if (data.length >= 0) {
            res.status(201).json({
                status: "success",
                data: data,
            });
        }
    })
})

router.post('/register', function (req, res, next) {
    req.assert('name', 'Name is required').notEmpty()
    req.assert('uid', 'uid is required').notEmpty()
    req.assert('provider', 'Provider is required').notEmpty()
    var errors = req.validationErrors()
    if (!errors) {
        var user = {
            name: req.sanitize('name').escape().trim(),
            uid: req.sanitize('uid').escape().trim(),
            provider: req.sanitize('provider').escape().trim(),
        }
        connection.query('INSERT INTO users SET ?', user, function (err, data, fields) {
            res.status(201).json({
                status: "success",
                message: "Register Success!",
            });
        })
    } else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '<br>'
        })
        module.exports = (err, req, res, next) => {
            err.statusCode = err.statusCode || 500;
            err.status = err.status || "error";
            res.status(err.statusCode).json({
                status: err.status,
                message: error_msg,
            });
        };

    }
})

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;