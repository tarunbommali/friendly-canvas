const { Schema, model, models } = require('mongoose');

const collectionSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    collectionKey: { type: String, required: true, trim: true }, // "01".."20" scoped to project
    name: { type: String, required: true, trim: true },
    palette: {
      name: { type: String, required: true },
      primary: { type: String, required: true },
      accent: { type: String, required: true },
    },
    cover: {
      headline: { type: String, required: true },
      text: { type: String, required: true },
      vibe: { type: String, default: '' },
    },
    sortOrder: { type: Number, required: true, default: 0, index: true },
  },
  { timestamps: true }
);

collectionSchema.index({ project: 1, collectionKey: 1 }, { unique: true });
collectionSchema.index({ project: 1, sortOrder: 1 });

module.exports = models.Collection || model('Collection', collectionSchema);
