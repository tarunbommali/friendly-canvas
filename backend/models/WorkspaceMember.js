const { Schema, model } = require('mongoose');

const workspaceMemberSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'editor',
      required: true,
    },
  },
  { timestamps: true }
);

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });

module.exports = model('WorkspaceMember', workspaceMemberSchema);
