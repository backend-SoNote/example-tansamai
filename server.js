const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const LineStrategy = require('./lib').Strategy;
const routes = require('./routes.js');
const config = require('./config')
const jwt = require('jsonwebtoken');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(new LinkedInStrategy({
        clientID: config.linkedinAuth.clientID,
        clientSecret: config.linkedinAuth.clientSecret,
        callbackURL: config.linkedinAuth.callbackURL,
        scope: ['r_emailaddress', 'r_liteprofile'],
    }, function (token, tokenSecret, profile, done) {
        return done(null, profile);
    }
));
passport.use(new LineStrategy({
            channelID: config.lineAuth.clientID,
            channelSecret: config.lineAuth.clientSecret,
            callbackURL: config.lineAuth.callbackURL,
            scope: ['profile', 'openid', 'email'],
            botPrompt: 'normal'
        },
        function (accessToken, refreshToken, params, profile, cb) {
            const {email} = jwt.decode(params.id_token);
            profile.email = email;
            return cb(null, profile);
        }
    )
);

app.use('/', routes);

const port = 3000;

app.listen(port, () => {
    console.log('App listening on port ' + port);
});