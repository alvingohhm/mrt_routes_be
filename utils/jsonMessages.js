const jsonMessages = (process, message, data) => {
  const result = {
    process: process === "yes" ? "passed" : "failed",
    message,
    data,
  };

  return result;
};

module.exports = jsonMessages;
