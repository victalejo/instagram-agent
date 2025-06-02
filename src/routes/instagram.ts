import express, { Response } from 'express';
import { User } from '../models/User';
import { TrainingData } from '../models/TrainingData';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Add Instagram account
router.post('/accounts', authenticateToken, async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const userId = (req as any).user._id;

    if (!username || !password) {
      return res.status(400).json({ message: 'Instagram username and password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if Instagram account already exists
    const existingAccount = user.instagramAccounts.find(acc => acc.username === username);
    if (existingAccount) {
      return res.status(400).json({ message: 'Instagram account already added' });
    }

    // Create cookies directory for this user's Instagram account
    const cookiesDir = path.join('./cookies', userId.toString());
    if (!fs.existsSync(cookiesDir)) {
      fs.mkdirSync(cookiesDir, { recursive: true });
    }

    const cookiesPath = path.join(cookiesDir, `${username}_cookies.json`);

    user.instagramAccounts.push({
      username,
      password,
      isActive: true,
      cookiesPath
    });

    await user.save();

    logger.info(`Instagram account ${username} added for user ${user.username}`);

    res.json({
      message: 'Instagram account added successfully',
      account: {
        username,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error adding Instagram account:', error);
    res.status(500).json({ message: 'Server error adding Instagram account' });
  }
});

// Get user's Instagram accounts
router.get('/accounts', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accounts = user.instagramAccounts.map(acc => ({
      username: acc.username,
      isActive: acc.isActive,
      lastActive: acc.lastActive
    }));

    res.json({ accounts });
  } catch (error) {
    logger.error('Error fetching Instagram accounts:', error);
    res.status(500).json({ message: 'Server error fetching accounts' });
  }
});

// Toggle Instagram account status
router.put('/accounts/:username/toggle', authenticateToken, async (req: any, res: any) => {
  try {
    const { username } = req.params;
    const userId = (req as any).user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const account = user.instagramAccounts.find(acc => acc.username === username);
    if (!account) {
      return res.status(404).json({ message: 'Instagram account not found' });
    }

    account.isActive = !account.isActive;
    await user.save();

    logger.info(`Instagram account ${username} ${account.isActive ? 'activated' : 'deactivated'} for user ${user.username}`);

    res.json({
      message: `Account ${account.isActive ? 'activated' : 'deactivated'}`,
      account: {
        username: account.username,
        isActive: account.isActive
      }
    });
  } catch (error) {
    logger.error('Error toggling Instagram account:', error);
    res.status(500).json({ message: 'Server error toggling account' });
  }
});

// Delete Instagram account
router.delete('/accounts/:username', authenticateToken, async (req: any, res: any) => {
  try {
    const { username } = req.params;
    const userId = (req as any).user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accountIndex = user.instagramAccounts.findIndex(acc => acc.username === username);
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Instagram account not found' });
    }

    // Delete cookies file if exists
    const account = user.instagramAccounts[accountIndex];
    if (account.cookiesPath && fs.existsSync(account.cookiesPath)) {
      fs.unlinkSync(account.cookiesPath);
    }

    // Remove account from user
    user.instagramAccounts.splice(accountIndex, 1);
    await user.save();

    // Delete associated training data
    await TrainingData.deleteMany({ userId, instagramUsername: username });

    logger.info(`Instagram account ${username} deleted for user ${user.username}`);

    res.json({ message: 'Instagram account deleted successfully' });
  } catch (error) {
    logger.error('Error deleting Instagram account:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

export default router;