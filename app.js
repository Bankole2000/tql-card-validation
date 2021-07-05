const server = require("./server/index.js");

const app = server();

const PORT = process.env.PORT ?? 3000;

const { getRoutes } = require('./utils/helpers');

const userController = require('./controllers/userController');
const { checkUserAuth } = require("./middleware/userAuth")
app.get('/', (req, res) => {
  res
    .status(200)
    .send({
      message: "Welcome to the card validation API", routes: getRoutes(req)
    });
});

app.get('/api', (req, res) => {
  res
    .status(200)
    .send({
      message: "Welcome to the card validation API", routes: getRoutes(req)
    });
});

app.post("/api/register", userController.registerUser)

app.post("/api/login", userController.loginUser)

app.get("/api/token", checkUserAuth, userController.getUser)

app.post("/api/validate-card", checkUserAuth, userController.validateCard)

app.post("/api/withdraw", checkUserAuth, userController.makeWithdrawal)

app.post("api/deposit", checkUserAuth, userController.makeDeposit)

app.get("api/logout", checkUserAuth, userController.logout)

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});