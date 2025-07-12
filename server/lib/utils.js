const JWT = require("jsonwebtoken");
const generateToken = (user, res) => {
  const token = JWT.sign(
    {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.cookie("JWT", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = { generateToken };
