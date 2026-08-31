const { Schema, model } = require('mongoose');

const SLIDE_LAYOUTS = [
  'hook-open',
  'concept-explain',
  'process-flow',
  'comparison',
  'recap-close',
  'next-up',
];

const resourceSchema = new Schema(
  {
    youtubeLink: { type: String, default: null },
    blogUrl: { type: String, default: null },
  },
  { _id: false }
);

const slideSchema = new Schema(
  {
    externalId: { type: String, required: true }, // "slide_t01_p01_s01"
    slideNo: { type: Number, required: true },
    layout: { type: String, enum: SLIDE_LAYOUTS, required: true },
    headline: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true }, // "post_t01_p01"
    title: { type: String, required: true },
    postNo: { type: Number, required: true, unique: true },
    track: { type: Schema.Types.ObjectId, ref: 'Track', required: true, index: true },
    resources: [resourceSchema],
    assets: [String],
    slides: [slideSchema],
  },
  { timestamps: true }
);

postSchema.index({ track: 1, postNo: 1 });

module.exports = model('Post', postSchema);
