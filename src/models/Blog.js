import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, required: true },
    excerpt: { type: String, default: '', maxlength: 300 },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    coverImagePublicId: { type: String, default: '' },

    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Generate slug BEFORE validation (async)
blogSchema.pre('validate', async function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

blogSchema.pre('save', async function () {
  // Generate/update slug from title for new docs or when title changes
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Only keep this index - unique: true already creates an index on slug
blogSchema.index({ isPublished: 1, publishedAt: -1 });

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
