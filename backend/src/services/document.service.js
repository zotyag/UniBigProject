// src/services/document.service.js
import slugify from 'slugify';
import { DocumentIndex } from '../models/postgres/index.js';
import Document from '../models/mongodb/Document.js';
import DocumentVersion from '../models/mongodb/DocumentVersion.js';
import { GeminiService } from './gemini.service.js';
import { decryptAPIKey } from '../utils/encryption.js';

export class DocumentService {
	static _normalizeCvData(cvData) {
		if (cvData && Array.isArray(cvData.experience)) {
			cvData.experience.forEach((exp) => {
				const bullets =
					exp.description_bullets || exp.key_responsibilities || exp.responsibilities;
				if (Array.isArray(bullets)) {
					exp.description = bullets.join('\n');
					delete exp.description_bullets;
					delete exp.key_responsibilities;
					delete exp.responsibilities;
				}
				if (exp.company_name) {
					exp.company = exp.company_name;
					delete exp.company_name;
				}
				if (exp.job_title) {
					exp.title = exp.job_title;
					delete exp.job_title;
				}
				if (exp.dates_employed) {
					const dates = exp.dates_employed.split('–').map((d) => d.trim());
					exp.start_date = dates[0];
					exp.end_date = dates[1] || 'Present';
					delete exp.dates_employed;
				}
			});
		}
		return cvData;
	}
    static async createDocument(documentData, user) {
        // Check if user has API key
        if (!user.gemini_api_key_encrypted) {
            throw new Error('Gemini API key not set');
        }

        // Generate content using Gemini
        const apiKey = decryptAPIKey(user.gemini_api_key_encrypted);
        let contentJson = await GeminiService.generateContent(
            apiKey,
            documentData.user_data,
            documentData.doc_type
        );
        
        // Normalize the generated content
        contentJson = this._normalizeCvData(contentJson);


        // Create slug
        let slug = slugify(documentData.title, { lower: true, strict: true });
        slug = slug.substring(0, 120);

        // Check for duplicate slug
        const existing = await DocumentIndex.findOne({
            where: { user_id: user.id, slug }
        });

        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        // Create MongoDB document
        const mongoDoc = await Document.create({
            user_id: user.id,
            type: documentData.doc_type,
            title: documentData.title,
            template_code: documentData.template_code,
            content_json: contentJson,
            state: 'draft',
            current_version: 1
        });

        // Create PostgreSQL index
        const pgDoc = await DocumentIndex.create({
            user_id: user.id,
            doc_type: documentData.doc_type,
            title: documentData.title,
            slug,
            mongo_document_id: mongoDoc._id.toString(),
            current_version: 1
        });

        // Create initial version
        await DocumentVersion.create({
            document_id: mongoDoc._id,
            version: 1,
            content_json: contentJson,
            change_note: 'Initial version',
            created_by: user.id
        });

        return {
            ...pgDoc.toJSON(),
            content_json: contentJson,
            template_code: documentData.template_code,
            state: 'draft'
        };
    }

    static async getUserDocuments(userId, docType) {
        const where = { user_id: userId };
        if (docType) {
            where.doc_type = docType;
        }

        return await DocumentIndex.findAll({
            where,
            order: [['updated_at', 'DESC']]
        });
    }

    static async getDocumentDetail(documentId, userId) {
        const pgDoc = await DocumentIndex.findOne({
            where: { id: documentId, user_id: userId }
        });

        if (!pgDoc) {
            throw new Error('Document not found');
        }

        const mongoDoc = await Document.findById(pgDoc.mongo_document_id);

        if (!mongoDoc) {
            throw new Error('Document content not found');
        }
        
        // Normalize the data before sending it to the client
        const normalizedContent = this._normalizeCvData(mongoDoc.content_json);

        return {
            ...pgDoc.toJSON(),
            content_json: normalizedContent,
            template_code: mongoDoc.template_code,
            state: mongoDoc.state
        };
    }

    static async updateDocument(documentId, updateData, userId) {
        const pgDoc = await DocumentIndex.findOne({
            where: { id: documentId, user_id: userId }
        });

        if (!pgDoc) {
            throw new Error('Document not found');
        }

        const mongoDoc = await Document.findById(pgDoc.mongo_document_id);

        // Update PostgreSQL
        if (updateData.title) {
            pgDoc.title = updateData.title;
            pgDoc.slug = slugify(updateData.title, { lower: true, strict: true }).substring(0, 120);
        }

        // Update MongoDB
        if (updateData.content_json) {
            mongoDoc.content_json = updateData.content_json;
            pgDoc.current_version += 1;
            mongoDoc.current_version = pgDoc.current_version;

            // Create new version
            await DocumentVersion.create({
                document_id: mongoDoc._id,
                version: pgDoc.current_version,
                content_json: updateData.content_json,
                change_note: updateData.change_note || 'Manual update',
                created_by: userId
            });
        }

        if (updateData.state) {
            mongoDoc.state = updateData.state;
        }

        if (updateData.title) {
            mongoDoc.title = updateData.title;
        }

        pgDoc.updated_at = new Date();
        mongoDoc.updated_at = new Date();

        await pgDoc.save();
        await mongoDoc.save();

        return this.getDocumentDetail(documentId, userId);
    }

    static async deleteDocument(documentId, userId) {
        const pgDoc = await DocumentIndex.findOne({
            where: { id: documentId, user_id: userId }
        });

        if (!pgDoc) {
            throw new Error('Document not found');
        }

        // Delete from MongoDB
        await Document.findByIdAndDelete(pgDoc.mongo_document_id);
        await DocumentVersion.deleteMany({ document_id: pgDoc.mongo_document_id });

        // Delete from PostgreSQL
        await pgDoc.destroy();
    }
}