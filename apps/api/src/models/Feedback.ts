import { Schema, model, Types } from 'mongoose';

export interface FeedbackDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId | null;
  role: string;
  rating: number;
  usabilityRating: number;
  trustRating: number;
  message: string;
  improvementSuggestion: string | null;
  consentToPublish: boolean;
  createdAt: Date;
}

const feedbackSchema = new Schema<FeedbackDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    role: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    usabilityRating: { type: Number, required: true, min: 1, max: 5 },
    trustRating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true },
    improvementSuggestion: { type: String, default: null },
    consentToPublish: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const FeedbackModel = model<FeedbackDoc>('Feedback', feedbackSchema);
