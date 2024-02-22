const { app } = require('./app.js');
const { PORT = 9090 } = process.env;

console.log(app)

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));