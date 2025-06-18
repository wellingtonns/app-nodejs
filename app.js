const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

// Criação de um registro padrão para métricas
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Métrica customizada de contagem de requisições
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware para contar as requisições
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

// Endpoint de saúde
app.get('/health', (req, res) => {
  res.send('OK');
});

// Endpoint de métricas para Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Endpoint de teste simples
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
