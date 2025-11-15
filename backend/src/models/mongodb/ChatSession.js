// src/models/mongodb/ChatSession.js
import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
        index: true
    },
    session_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    doc_type: {
        type: String,
        enum: ['cv', 'cover_letter'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    conversation_history: [{
        role: {
            type: String,
            enum: ['user', 'model'],
            required: true
        },
        parts: [{
            text: String
        }],
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    current_cv_data: {
        type: Object,
        default: {}
    },
    fields_collected: {
        type: [String],
        default: []
    },
    next_field_to_ask: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

chatSessionSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

chatSessionSchema.index({ user_id: 1, session_id: 1 });

export default mongoose.model('ChatSession', chatSessionSchema);