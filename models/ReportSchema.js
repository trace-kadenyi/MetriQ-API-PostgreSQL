const mongoose = require("mongoose");

const metricsSchema = new mongoose.Schema({
  value: { type: String, required: true },
  status: { type: String, required: true },
});

const reportEntrySchema = new mongoose.Schema(
  {
    scores: {
      mobile: {
        performance: { type: Number, required: true },
        accessibility: { type: Number, required: true },
        seo: { type: Number, required: true },
        bestPractices: { type: Number, required: true },
      },
      desktop: {
        performance: { type: Number, required: true },
        accessibility: { type: Number, required: true },
        seo: { type: Number, required: true },
        bestPractices: { type: Number, required: true },
      },
    },
    metrics: {
      mobile: {
        "Largest Contentful Paint": metricsSchema,
        "First Contentful Paint": metricsSchema,
        "First Input Delay": metricsSchema,
        "Cumulative Layout Shift": metricsSchema,
        "Speed Index": metricsSchema,
        "Total Blocking Time": metricsSchema,
      },
      desktop: {
        "Largest Contentful Paint": metricsSchema,
        "First Contentful Paint": metricsSchema,
        "First Input Delay": metricsSchema,
        "Cumulative Layout Shift": metricsSchema,
        "Speed Index": metricsSchema,
        "Total Blocking Time": metricsSchema,
      },
    },
    suggestions: {
      mobile: [
        {
          title: { type: String, required: true },
          displayValue: { type: String },
          description: { type: String },
          score: { type: Number },
        },
      ],
      desktop: [
        {
          title: { type: String, required: true },
          displayValue: { type: String },
          description: { type: String },
          score: { type: Number },
        },
      ],
    },
  },
  { timestamps: true }
);

const reportSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    reports: [reportEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
