

// Dependencies
const crypto = require('crypto');

const config = require('./config');
const dataBase = require('./data');

//  SECTION: DESCRIPTION: Helpers for various tasks
// CONTAINER:
const helpers = {};

// Create a SHA256 has
helpers.hash = (str) => {
  if (typeof str == 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// FUNCTION: Parse a JSON string to an object in all cases, without throwing an error
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    // console.log(e);
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // define all possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      // Get a random character and append to final string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

// FUNCTION: Verify if a given token_id is currently valid for a given user
helpers.verifyToken = async (id, email, callback) => {
  // STORE: READ: Lookup the token
  dataBase.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // CHeck that the token is for the given user and has not expired
      if (tokenData.email == email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

helpers.hasUsedCardBefore = (userCards, cardNumber) => {
  oldNumbers = userCards.map(card => card.cardNumber);

  const formerUse = userCards.filter(card => card.cardNumber == cardNumber);
  if (formerUse.length > 0) {
    return true
  }
  return false;
}

helpers.creditCardType = (cc) => {
  let amex = new RegExp("^3[47][0-9]{13}$");
  let visa = new RegExp("^4[0-9]{12}(?:[0-9]{3})?$");
  let cup1 = new RegExp("^62[0-9]{14}[0-9]*$");
  let cup2 = new RegExp("^81[0-9]{14}[0-9]*$");

  let mastercard = new RegExp("^5[1-5][0-9]{14}$");
  let mastercard2 = new RegExp("^2[2-7][0-9]{14}$");

  let disco1 = new RegExp("^6011[0-9]{12}[0-9]*$");
  let disco2 = new RegExp("^62[24568][0-9]{13}[0-9]*$");
  let disco3 = new RegExp("^6[45][0-9]{14}[0-9]*$");

  let diners = new RegExp("^3[0689][0-9]{12}[0-9]*$");
  let jcb = new RegExp("^35[0-9]{14}[0-9]*$");

  if (visa.test(cc)) {
    return "VISA";
  }
  if (amex.test(cc)) {
    return "AMEX";
  }
  if (mastercard.test(cc) || mastercard2.test(cc)) {
    return "MASTERCARD";
  }
  if (disco1.test(cc) || disco2.test(cc) || disco3.test(cc)) {
    return "DISCOVER";
  }
  if (diners.test(cc)) {
    return "DINERS";
  }
  if (jcb.test(cc)) {
    return "JCB";
  }
  if (cup1.test(cc) || cup2.test(cc)) {
    return "CHINA_UNION_PAY";
  }
  return undefined;
};

helpers.getRoutes = (req) => {

  const baseURL = 'http://' + req.headers.host + '/api/';
  return [
    {
      name: "home",
      path: `/`,
      url: `${baseURL}`,
      method: "GET",
      description: "Welcome Route",
      data: null,
      authorization: null
    },
    {
      name: "register",
      path: `/api/register`,
      url: `${baseURL}register`,
      method: "POST",
      description: "Register to get a new Auth token",
      data: null,
      authorization: null
    },
    {
      name: "Check Token",
      path: `/api/token`,
      url: `${baseURL}token`,
      method: "GET",
      description: "Check Auth Status - also check account balance and cards",
      data: null,
      authorization: "Bearer token in header"
    },
    {
      name: "Login",
      path: `/api/login`,
      url: `${baseURL}login`,
      method: "POST",
      description: "Login with email and password to get access Token. Access token is needed in authorization header for authenticated routes",
      data: "email, password",
      authorization: null
    },
    {
      name: "Validate A Card",
      path: `/api/validate-card`,
      url: `${baseURL}validate-card`,
      method: "POST",
      description: "Validate A Card - adds card to user account",
      data: "Card details",
      authorization: "Bearer token in header",
    },
    {
      name: "Widthdraw",
      path: `/withdraw`,
      url: `${baseURL}withdraw`,
      method: "POST",
      description: "Widthdraw or make payment with card",
      data: "Card details, amount to widthraw",
      authorization: "Bearer token in header",
    },
    {
      name: "Deposit",
      path: `/api/deposit`,
      url: `${baseURL}deposit`,
      method: "POST",
      description: "Deposit Funds into your account to increase your balance",
      data: "Card details, amount to deposit",
      authorization: "Bearer token in header",
    },
    {
      name: "Logout",
      path: `/api/logout`,
      url: `${baseURL}logout`,
      method: "GET",
      description: "Logout of your session and destroy accessToken",
      data: null,
      authorization: "Bearer token in header",
    },

  ]
}


// Export the module
module.exports = helpers;
