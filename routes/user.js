const express = require("express");
const router = express.Router();
const { registerUser, authUser, allUsers } = require("../controllers/user");

router.route("/").post(registerUser).get(allUsers);
router.post("/login", authUser);

module.exports = router;
