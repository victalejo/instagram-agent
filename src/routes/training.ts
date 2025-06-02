import express, { Response } from 'express';
import { TrainingData } from '../models/TrainingData';
import { User } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Add training data
router.post('/data', authenticateToken, async (req: any, res: any) => {
  try {
    const { instagramUsername, dataType, content, metadata } = req.body;
    const userId = (req as any).user._id;

    if (!instagramUsername || !dataType || !content) {
      return res.status(400).json({ message: 'Instagram username, data type, and content are required' });
    }

    // Verify user owns this Instagram account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasAccount = user.instagramAccounts.some(acc => acc.username === instagramUsername);
    if (!hasAccount) {
      return res.status(403).json({ message: 'You can only add training data for your own Instagram accounts' });
    }

    const trainingData = new TrainingData({
      userId,
      instagramUsername,
      dataType,
      content,
      metadata
    });

    await trainingData.save();

    logger.info(`Training data added for ${instagramUsername} by user ${user.username}`);

    res.status(201).json({
      message: 'Training data added successfully',
      data: {
        id: trainingData._id,
        dataType: trainingData.dataType,
        instagramUsername: trainingData.instagramUsername,
        createdAt: trainingData.createdAt
      }
    });
  } catch (error) {
    logger.error('Error adding training data:', error);
    res.status(500).json({ message: 'Server error adding training data' });
  }
});

// Get training data for a specific Instagram account
router.get('/data/:instagramUsername', authenticateToken, async (req: any, res: any) => {
  try {
    const { instagramUsername } = req.params;
    const userId = (req as any).user._id;

    // Verify user owns this Instagram account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasAccount = user.instagramAccounts.some(acc => acc.username === instagramUsername);
    if (!hasAccount) {
      return res.status(403).json({ message: 'You can only view training data for your own Instagram accounts' });
    }

    const trainingData = await TrainingData.find({
      userId,
      instagramUsername
    }).sort({ createdAt: -1 });

    res.json({
      instagramUsername,
      totalItems: trainingData.length,
      data: trainingData.map(item => ({
        id: item._id,
        dataType: item.dataType,
        content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''),
        metadata: item.metadata,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    logger.error('Error fetching training data:', error);
    res.status(500).json({ message: 'Server error fetching training data' });
  }
});

// Get all training data for user
router.get('/data', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = (req as any).user._id;

    const trainingData = await TrainingData.find({ userId }).sort({ createdAt: -1 });

    // Group by Instagram username
    const groupedData = trainingData.reduce((acc, item) => {
      if (!acc[item.instagramUsername]) {
        acc[item.instagramUsername] = [];
      }
      acc[item.instagramUsername].push({
        id: item._id,
        dataType: item.dataType,
        content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''),
        metadata: item.metadata,
        createdAt: item.createdAt
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      totalItems: trainingData.length,
      byAccount: groupedData
    });
  } catch (error) {
    logger.error('Error fetching training data:', error);
    res.status(500).json({ message: 'Server error fetching training data' });
  }
});

// Delete training data
router.delete('/data/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const trainingData = await TrainingData.findOne({ _id: id, userId });
    if (!trainingData) {
      return res.status(404).json({ message: 'Training data not found' });
    }

    await TrainingData.deleteOne({ _id: id });

    logger.info(`Training data ${id} deleted by user ${userId}`);

    res.json({ message: 'Training data deleted successfully' });
  } catch (error) {
    logger.error('Error deleting training data:', error);
    res.status(500).json({ message: 'Server error deleting training data' });
  }
});

export default router;