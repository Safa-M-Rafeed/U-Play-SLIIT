const loginRedirect = (req, res, next) => {
  const { redirectUrl } = req.session || {};
  if (redirectUrl) {
    delete req.session.redirectUrl;
    return res.redirect(redirectUrl);
  }
  res.redirect("/dashboard");
};

const saveRedirectUrl = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
  }
  next();
};

module.exports = { loginRedirect, saveRedirectUrl };
