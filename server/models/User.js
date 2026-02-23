import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        lowercase: true,
        trim: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'OPERATOR', 'CLIENT', 'STAFF'],
        default: 'CLIENT',
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending',
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        default: null,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);
