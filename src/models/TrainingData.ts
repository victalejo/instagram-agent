import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingData extends Document {
  userId: mongoose.Types.ObjectId;
  instagramUsername: string;
  dataType: 'text' | 'audio' | 'pdf' | 'website';
  content: string;
  metadata?: {
    filename?: string;
    url?: string;
    duration?: number;
    fileSize?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TrainingDataSchema = new Schema<ITrainingData>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instagramUsername: {
    type: String,
    required: true
  },
  dataType: {
    type: String,
    enum: ['text', 'audio', 'pdf', 'website'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    filename: String,
    url: String,
    duration: Number,
    fileSize: Number
  }
}, {
  timestamps: true
});

TrainingDataSchema.index({ userId: 1, instagramUsername: 1 });

export const TrainingData = mongoose.model<ITrainingData>('TrainingData', TrainingDataSchema);