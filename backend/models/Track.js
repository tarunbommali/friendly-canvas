const { Schema, model } = require('mongoose');

const trackSchema = new Schema({
  trackKey: { type: String, required: true, unique: true, trim: true }, // "01".."20"
  name: { type: String, required: true, trim: true },
  palette: {
    name: { type: String, required: true },
    primary: { type: String, required: true },
    accent: { type: String, required: true },
  },
  cover: {
    headline: { type: String, required: true },
    text: { type: String, required: true },
    vibe: { type: String },
  },
  sortOrder: { type: Number, required: true, index: true },
});

module.exports = model('Track', trackSchema);
