import mongoose from "mongoose";

const MlmMarketingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        "Posters",
        "Images",
        "Videos",
        "Documents",
        "Banners",
        "Social Media",
        "Announcements",
        "Other",
      ],
      default: "Posters",
    },
    contentType: {
      type: String,
      enum: [
        "POSTER",
        "IMAGE",
        "BANNER",
        "VIDEO",
        "REEL",
        "DOCUMENT",
        "PDF",
        "PPT",
        "WHATSAPP",
        "CAPTION",
        "SCRIPT",
        "TEXT",
        "OTHER",
      ],
      required: true,
      default: "POSTER",
    },
    url: { type: String },
    fileUrl: { type: String },
    thumbnailUrl: { type: String },
    caption: { type: String },
    shareText: { type: String },
    captions: {
      whatsapp: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      youtube: { type: String },
      ctaText: { type: String },
    },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "PUBLISHED",
    },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    uploadedBy: { type: String },
    publishFrom: { type: Date },
    publishUntil: { type: Date },
    fileSize: { type: Number },
    mimeType: { type: String },
    fileName: { type: String },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    copyCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "mlmmarketings" }
);

// Synchronize legacy and extended fields on save
MlmMarketingSchema.pre("save", function (next) {
  if (this.url && !this.fileUrl) {
    this.fileUrl = this.url;
  } else if (this.fileUrl && !this.url) {
    this.url = this.fileUrl;
  }

  if (this.sortOrder !== undefined && this.displayOrder === 0 && this.sortOrder !== 0) {
    this.displayOrder = this.sortOrder;
  } else if (this.displayOrder !== undefined && this.sortOrder === 0 && this.displayOrder !== 0) {
    this.sortOrder = this.displayOrder;
  }

  if (this.status === "PUBLISHED") {
    this.isActive = true;
  } else if (this.status === "DRAFT" || this.status === "ARCHIVED") {
    this.isActive = false;
  } else if (this.isActive !== undefined && !this.status) {
    this.status = this.isActive ? "PUBLISHED" : "DRAFT";
  }

  next();
});

// Index for high-performance gallery lookups and admin filtering
MlmMarketingSchema.index({ status: 1, category: 1, contentType: 1, featured: -1, createdAt: -1 });

if (mongoose.models.MlmMarketing) {
  delete mongoose.models.MlmMarketing;
}

export default mongoose.models.MlmMarketing || mongoose.model("MlmMarketing", MlmMarketingSchema, "mlmmarketings");
