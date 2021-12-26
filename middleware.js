module.exports.isLoggedIn = (req, res, next) => {

    //ensures user must be signed in
    if(!req.isAuthenticated()){
        //store url user is requesting so we can go back after user logs in
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please sign in');
        return res.redirect('/login');
    }
    next();
}

