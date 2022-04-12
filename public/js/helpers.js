function checkAuthentication (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please log in to access this page');
        res.redirect('/users/login');
    }
}

exports.checkAuthentication = checkAuthentication;