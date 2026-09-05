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
  
  // Fallback with default services if none exist
  if (docs.length === 0) {
    return [
      {
        _id: '1',
        name: 'Web Development',
        description: 'Build modern, scalable web applications with cutting-edge technologies and best practices.',
        icon: 'FaCode',
        order: 1,
        isActive: true
      },
      {
        _id: '2',
        name: 'Mobile Solutions',
        description: 'Create intuitive mobile apps for iOS and Android that engage and delight your users.',
        icon: 'FaMobileAlt',
        order: 2,
        isActive: true
      },
      {
        _id: '3',
        name: 'Cloud Infrastructure',
        description: 'Secure, reliable cloud solutions designed to scale with your growing business needs.',
        icon: 'FaCloud',
        order: 3,
        isActive: true
      },
      {
        _id: '4',
        name: 'AI & Machine Learning',
        description: 'Leverage AI and ML to unlock insights and automate complex business processes.',
        icon: 'FaBrain',
        order: 4,
        isActive: true
      },
      {
        _id: '5',
        name: 'Data Analytics',
        description: 'Transform raw data into actionable insights that drive strategic decisions.',
        icon: 'FaChartBar',
        order: 5,
        isActive: true
      },
      {
        _id: '6',
        name: 'IT Consulting',
        description: 'Expert guidance to optimize your technology strategy and digital transformation.',
        icon: 'FaHeadset',
        order: 6,
        isActive: true
      }
    ];
  }
  
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
