import dbConnect from './db';
import Service from '@/models/Service';
import Blog from '@/models/Blog';
import User from '@/models/User';
import TeamMember from '@/models/TeamMember';
import Project from '@/models/Project';
import PricingPlan from '@/models/PricingPlan';

function serialize(docs) {
  return JSON.parse(JSON.stringify(docs));
}

export async function getActiveServices() {
  await dbConnect();
  const docs = await Service.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(docs);
}

export async function getPublishedBlogs(limit = 10) {
  await dbConnect();
  const docs = await Blog.find({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return serialize(docs);
}

export async function getBlogBySlug(slug) {
  await dbConnect();
  const blog = await Blog.findOneAndUpdate(
    { slug, isPublished: true },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).populate('author', 'name avatar').lean();
  return blog ? serialize(blog) : null;
}

export async function getTeamMembers() {
  await dbConnect();
  const docs = await TeamMember.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(docs);
}


export async function getProjects() {
  await dbConnect();
  const docs = await Project.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(docs);
}


export async function getActivePricingPlans() {
  await dbConnect();
  const docs = await PricingPlan.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(docs);
}
