//this is auth middleware is required
//to protect our routes from unauthenticated users
module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    next();
}