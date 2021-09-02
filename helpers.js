


const getUserByEmail = function(email, users) {
  for (const id in users) {
    if (email === users[id].email) {
      let user = users[id];
      return user;
    }
  }
  return undefined;
};

const generateRandomString = function() {
  const result = Math.random().toString(36).substring(2, 8);
  return result;
};

module.exports = { getUserByEmail, generateRandomString };