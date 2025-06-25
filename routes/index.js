var express = require("express");
var router = express.Router();
const db = require("../db");

/* GET home page. */
router.get("/", async (req, res, next) => {
  // res.send({
  //   message: 'Welcome to the API'
  // });
});

module.exports = router;
