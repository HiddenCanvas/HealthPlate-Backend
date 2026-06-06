const app = require('./src/app');
const { PORT } = require('./src/config/env');

app.listen(PORT, () => {
  console.log(`HealthPlate backend listening on port ${PORT}`);
});
