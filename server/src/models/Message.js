import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video', 'audio'], required: true },
    url: { type: String, required: true },
    name: { type: String, default: '' },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '', trim: true, maxlength: 4000 },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true }
);

messageSchema.pre('validate', function preValidateMessage(next) {
  const hasText = typeof this.content === 'string' && this.content.trim().length > 0;
  const hasFiles = Array.isArray(this.attachments) && this.attachments.length > 0;
  if (!hasText && !hasFiles) {
    next(new Error('Message must have text or attachments'));
    return;
  }
  next();
});

export const Message = mongoose.model('Message', messageSchema);
