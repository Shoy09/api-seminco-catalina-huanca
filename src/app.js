const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const basicAuth = require('express-basic-auth');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json'); 
const verificarToken = require('./middleware/auth');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', routes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
