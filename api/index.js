/* tslint:disable:no-console */
const {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} = require("instagram-private-api");
const express = require("express");
const Bluebird = require("bluebird");

const app = express();

app.use(express.json());

app.use(cors());

app.get("/api/insta", async (req, res) => {

  const username = req.query.user;
  const pass = req.query.pass;

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
  const accountDetails = await ig.user.info(auth.pk).json();
  res.json(accountDetails);
    console.log(accountDetails);
});

const port = process.env.PORT || 3000;

app.listen(port);
