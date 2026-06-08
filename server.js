const app = require('./src/app');
const { PORT } = require('./src/config/env');
const { startScheduler } = require('./src/scheduler');

app.listen(PORT, () => {
  console.log('HealthPlate backend listening on port ' + PORT);
  startScheduler();
});
