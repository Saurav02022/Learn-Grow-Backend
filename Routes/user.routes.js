const express = require("express");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { UserModel } = require("../Model/user.model");
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get("/", async (req, res) => {
  const query = req.query._limit;
  const pages = req.query._page;
  try {
    const users = await UserModel.find()
      .limit(query)
      .skip((pages - 1) * query);
    res.send(users);
  } catch (err) {
    res.send(err.message);
  }
});

userRouter.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    let user = await UserModel.find({ email });
    if (user.length === 0) {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          const user = new UserModel({ name, email, password: hash, phone });
          await user.save();
          res.send("User Registered successful !");
        }
      });
    } else {
      res.send("Already Registerd ! Please Login !");
    }
  } catch (err) {
    res.send(err);
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.find({ email: email });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, async (err, result) => {
        if (result) {
          var token = jwt.sign({ userID: user[0]._id }, "newuser");
          res.send({
            msg: "Logged in !",
            usertoken: token,
            id: user[0]._id,
            name: user[0].name,
          });
        } else {
          res.send({ msg: "Wrong Credentials !" });
        }
      });
    } else {
      res.send("Authentication Failed !");
    }
  } catch (err) {
    res.send(err);
  }
});
userRouter.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await UserModel.findByIdAndDelete({ _id: id });
    res.send("user deleted !");
  } catch (err) {
    res.send(err);
  }
});

module.exports = {
  userRouter,
};
