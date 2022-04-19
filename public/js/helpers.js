function checkAuthentication (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please log in to access this page');
        res.redirect('/users/login');
    }
}

function limitUserAccess (req, res, userType) {
    if (!req.user._id) { return res.status(401).send(); }
    if (req.user.isAdmin) { return }
    if (userType === 'discord') {
        if (!req.user.isDiscord) { return res.status(401).send(); }
    } else if (userType === 'twitch') {
        if (!req.user.isDiscord) { return res.status(401).send(); }
    } else { 
        console.log('Wrong limitedUserAccess');
        return res.status(401).send();
    }
}

exports.checkAuthentication = checkAuthentication;
exports.limitUserAccess = limitUserAccess;