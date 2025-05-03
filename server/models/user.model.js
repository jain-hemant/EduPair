import argon2 from 'argon2';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      min: 3,
      max: 50
    },
    bio: {
      type: String
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      enum: ['creator', 'admin', 'viewer', 'user'],
      default: 'user',
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    skillsToTeach: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    skillsToLearn: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    creditBalance: {
      type: Number,
      default: 5 // Start with 5 credits
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],
    averageRating: {
      type: Number,
      default: 0
    },
    lastLoggedInDate: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await argon2.hash(this.password);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.isValidPassword = async function (password) {
  return await argon2.verify(this.password, password);
};

export default mongoose.model('User', UserSchema);