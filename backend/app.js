require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000',
    exposedHeaders: ['Content-Type']
}));
app.use(express.json());

// Rate Limiting
// const uploadLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 min
//     max: 20, // limit each IP to 20 uploads per window
//     message: 'Too many uploads from this IP, please try again later',
// });
// app.use(uploadLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/files', fileRoutes);

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));