// src/models/mongodb/DocumentVersion.js
import mongoose from 'mongoose';
const documentVersionSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Document',
        index: true
    },
    version: {
        type: Number,
        required: true
    },
    content_json: {
        type: Object,
        required: true
    },
    change_note: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Number,
        required: true
    }
});
documentVersionSchema.index({ document_id: 1, version: 1 }, { unique: true });
export default mongoose.model('DocumentVersion', documentVersionSchema);