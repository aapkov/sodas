const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
    // local strategy
    passport.use(new LocalStrategy((username, password, done) =>{
        let query = {username:username};
        User.findOne(query, (error, user)=> {
            if(error) throw error;
            if(!user) return done(null, false, {message:'No user'});

            bcrypt.compare(password, user.password, (error, isMatch) => {
                if(error) throw error;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message:'Wrong user or password'});
                }
            })

        });
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    })
}