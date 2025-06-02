import { TrainingData } from '../models/TrainingData';
import { User } from '../models/User';
import logger from '../config/logger';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export class TrainingService {
    static async addTextData(userId: string, instagramUsername: string, content: string) {
        try {
            const trainingData = new TrainingData({
                userId,
                instagramUsername,
                dataType: 'text',
                content
            });

            await trainingData.save();
            logger.info(`Text training data added for ${instagramUsername}`);
            return trainingData;
        } catch (error) {
            logger.error('Error adding text training data:', error);
            throw error;
        }
    }

    static async addWebsiteData(userId: string, instagramUsername: string, url: string, content: string) {
        try {
            const trainingData = new TrainingData({
                userId,
                instagramUsername,
                dataType: 'website',
                content,
                metadata: { url }
            });

            await trainingData.save();
            logger.info(`Website training data added for ${instagramUsername} from ${url}`);
            return trainingData;
        } catch (error) {
            logger.error('Error adding website training data:', error);
            throw error;
        }
    }

    static async addFileData(userId: string, instagramUsername: string, filePath: string, fileType: string) {
        try {
            let content = '';
            let metadata: any = {
                filename: path.basename(filePath),
                fileSize: fs.statSync(filePath).size
            };

            if (fileType === 'pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                content = pdfData.text;
            } else if (fileType === 'docx') {
                const result = await mammoth.extractRawText({ path: filePath });
                content = result.value;
            } else if (fileType === 'txt') {
                content = fs.readFileSync(filePath, 'utf-8');
            } else {
                throw new Error(`Unsupported file type: ${fileType}`);
            }

            const trainingData = new TrainingData({
                userId,
                instagramUsername,
                dataType: fileType === 'txt' ? 'text' : 'pdf',
                content,
                metadata
            });

            await trainingData.save();
            logger.info(`File training data added for ${instagramUsername} from ${filePath}`);
            return trainingData;
        } catch (error) {
            logger.error('Error adding file training data:', error);
            throw error;
        }
    }

    static async getTrainingDataForAccount(userId: string, instagramUsername: string, limit: number = 50) {
        try {
            const trainingData = await TrainingData.find({
                userId,
                instagramUsername
            })
            .sort({ createdAt: -1 })
            .limit(limit);

            return trainingData;
        } catch (error) {
            logger.error('Error fetching training data:', error);
            throw error;
        }
    }

    static async deleteTrainingData(userId: string, trainingDataId: string) {
        try {
            const result = await TrainingData.deleteOne({
                _id: trainingDataId,
                userId
            });

            if (result.deletedCount === 0) {
                throw new Error('Training data not found or access denied');
            }

            logger.info(`Training data ${trainingDataId} deleted for user ${userId}`);
            return true;
        } catch (error) {
            logger.error('Error deleting training data:', error);
            throw error;
        }
    }

    static async getTrainingStats(userId: string, instagramUsername?: string) {
        try {
            const query: any = { userId };
            if (instagramUsername) {
                query.instagramUsername = instagramUsername;
            }

            const totalItems = await TrainingData.countDocuments(query);
            
            const typeStats = await TrainingData.aggregate([
                { $match: query },
                { $group: { _id: '$dataType', count: { $sum: 1 } } }
            ]);

            return {
                totalItems,
                byType: typeStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {} as Record<string, number>)
            };
        } catch (error) {
            logger.error('Error getting training stats:', error);
            throw error;
        }
    }
}