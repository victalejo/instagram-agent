import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IInstagramAccount {
  username: string;
  password: string;
  isActive: boolean;
  lastActive?: Date;
  cookiesPath?: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  instagramAccounts: IInstagramAccount[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const InstagramAccountSchema = new Schema<IInstagramAccount>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date },
  cookiesPath: { type: String }
});

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  instagramAccounts: [InstagramAccountSchema]
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);