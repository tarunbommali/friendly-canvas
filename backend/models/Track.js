const { Schema, model } = require('mongoose');

const trackSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    trackKey: { type: String, required: true, trim: true }, // "01".."20" scoped to project
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

trackSchema.index({ project: 1, trackKey: 1 }, { unique: true });
trackSchema.index({ project: 1, sortOrder: 1 });

module.exports = model('Track', trackSchema);
