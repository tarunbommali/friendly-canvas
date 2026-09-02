const { Schema, model } = require('mongoose');

const projectSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sortOrder: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

projectSchema.index({ workspace: 1, slug: 1 }, { unique: true });
projectSchema.index({ workspace: 1, sortOrder: 1 });

module.exports = model('Project', projectSchema);
