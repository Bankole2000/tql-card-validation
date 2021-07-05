# TQL Cards API
A credit-card validation api - TalentQL technical assessment submission.

## About
<br />
The API was built using NodeJs only. No frameworks or packages.<br /><br />
I tried to implement it with concepts like Routing, Middleware, and Response methods to make the API development easier and more organized. I also implemented a simple database using JSON files for user authentication, storing user cards, and making withdrawals and deposits<br /><br />

## Endpoints
| S/N | Verb | Endpoint           | Description                                                |
| ---:| ---- | ------------------ | ---------------------------------------------------------- |
|   1 | Get  | /                  | Home route - API Info                                      |
|   2 | Post | /api/register      | Register with username email and Password                  |
|   3 | Post | /api/login         | Login with email and password to get auth token for header |
|   4 | Get  | /api/token         | Requires Bearer Token - Get logged in user user info       |
|   5 | Post | /api/validate-card | Validate Card info                                         |
|   6 | Post | /api/deposit       | Requires Bearer token, valid card details and `amount` field             |
|   7 | Post | /api/withdraw      | Requires Bearer token, valid card details and `amount` field                                                           |



## How to use

* Clone this repository
* No need for `npm install` you can just run it right away - `node app.js`
* All Data can be posted as JSON, Form-Data, x-www-form-url-encoded or xml.
* Register a user by posting `username`, `email` and `password` to `/api/register`;
* Login to user account by posting `email` and `password` to `/api/login` to get `accessToken`
* Use Access token in request header `Authorization: Bearer <accessToken>` to send card validation request to `/api/validate-card`
* Whenever the user validates a card, it gets added to the user data. If the card has been validated before, the card gets updated in the user data
* Users can add to their account balance by making a deposit with valid card details
* Users can withdraw or charge their card by making a withdrawal. 



## Sample Test data

* Sample Validate card Request (`POST` to `/api/validate-card` with `Authorization: Bearer <token>` header)
```js
    {
        "cardNumber": "5061021052970696111",
        "expirationDate": "2021-11-31",
        "email": "techybanky@gmail.com",
        "cvv2": "123",
        "phoneNumber": "08069166906",
        "mobile": "+2348069166906"
        //"amount": 100
    }
```
add `amount` field if you want to deposit or withdraw (`POST` to `/api/deposit` or `/api/withdraw` with `Authorization: Bearer <token>` header)

* Response (json - success)
```js
{
    "status": 200,
    "data": {
        "valid": true,
        "message": "Valid Card", 
        "card": {
          //...cardDetails
        }
    }
}
```
## XML Response 
To get response in XML - simply change the `content-type` in the header to `application/xml`

## To get accessToken 
send Signup data to `/api/register` with `username`, `email`, and `password`, eg:  
```js
  {
    "username": "John Doe", 
    "email": "john@doe.com", 
    "password": "acoolpassword"
  }
```
Then Login to `/api/login` with `email` and `password`, e.g:
```js
  {
    "email": "your@email.com", 
    "password": "yoUrP5AsSW01Rd"
  }
```

