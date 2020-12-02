exports.errorPage = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'page not found',
        path: req.originalUrl,
        isAuthenticated: req.session.isLoggedIn
        //or we can do 
        //path: req.url
        //or
        //path: 'Error'
    });
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
        //or we can do 
        //path: req.url
        //or
        //path: 'Error'
    });
};