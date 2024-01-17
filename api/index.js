/* tslint:disable:no-console */
const {  IgApiClient,
  IgLoginTwoFactorRequiredError,} = require("instagram-private-api");

const cors = require ("cors");
const express = require("express");
const Bluebird = require("bluebird");

const app = express();

app.use(express.json());

app.use(cors());

app.get("/api/insta/", async (req, res) => {

  const username = req.body.user;
  const pass = req.body.pass;

  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  const auth = await Bluebird.try(() =>
    ig.account.login(username, pass)
  ).catch(IgLoginTwoFactorRequiredError, (err) => {
    return ig.account.twoFactorLogin({
      twoFactorIdentifier:
        err.response.body.two_factor_info.two_factor_identifier,
      verificationMethod: "1",
      trustThisDevice: "1",
      username: username,
      verificationCode: "000000",
    });
  });
  const accountDetails = await ig.user.info(auth.pk);
  res.json(accountDetails);
  console.log(accountDetails);
});



const port = process.env.PORT || 3001;

app.listen(port);
