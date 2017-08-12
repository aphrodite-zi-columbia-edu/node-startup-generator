var regexp = /^[a-zA-Z0-9-_]+$/;

module.exports = function onlyAlphaNumericDashOrUnderscore(name) {
  if (name.search(regexp) == -1)
    return false;
  else
    return true;
};
