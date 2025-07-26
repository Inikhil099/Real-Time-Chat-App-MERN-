const jwt = require("jsonwebtoken");
const maxage = 3 * 24 * 60 * 60 * 1000;
const secretkey = "password"

function setUser(user) {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
    },
    secretkey,
    {
        expiresIn:maxage
    }
  );
}

function getUser(token) {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
}

module.exports = { setUser, getUser };
