const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const authMiddleware = async (req, res, next) => {
     try {
          const token = req.cookies.userJwtAuth;
          console.log(process.env.KEY);
          if (token) {
               const decoded = jwt.verify(token, process.env.KEY);
               const user = await userModel.findOne({ email: decoded.email });

               if (user && user.status !== false) {
                    req.user = user;
                    return next(); 
               } else {
                    return res.redirect('/user/login?msg=userBlocked');
               }
          } else {
               req.user = null;
               return next(); 
          }
     } catch (err) {
          console.log(err);
          res.status(500).send(err);
     }
};

module.exports = authMiddleware;