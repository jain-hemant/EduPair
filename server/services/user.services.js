function sanitizeUser(user) {
  let safeUserObject = null;

  if (user) {
    safeUserObject = {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
    };
  }
  return safeUserObject;
}

export { sanitizeUser };
