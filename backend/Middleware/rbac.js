const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Admin access only",
    });
  }

  next();
};

const isVoter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "voter") {
    return res.status(403).json({
      status: 403,
      message: "Voter access only",
    });
  }

  next();
};

module.exports = { isAdmin, isVoter };
