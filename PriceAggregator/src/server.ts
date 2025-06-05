import express from 'express';
import dotenv from 'dotenv';
// Import API route handlers
import { searchRouter } from './routes/searchRoutes';
import { matchRouter } from './routes/matchRoutes';

dotenv.config();

// Initialize Express app and middleware
const app = express();
app.use(express.json());

// Register routers
app.use('/search', searchRouter);
app.use('/match', matchRouter);

// Basic health check endpoint
app.get('/', (_req, res) => {
  res.send('PriceAggregator is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
