const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ msg: "Please fill in all fields." });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ msg: "Invalid email." });
      }

      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: "This email already exists." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = { name, email, password: hashedPassword };

      const activateToken = createActivateToken(newUser)

      const url = `${process.env.CLIENT_URL}/user/activate/${activateToken}`
      sendMail(email, url)

       res.json(newUser);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

function createActivateToken(payload) { 
  return jwt.sign(payload, process.env.JWT_ACTIVATE_TOKEN, {expiresIn: '5m'})
}

function createAccessToken(payload) { 
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn: '15m'})
}

function createRefreshToken(payload) { 
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: '7d'})
}

function validateEmail(email) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

module.exports = userCtrl;
