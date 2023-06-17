////////////////////////////////////////
//All Imports

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");

const app = express();

const PORT = process.env.PORT || 8080;

////////////////////////////////////////
// All routes and middleware

app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

app.use(authRoutes);
app.use(roomRoutes);

app.listen(PORT, () => {
  console.log("I am ready!");
});
