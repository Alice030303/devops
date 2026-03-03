import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
  if (err) {
    console.error('Something bad happened', err);
  } else {
    console.error(`Server is listening on http://localhost:${port}`);
  }
});
