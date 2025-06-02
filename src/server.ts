import app from './app';
import logger from './config/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);
    logger.info(`API endpoints:`);
    logger.info(`  POST /api/auth/register - Register new user`);
    logger.info(`  POST /api/auth/login - User login`);
    logger.info(`  POST /api/instagram/accounts - Add Instagram account`);
    logger.info(`  GET /api/instagram/accounts - Get Instagram accounts`);
    logger.info(`  POST /api/training/data - Add training data`);
    logger.info(`  GET /api/training/data - Get all training data`);
});

export default app;