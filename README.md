# TQL Cards API
A credit-card validation api - TalentQL technical assessment submission.

## About
<br />
The API was built using NodeJs only. No frameworks or packages.<br /><br />
I tried to implement it with concepts like Routing, Middleware, and Response methods to make the API development easier and more organized. I also implemented a simple database using JSON files for user authentication<br /><br />

## Endpoints
| S/N | Verb | Endpoint           | Description                                                |
| ---:| ---- | ------------------ | ---------------------------------------------------------- |
|   1 | Get  | /                  | Home route - API Info                                      |
|   2 | Post | /api/register      | Register with username email and Password                  |
|   3 | Post | /api/login         | Login with email and password to get auth token for header |
|   4 | Get  | /api/token         | Requires Bearer Token - Get logged in user user info       |
|   5 | Post | /api/validate-card | Validate Card info                                                           |




## How to use

* Register a user by posting `username`, `email` and `password` to `/api/register`;
* Login to user account by posting `email` and `password` to `/api/login` to get `accessToken`
* Use Access token to send card validation request to `/api/validate-card`



## Sample Test data

* Request
```json
    {
        "cardNumber": "5061021052970696111",
        "expirationDate": "2021-11-31",
        "email": "techybanky@gmail.com",
        "cvv2": "123",
        "phoneNumber": "08069166906",
        "mobile": "+2348069166906"
    }
```

* Response (json - success)
```json
{
    "status": 200,
    "data": {
        "valid": true,
        "message": "Valid Card", 
        "card": {
          ...cardDetails
        }
    }
}
```
## XML Response 
TO get response in XML - simply change the `content-type` in the header to `application/xml`
