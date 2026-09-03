const { Schema, model, models } = require('mongoose');

const collectionSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    collectionId: { type: String, required: true, trim: true },
    collectionName: { type: String, required: true, trim: true },
    collectionDescription: { type: String, default: '' },
    collectionDesign: {
      palette: { type: String, default: '' },
      primary: { type: String, default: '' },
      accent: { type: String, default: '' },
    },
    sortOrder: { type: Number, required: true, default: 0, index: true },
  },
  { timestamps: true }
);

collectionSchema.index({ project: 1, collectionId: 1 }, { unique: true });
collectionSchema.index({ project: 1, sortOrder: 1 });

module.exports = models.Collection || model('Collection', collectionSchema);
