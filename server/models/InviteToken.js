import mongoose from 'mongoose';

const inviteTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tokenHash: {
        type: String,
        required: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

inviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InviteToken = mongoose.model('InviteToken', inviteTokenSchema);
