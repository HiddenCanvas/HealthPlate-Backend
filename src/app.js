const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const foodRoutes = require('./modules/food/food.routes');
const logsRoutes = require('./modules/logs/logs.routes');
const mealPlansRoutes = require('./modules/meal-plans/mealPlans.routes');
const recipesRoutes = require('./modules/recipes/recipes.routes');
const bookmarksRoutes = require('./modules/bookmarks/bookmarks.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

const authMiddleware = require('./middlewares/auth.middleware');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/food', authMiddleware, foodRoutes);
app.use('/api/logs', authMiddleware, logsRoutes);
app.use('/api/meal-plans', authMiddleware, mealPlansRoutes);
app.use('/api/recipes', authMiddleware, recipesRoutes);
app.use('/api/bookmarks', authMiddleware, bookmarksRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

app.use((req, res) => {
  return res.status(404).json({ success: false, data: null, message: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
