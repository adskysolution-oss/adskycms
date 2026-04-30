import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Service from '@/models/Service';
import TeamMember from '@/models/TeamMember';
import Project from '@/models/Project';
import PricingPlan from '@/models/PricingPlan';

export async function POST() {
  try {
    await dbConnect();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Database already seeded' }, { status: 400 });
    }

    // Admin user
    await User.create({
      name: 'Admin',
      email: 'admin@adskysolution.com',
      password: 'Admin@123',
      role: 'admin',
    });

    // Services
    await Service.insertMany([
      { name: 'Web Development', description: 'Custom websites and web applications built with React, Next.js, and Node.js.', features: ['Responsive Design', 'SEO Optimized', 'High Performance'], icon: 'FaCode', order: 0 },
      { name: 'Mobile Apps', description: 'Native and cross-platform mobile applications for iOS and Android with Flutter and React Native.', features: ['Cross-Platform', 'Push Notifications', 'Offline Support'], icon: 'FaMobileAlt', order: 1 },
      { name: 'Digital Marketing', description: 'Complete digital marketing solutions including SEO, SEM, social media, and content marketing.', features: ['SEO & SEM', 'Social Media', 'Analytics'], icon: 'FaBullhorn', order: 2 },
      { name: 'UI/UX Design', description: 'Beautiful, user-centered designs that drive engagement and conversions.', features: ['User Research', 'Prototyping', 'Design Systems'], icon: 'FaPaintBrush', order: 3 },
      { name: 'Cloud Solutions', description: 'AWS, Azure, and GCP cloud infrastructure, migration, and DevOps automation.', features: ['Auto Scaling', 'CI/CD', 'Monitoring'], icon: 'FaCloud', order: 4 },
      { name: 'Cybersecurity', description: 'Enterprise-grade security assessments, implementation, and monitoring.', features: ['Penetration Testing', 'Compliance', '24/7 Monitoring'], icon: 'FaShieldAlt', order: 5 },
    ]);

    // Team Members
    await TeamMember.insertMany([
      { name: 'Alex Kumar', role: 'CEO & Founder', bio: 'Visionary leader with 15+ years in tech.', order: 0 },
      { name: 'Priya Sharma', role: 'CTO', bio: 'Full-stack architect and tech innovator.', order: 1 },
      { name: 'Rahul Verma', role: 'Design Lead', bio: 'Award-winning designer focused on user experience.', order: 2 },
      { name: 'Sneha Patel', role: 'Marketing Head', bio: 'Growth strategist with data-driven marketing expertise.', order: 3 },
    ]);

    // Projects
    await Project.insertMany([
      { title: 'E-Commerce Platform', description: 'Full-stack e-commerce solution with real-time inventory management.', technologies: ['Next.js', 'MongoDB', 'Stripe'], order: 0 },
      { title: 'HealthCare App', description: 'Patient management system with appointment scheduling and telemedicine.', technologies: ['React Native', 'Node.js', 'PostgreSQL'], order: 1 },
      { title: 'FinTech Dashboard', description: 'Analytics dashboard for financial data visualization and reporting.', technologies: ['React', 'D3.js', 'Python'], order: 2 },
      { title: 'SaaS Marketing Site', description: 'Complete brand overhaul and SEO-optimized marketing website.', technologies: ['Next.js', 'Tailwind', 'Vercel'], order: 3 },
      { title: 'Real Estate Portal', description: 'Property listing platform with map integration and virtual tours.', technologies: ['React', 'Express', 'MongoDB'], order: 4 },
      { title: 'EdTech Platform', description: 'Online learning platform with video streaming and progress tracking.', technologies: ['Next.js', 'AWS', 'Redis'], order: 5 },
    ]);

    // Pricing Plans
    await PricingPlan.insertMany([
      { name: 'Starter', price: 14999, currency: '₹', period: 'monthly', description: 'Perfect for small businesses getting started', features: ['5 Page Website', 'Basic SEO', 'Mobile Responsive', '1 Month Support', 'Social Media Setup'], order: 0 },
      { name: 'Professional', price: 29999, currency: '₹', period: 'monthly', description: 'Ideal for growing businesses', features: ['10 Page Website', 'Advanced SEO', 'Custom Design', '3 Months Support', 'Social Media Marketing', 'Analytics Dashboard', 'Email Marketing'], highlighted: true, order: 1 },
      { name: 'Enterprise', price: 59999, currency: '₹', period: 'monthly', description: 'For large-scale digital transformation', features: ['Unlimited Pages', 'Full SEO Suite', 'Custom Web App', '12 Months Support', 'Complete Marketing', 'Priority Support', 'Cloud Hosting', 'Dedicated Manager'], order: 2 },
    ]);

    return NextResponse.json({ success: true, message: 'Database seeded successfully. Admin: admin@adskysolution.com / Admin@123' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
