// import express from 'express';
import app from './app.js';
// const app = express();

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});
