const FieldValidator = require("../utils/FieldValidator");
const dataBase = require('../utils/data');
const helpers = require('../utils/helpers');
const config = require('../utils/config');

const registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  const fieldValidator = new FieldValidator(req.body);
  fieldValidator
    .isValidEmail(email)
    .isValidPassword(password)
    .isValidUsername(username)
  const { data, errors } = fieldValidator;
  if (!errors.length) {
    const { err, data } = await dataBase.read('users', email)

    if (err) {
      const hashedPassword = helpers.hash(password);

      if (hashedPassword) {
        const cards = [], balance = 0;
        const userObject = {
          username,
          email,
          hashedPassword,
          cards,
          balance
        }
        const { err: createError } = await dataBase.create('users', email, userObject)
        if (!createError) {
          return res.status(200).send({ message: "Successfully registered", user: { username, email, cards, balance } });
        }
      }
    } else {
      res.status(409).send({ message: "This user already exists" })
    }
  } else {
    res.status(400).send({ message: "Invalid Data", errors, data });


    return;
  }
}

const loginUser = async (req, res) => {
  const { password, email } = req.body;
  const fieldValidator = new FieldValidator(req.body);
  fieldValidator
    .isValidEmail(email)
    .isValidPassword(password)
  const { data, errors } = fieldValidator;
  if (!errors.length) {
    const { err, data: userData } = await dataBase.read('users', email)
    if (!err) {
      const hashedPassword = helpers.hash(password);
      if (hashedPassword == userData.hashedPassword) {
        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + 1000 * 60 * 60 * 24;
        const tokenObject = {
          email,
          accessToken: tokenId,
          expires,
        };
        const { err: createError } = await dataBase.create('tokens', tokenId, tokenObject);
        if (!createError) {
          delete userData.hashedPassword
          res.status(200).send({ message: "Login Successful", user: userData, tokenObject })
        }
      } else {
        res.status(401).send({ message: "Incorrect email or password" })
      }
    } else {
      res.status(404).send({ message: "No User with this email" })
    }
  } else {
    res.status(400).send({ message: "Invalid Data", errors, data });


    return;
  }
}

const getUser = async (req, res) => {

  const { authData } = req
  const { err, data } = await dataBase.read('users', authData.email)
  if (!err) {
    delete data.hashedPassword;
    res.status(200).send({ message: "Success - Here are your user details", user: data })
    return;
  } else {
    res.status(404).send({ message: "User not found" })
  }
}

const validateCard = async (req, res) => {

  const { authData } = req;
  const { cardNumber, expirationDate, email, cvv2, phoneNumber, mobile } = req.body;
  const fieldValidator = new FieldValidator(req.body);
  fieldValidator
    .isValidCardNumber(cardNumber)
    .isNotExpired(expirationDate)
    .isValidEmail(email)
    .isValidCVV(cvv2)
    .checkMobileNumber(mobile)
    .isLuhnValid(cardNumber)


  const { errors, data: cardData } = fieldValidator;
  if (!errors.length) {
    cardData.issuer = helpers.creditCardType(cardNumber) ? helpers.creditCardType(cardNumber) : 'Unknown';
    console.log(helpers.creditCardType(cardNumber));
    const { err: readError, data: userData } = await dataBase.read('users', authData.email);

    // if (readError) {
    //   console.log({ readError });
    // }
    // console.log({ userData });

    if (userData.cards.length > 0 && helpers.hasUsedCardBefore(userData.cards, cardNumber)) {
      userData.cards.forEach(card => {
        if (card.cardNumber == cardData.cardNumber) {
          // console.log({ message: "Formerly Used Card" });
          card = JSON.parse(JSON.stringify(cardData));
        }
      });
    } else {
      userData.cards.push(cardData)
    }
    const { err: updateError } = await dataBase.update('users', authData.email, userData)
    if (!updateError) {
      res.status(200).send({ valid: true, message: "Valid Card", card: cardData })
    }
  } else {
    res.status(400).send({ valid: false, message: "Invalid Card", errors })
  }

}

const checkBalance = async (req, res) => {

}

const makeWidthdrawal = async (req, res) => {

}

const makeDeposit = async (req, res) => {

}

module.exports = { registerUser, loginUser, getUser, validateCard, makeWidthdrawal, makeDeposit, checkBalance }