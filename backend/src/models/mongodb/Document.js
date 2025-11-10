// src/models/mongodb/Document.js
import mongoose from 'mongoose';
const documentSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['cv', 'cover_letter'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    template_code: {
        type: String,
        required: true
    },
    content_json: {
        type: Object,
        required: true
    },
    state: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    current_version: {
        type: Number,
        default: 1
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
documentSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});
export default mongoose.model('Document', documentSchema);