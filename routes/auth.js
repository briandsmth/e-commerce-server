const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwtoken = require("jsonwebtoken");
const auth_middle = require("../middleware/auth_middleware");

const authRouter = express.Router();


//SIGN UP
authRouter.post('/api/signup', async function (req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already exist!" });
    }

    const cryptPassword = await bcrypt.hash(password, 8);

    let user = new User({
      email,
      password: cryptPassword,
      name,
    })
    user = await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//SIGNIN
authRouter.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    //check email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "This email does not exist!" });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password!" });
    }

    const tkn = jwtoken.sign({id: user._id}, "passwordKey");
    res.json({tkn, ...user._doc})

  } catch (err) {
    res.status(500).json({error: err.message});
  }
})

//Verified token user
authRouter.post('/tokenValid', async (req, res) => {
  try {

    const token = req.header('x-auth-token');
    if (!token) {
      return res.json(false);
    }
    const verified = jwtoken.verify(token, 'passwordKey');

    if (!verified) {
      return res.json(false);
    }

    const user = await User.findById(verified.id)
    if (!user) {
      return res.json(false);
    }

    res.json(true);

  } catch (err) {
    res.status(500).json({error: err.message});
  }
})

//Get Data User
authRouter.get('/', auth_middle, async (req, res)=> {
  const user = await User.findById(req.user);
  res.json({...user._doc, token: req.token});
})

module.exports = authRouter;