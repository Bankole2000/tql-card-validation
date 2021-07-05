const helpers = require('./helpers');
const cardNumberRegex = /^[0-9]{12,19}$/;
const CVVRegex = /^[0-9]{3,4}$/;
const phoneNumberRegex = /^(\+?234|0)([0-9]{10})$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// const dateRegex = /^(0[1-9]|1[0-2])\/?([0-9]{4})$/;


class FieldValidator {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  isValidCardNumber = (cardNumber) => {
    if (!cardNumber || !cardNumber.trim()) {
      this.errors.push({ cardNumber: "Card Number is required" });
    }
    if (!cardNumberRegex.test(cardNumber)) {
      this.errors.push({ cardNumber: "Card Number must be from 12 - 19 digits" });
    } else {
      this.data.cardNumber = cardNumber.trim()
    }
    return this;
  }

  isValidEmail = (email) => {
    if (!email || !email.trim()) {
      this.errors.push({ email: "Email is required" });

    }
    if (!emailRegex.test(email)) {
      this.errors.push({ email: "Invalid Email" });
      this.data.email = null;
    } else {
      this.data.email = email.trim()
    }
    return this;
  }

  isValidUsername = (username) => {
    if (!username || !username.trim()) {
      this.errors.push({ username: "Username is required" });
      this.data.username = null;
    } else {
      this.data.username = username.trim()
    }
    return this;
  }

  isValidPassword = (password) => {
    if (!password || !password.trim()) {
      this.errors.push({ password: "Password is required" });
      this.data.password = null;
    } else {
      this.data.password = password.trim()
    }
    return this;
  }

  isValidCVV = (cvv2) => {
    if (!CVVRegex.test(cvv2)) {
      this.errors.push({ cvv2: "CVV2 must be 3 or 4 digits" });
    } else {
      this.data.cvv2 = cvv2.trim()
    }
    return this;
  }

  checkMobileNumber = (mobile) => {
    if (!mobile || !mobile.trim()) {
      this.data.mobile = null;
      return this
    }
    if (mobile.trim().length >= 11) {
      this.data.countryCode = "+234"
      this.data.mobile = mobile
    }
    return this
  }

  isNotExpired = (expirationDate) => {
    if (!expirationDate || !expirationDate.trim()) {
      this.errors.push({ expirationDate: "Expiration Date is required" });
      this.data.expirationDate = null;
      return this
    }
    const expiration = new Date(expirationDate);
    const today = new Date;

    if (isNaN(expiration.getTime())) {
      this.errors.push({ expirationDate: "Invalid Expiry Date" });
    } else if (today > expiration) {
      this.errors.push({ expirationDate: "Invalid Card - Card Expired" });
    }
    return this
  }

  isLuhnValid = (cardNumber) => {
    if (!cardNumber || !cardNumber.trim()) {
      this.errors.push({ isLuhnValid: false });
      return this
    }
    let sumOfDigits = 0;
    let isEvenPosition = false;

    for (let index = cardNumber.length - 1; index >= 0; index--) {
      let currentDigit = Number(cardNumber[index]);

      // if digit is in even position, multiply by 2
      if (isEvenPosition) {
        currentDigit *= 2;
      }

      sumOfDigits += Math.floor(currentDigit / 10); // add the digit in the tens position
      sumOfDigits += currentDigit % 10; // add the digit in the units position

      isEvenPosition = !isEvenPosition; // flip the even position checker
    }

    if (sumOfDigits % 10 === 0) {
      this.data.isLuhnValid = true;

    } else {
      this.errors.push({ isLuhnValid: false });
    }
    return this
  }
}

module.exports = FieldValidator