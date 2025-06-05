import express from 'express';
import dotenv from 'dotenv';
import searchRouter from './routes/searchRoutes';
import matchRouter from './routes/matchRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/search', searchRouter);
app.use('/match', matchRouter);

app.get('/', (_req, res) => {
  res.send('PriceAggregator is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
