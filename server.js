const app = require("./app");
//////////////////////////////////
// initialize
//////////////////////////////////
const PORT = process.env.PORT || 5000;

//////////////////////////////////
// listening
//////////////////////////////////
app.listen(PORT, () => {
  console.log(`
  ⚡  Using Environment = ${process.env.NODE_ENV}
  🚀  Server is running
  🔉  Listening on port ${PORT}
  `);
});
