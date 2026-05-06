// import express       from 'express';
// import cors          from 'cors';
// import helmet        from 'helmet';
// import morgan        from 'morgan';
// import swaggerUi     from 'swagger-ui-express';
// import { swaggerSpec }      from './config/swagger';
// import routes               from './routes';
// import { errorMiddleware }  from './middlewares';

// const app = express();

// app.use(helmet());                           // Security headers

// // Allowed origins — add new domains here as needed
// const allowedOrigins = [
//   'http://localhost:5173',  // Vite dev server (local frontend)
//   'https://succely.in',     // Production domain
//   'http://localhost:7000',
//   'https://identity.zynkly.com',
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (Postman, server-to-server, curl)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     callback(new Error(`CORS: origin '${origin}' is not allowed`));
//   },
//   credentials: true,   // Allow cookies / Authorization headers cross-origin
//   methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Requested-With', 'Accept'],
  
// }));
// app.use(morgan('dev'));                      // Request logging
// app.use(express.json());                     // Parse JSON body
// app.use(express.urlencoded({ extended: true }));

// // Swagger UI — interactive docs at /api-docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
//   swaggerOptions:  { persistAuthorization: true },
//   customSiteTitle: 'Zynkly Identity Service',
// }));

// // Versioned API routes
// app.use('/api/v1', routes);

// // Health check
// app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// // 404 fallback
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
// });

// // Global error handler — MUST be last (4-param signature required by Express)
// app.use(errorMiddleware);

// export default app;





//TEST ALLOW ALL ORIGIN FOR TESTING
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorMiddleware } from './middlewares';

const app = express();

app.use(helmet());

// ✅ Allow ALL origins (including credentials)
app.use(
  cors({
    origin: true, // reflects any origin
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Api-Key',
      'X-Requested-With',
      'Accept',
    ],
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Zynkly Identity Service',
  })
);

// Routes
app.use('/api/v1', routes);

// Health
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use(errorMiddleware);

export default app;