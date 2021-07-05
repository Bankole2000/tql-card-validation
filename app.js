// const CardController = require("./controllers/cardController.js");

// const Validate = require("./middleware/Validate.js");
const server = require("./server/index.js");


const app = server();

const PORT = process.env.PORT ?? 3000;


const getRoutes = (req) => {

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
      description: "Check Auth Status",
      data: null,
      authorization: "Bearer token in header"
    },
    {
      name: "Login",
      path: `/api/login`,
      url: `${baseURL}login`,
      method: "GET",
      description: "Login with email and password to get access Token. Access token is needed in authorization header for authenticated routes",
      data: null,
      authorization: null
    },
    {
      name: "Validate A Card",
      path: `/api/validate-card`,
      url: `${baseURL}validate-card`,
      method: "GET",
      description: "Validate A Card",
      data: null,
      authorization: "Bearer token in header",
    },
    {
      name: "Get own cards",
      path: `/cards`,
      url: `${baseURL}/cards`,
      method: "GET",
      description: "Get Validated cards",
      data: null,
      authorization: "Bearer token in header",
    },
    {
      name: "Validate A Card",
      path: `/card/validate`,
      url: `${baseURL}/card/validate`,
      method: "GET",
      description: "Validate A Card",
      data: null,
      authorization: "Bearer token in header",
    },

  ]
}

const userController = require('./controllers/userController');
const { checkUserAuth } = require("./middleware/userAuth")
app.get('/', (req, res) => {
  res
    .status(400)
    .send({
      message: "Welcome to the card validation API", routes: getRoutes(req)
    });
});

app.post("/api/register", userController.registerUser)

app.post("/api/login", userController.loginUser)

app.get("/api/token", checkUserAuth, userController.getUser)

app.post("/api/validate-card", checkUserAuth, userController.validateCard)

// app.post("/api/widthdraw", checkAuth, checkCard, userController.makeWidthdrawal)

// app.post("api/deposit", checkAuth, checkCard, userController.makeDeposit)

// app.get("/test", (req, res) => {
//   res.status(400).send({ message: "Hello Test" })
// })

// app.post('/api', (req, res) => {
//   console.log({ data: req.body });
// });

// app.get('/api', (req, res) => {
//   res.status(400).send({ message: "Hello api" })
// });


app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});