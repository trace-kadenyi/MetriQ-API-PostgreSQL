const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // URL being reported
    scores: {
      mobile: {
        performance: { type: Number, required: true },
        accessibility: { type: Number, required: true },
        seo: { type: Number, required: true },
      },
      desktop: {
        performance: { type: Number, required: true },
        accessibility: { type: Number, required: true },
        seo: { type: Number, required: true },
      },
    },
    metrics: {
      mobile: {
        LCP: {
          value: { type: String, required: true }, // Largest Contentful Paint value
          status: { type: String, required: true }, // Status of LCP
        },
        FCP: {
          value: { type: String, required: true }, // First Contentful Paint value
          status: { type: String, required: true }, // Status of FCP
        },

        FID: {
          value: { type: String, required: true }, // First Input Delay value
          status: { type: String, required: true }, // Status of FID
        },
        CLS: {
          value: { type: String, required: true }, // Cumulative Layout Shift value
          status: { type: String, required: true }, // Status of CLS
        },
        speedIndex: {
          value: { type: String, required: true }, // Speed Index value
          status: { type: String, required: true }, // Status of Speed Index
        },
        TBT: {
          value: { type: String, required: true }, // Total Blocking Time value
          status: { type: String, required: true }, // Status of TBT
        },
      },
      desktop: {
        LCP: {
          value: { type: String, required: true }, // Largest Contentful Paint value
          status: { type: String, required: true }, // Status of LCP
        },
        FCP: {
          value: { type: String, required: true }, // First Contentful Paint value
          status: { type: String, required: true }, // Status of FCP
        },

        FID: {
          value: { type: String, required: true }, // First Input Delay value
          status: { type: String, required: true }, // Status of FID
        },
        CLS: {
          value: { type: String, required: true }, // Cumulative Layout Shift value
          status: { type: String, required: true }, // Status of CLS
        },
        speedIndex: {
          value: { type: String, required: true }, // Speed Index value
          status: { type: String, required: true }, // Status of Speed Index
        },
        TBT: {
          value: { type: String, required: true }, // Total Blocking Time value
          status: { type: String, required: true }, // Status of TBT
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
