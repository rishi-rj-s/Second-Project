const jwt = require('jsonwebtoken');
const secretKey = "secret_key"

exports.adminJwtAuth = (req, res, next) => {
    const token = req.cookies.adminJwtAuth;
    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.redirect('/admin/adminLogin');
            } else {
                    next();
            }
        });
    } else {
        res.redirect('/admin/adminLogin');
    }
}

// function userJwtAuth(req, res, next){
//     if(req.cookie && req.cookie.userJwtAuth){
//         next()
//     }else{
//         res.redirect('/user/login')
//     }
// } 

// userJwtAuth();