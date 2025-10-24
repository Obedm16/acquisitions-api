import express from 'express';

const app = express();

// const PORT = process.env.PORT || 4001;

// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}...`)
// })

app.get('/', (req, res) => {
  res.status(200).send('You are interating with acquisitions!');
});

export default app;
