const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

require("dotenv").config();
const dbConfig = require("./config/dbConfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");

const path = require("path");

app.use("/api/user", userRoute);

const port = process.env.PORT || 7602;

app.get("/", (req, res) =>
  res.send(` 
<div style="padding-left:20px;height:100vh;max-width:200vh;background-image: url('https://hdwallpaperim.com/wp-content/uploads/2017/08/25/454968-computer-artwork-modern.jpg'); ">
<div style="padding-top:50px;">
<h2 style="color:white;">Hey it's the Backend Server for <span style="color:orange;" >URL Shortner .</span> <h2>   <br />
<a href="https://glowing-lolly-2bddda.netlify.app" style="color:white;"> Click here for <span style="color:orange;padding-left:5px;" >  URL Shortner - frontend.</span> </a>
</div>
</div>

`)
);
app.listen(port, () => console.log(`Node Express Server Started at ${port}!`));
