const dataBase = require("../utils/data");

const checkUserAuth = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized - You need to login to access this route" })
    return;
  }
  const token = authHeader.split(' ')[1];
  const { err, data } = await dataBase.read('tokens', token)

  if (!err) {
    if (data.expires < Date.now()) {
      res.status(401).send({ message: "Token Expired - you need to login again" })
      return;
    }
    req.authData = data;
  } else {
    res.status(401).send({ message: "Unauthorized - You need to be logged in to access this route" })
    return;
  }
}

const cardIsValid = async (req, res) => {

}

module.exports = { checkUserAuth }