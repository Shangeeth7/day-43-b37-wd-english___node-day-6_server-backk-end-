const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Token = require("../models/tokenModel");

module.exports = async (user, mailType) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const encryptedToken = bcrypt
      .hashSync(user._id.toString(), 10)
      .replaceAll("/", "");
    const token = new Token({
      userid: user._id,
      token: encryptedToken,
    });
    await token.save();
    let mailOptions, emailContent;
    if (mailType === "verifyemail") {
      emailContent = `<div >
      <h2 style="color:orange;" >URL <span style="color:grey;" > | URL Shortner .</span> <h2> 
     <br />
      <a  href="https://glowing-lolly-2bddda.netlify.app/verifyemail/${encryptedToken}"><span style="color:grey;font-size:15px;" >Click here to Verify  e-mail</span></a> 
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
     
      <span style="color:grey;font-size:10px;" > © Copyright 2022 - URL Shortner All Rights Reserved.</span>
      </div>`;

      mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Verify Email | URL Login",
        html: emailContent,
      };
    } else {
      emailContent = `<div >
      <h2 style="color:orange;" >URL <span style="color:grey;" > | URL Shortner .</span> <h2> 
     <br />
      <h2 style="color:grey;font-size:15px;">Hello <span style="color:orange;font-size:17px;">${user.name}</span></h2>
      <p style="color:grey;font-size:15px;"> Welcome to URL Shortner
      </p>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
     
      <span style="color:grey;font-size:10px;" > © Copyright 2022 - URL Shortner All Rights Reserved.</span>
      </div>`;

      mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Welcome to URL | A URL Shortner",
        html: emailContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
