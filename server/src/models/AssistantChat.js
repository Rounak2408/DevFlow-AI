import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true, maxlength: 100000 },
    feedback: { type: String, default: null },
  },
  { timestamps: true }
);

const assistantChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New chat', trim: true, maxlength: 200 },
    pinned: { type: Boolean, default: false, index: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

assistantChatSchema.index({ userId: 1, updatedAt: -1 });
assistantChatSchema.index({ userId: 1, pinned: -1, updatedAt: -1 });

export const AssistantChat = mongoose.model('AssistantChat', assistantChatSchema, 'assistant_chats');
