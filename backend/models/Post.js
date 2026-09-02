const { Schema, model, models } = require('mongoose');

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

const canvasDocumentSchema = new Schema(
  {
    version: { type: Number, default: 1 },
    width: { type: Number, default: 1080 },
    height: { type: Number, default: 1350 },
    aspectRatio: { type: String, default: '4:5' },
    bgPattern: { type: String, default: 'solid' },
    textAlign: { type: String, default: 'left' },
    objects: { type: [Schema.Types.Mixed], default: [] },
    background: { type: Schema.Types.Mixed, default: { type: 'color', value: '#121212' } },
  },
  { _id: false }
);

const slideSchema = new Schema(
  {
    externalId: { type: String, default: () => `slide_${Date.now()}` },
    slideNo: { type: Number, required: true },
    layout: { type: String, default: 'concept-explain' },
    headline: { type: String, default: '' },
    text: { type: String, default: '' },
    imagePrompt: { type: String, default: '' },
    visualDirective: { type: Schema.Types.Mixed, default: '' },
    assets: { type: [String], default: [] },
    canvas: { type: canvasDocumentSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    collection: { type: Schema.Types.ObjectId, ref: 'Collection', required: true, index: true },
    externalId: { type: String, required: true },
    title: { type: String, required: true },
    postNo: { type: Number, required: true },
    sortOrder: { type: Number, required: true, default: 0 },
    resources: [resourceSchema],
    assets: { type: [String], default: [] },
    slides: [slideSchema],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

postSchema.index({ collection: 1, postNo: 1 }, { unique: true });
postSchema.index({ collection: 1, sortOrder: 1 });
postSchema.index({ project: 1, sortOrder: 1 });

module.exports = models.Post || model('Post', postSchema);
