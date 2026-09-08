/**
 * Recruitment Partner Landing Page CMS-Ready Data Architecture
 * All content structured for easy future migration to Admin CMS / Dynamic APIs.
 */
export const RECRUITMENT_LANDING_DATA = {
    hero: {
        badge: 'Official Recruitment Partner Program',
        headline: 'Become a SakhiHub Foundation Recruitment Partner',
        subheadline: 'Help organizations hire talented candidates and earn high incentives through a transparent recruitment ecosystem.',
        primaryCtaText: 'Become Recruitment Partner',
        primaryCtaUrl: '/recruitment/register',
        secondaryCtaText: 'Partner Login',
        secondaryCtaUrl: '/recruitment/login',
        learnMoreText: 'Learn More',
        trustBadges: [
            { text: 'Verified Network', icon: 'ShieldCheck' },
            { text: 'Transparent Wallet', icon: 'Wallet' },
            { text: 'Multi-Industry Jobs', icon: 'Building2' },
            { text: 'Timely Payouts', icon: 'Clock' }
        ]
    },
    whyChoose: [
        {
            id: 'trusted_platform',
            title: 'Trusted Platform',
            description: 'Backing of India’s leading healthcare and social network for verified corporate hiring.',
            iconName: 'ShieldCheck',
            badge: 'Certified'
        },
        {
            id: 'transparent_process',
            title: 'Transparent Process',
            description: 'End-to-end milestone visibility from candidate referral to 60-day payout release.',
            iconName: 'Eye',
            badge: '100% Clear'
        },
        {
            id: 'dedicated_dashboard',
            title: 'Dedicated Dashboard',
            description: 'Real-time candidate tracking, wallet management, job listings, and analytics portal.',
            iconName: 'LayoutDashboard',
            badge: 'Live CRM'
        },
        {
            id: 'secure_incentive',
            title: 'Secure Incentive Tracking',
            description: 'Automated ledger calculation for milestone-based incentive tracking and wallet withdrawals.',
            iconName: 'Lock',
            badge: 'Encrypted'
        },
        {
            id: 'realtime_tracking',
            title: 'Real-time Candidate Tracking',
            description: 'Know exactly when candidates are screened, interviewed, selected, or joined.',
            iconName: 'Activity',
            badge: 'Live Status'
        },
        {
            id: 'verified_companies',
            title: 'Verified Companies',
            description: 'Direct partnerships with reputed hospitals, corporate entities, retail chains, and NGOs.',
            iconName: 'Building2',
            badge: 'Top Employers'
        },
        {
            id: 'healthcare_corporate',
            title: 'Healthcare & Corporate Hiring',
            description: 'Diverse open mandates ranging from medical officers & nurses to management executives.',
            iconName: 'HeartPulse',
            badge: 'High Demand'
        },
        {
            id: 'longterm_growth',
            title: 'Long-term Growth',
            description: 'Scale your recruitment business with recurring mandates and tier-based performance rewards.',
            iconName: 'TrendingUp',
            badge: 'Scalable'
        }
    ],
    about: {
        title: 'Empowering Talent Solutions Across India',
        subtitle: 'Connecting ambition with opportunity through technology and human expertise.',
        description: 'The SakhiHub Foundation Recruitment Partner Program bridges the gap between top employers seeking verified workforce and experienced recruitment partners. We empower HR agencies, freelance consultants, and placement professionals with direct mandates, transparent tracking, and reliable payouts.',
        audiences: [
            {
                id: 'freelance',
                title: 'Freelance Recruiters',
                description: 'Independent HR professionals looking to monetize their network with top employer mandates.',
                icon: 'UserCheck',
                benefits: ['Work from anywhere', 'High commission rate', 'Direct dashboard access']
            },
            {
                id: 'agencies',
                title: 'Placement Agencies & HR Firms',
                description: 'Established manpower agencies seeking consistent high-volume hiring requirements.',
                icon: 'Briefcase',
                benefits: ['Multiple corporate accounts', 'Dedicated account manager', 'Bulk payouts']
            },
            {
                id: 'placement_cells',
                title: 'College Placement Cells',
                description: 'Educational institutes and training centers placing fresh graduates into starting roles.',
                icon: 'GraduationCap',
                benefits: ['Campus drive mandates', 'Verified employers', 'Student career growth']
            },
            {
                id: 'career_guides',
                title: 'Career & Community Leaders',
                description: 'Community connectors enabling regional job seekers to access verified opportunities.',
                icon: 'Users',
                benefits: ['Social impact', 'Transparent incentives', 'Easy referral tracking']
            }
        ]
    },
    benefits: [
        {
            id: 'easy_reg',
            title: 'Easy Digital Registration',
            description: 'Simple 3-step online registration with quick identity document upload.',
            iconName: 'FileCheck',
            category: 'onboarding'
        },
        {
            id: 'fast_approval',
            title: 'Fast Admin Approval',
            description: 'Quick document verification by SakhiHub Foundation compliance team within 24-48 hours.',
            iconName: 'CheckCircle2',
            category: 'onboarding'
        },
        {
            id: 'multi_companies',
            title: 'Multiple Hiring Companies',
            description: 'Single portal to access open job roles from top healthcare and corporate employers.',
            iconName: 'Building',
            category: 'dashboard'
        },
        {
            id: 'candidate_tracking',
            title: 'Live Candidate Pipeline',
            description: 'Complete visibility of candidate journey from screening to interview and selection.',
            iconName: 'UserPlus',
            category: 'dashboard'
        },
        {
            id: 'referral_tracking',
            title: 'Referral Link Generator',
            description: 'Share custom recruitment referral links to register sub-recruiters or candidate pools.',
            iconName: 'Share2',
            category: 'growth'
        },
        {
            id: 'digital_wallet',
            title: 'Integrated Digital Wallet',
            description: 'Track earned, pending, and cleared incentives directly in your partner wallet.',
            iconName: 'Wallet',
            category: 'payout'
        },
        {
            id: 'transparent_incentives',
            title: 'Transparent Milestone Payouts',
            description: 'Clear payout structures attached to candidate retention milestones (45/60 days).',
            iconName: 'BadgePercent',
            category: 'payout'
        },
        {
            id: 'dedicated_crm',
            title: 'Dedicated Partner CRM',
            description: 'Full-featured web dashboard optimized for desktop, tablet, and mobile screens.',
            iconName: 'Layout',
            category: 'dashboard'
        },
        {
            id: 'secure_auth',
            title: 'Secure Account Access',
            description: 'Encrypted login with session protection and password reset management.',
            iconName: 'Key',
            category: 'onboarding'
        },
        {
            id: 'live_updates',
            title: 'Instant Status Notifications',
            description: 'Get notified immediately when your referred candidates clear interview rounds.',
            iconName: 'Bell',
            category: 'dashboard'
        },
        {
            id: 'reports_analytics',
            title: 'Performance Reports',
            description: 'Detailed analytics on submission rates, interview conversion, and monthly earnings.',
            iconName: 'BarChart3',
            category: 'growth'
        },
        {
            id: 'professional_growth',
            title: 'Professional Growth',
            description: 'Expand your recruitment network with SakhiHub Foundation badging and priority job access.',
            iconName: 'Award',
            category: 'growth'
        }
    ],
    workflow: [
        { step: 1, title: 'Register Account', description: 'Fill your profile and submit basic recruitment credentials.', iconName: 'UserPlus' },
        { step: 2, title: 'Admin Verification', description: 'Compliance team verifies partner details and agreement.', iconName: 'ShieldCheck' },
        { step: 3, title: 'Account Approval', description: 'Receive approval notification & log into your partner portal.', iconName: 'CheckCircle2' },
        { step: 4, title: 'Access Dashboard', description: 'Explore live employer job mandates and candidate requirements.', iconName: 'LayoutDashboard' },
        { step: 5, title: 'View Available Jobs', description: 'Filter mandates by location, domain, role, and incentive value.', iconName: 'Search' },
        { step: 6, title: 'Submit Candidates', description: 'Upload candidate resumes with one-click profile entry.', iconName: 'Upload' },
        { step: 7, title: 'Track Status', description: 'Monitor interview schedules, feedback, and offer status.', iconName: 'Activity' },
        { step: 8, title: 'Candidate Joining', description: 'Candidate joins employer organization on agreed date.', iconName: 'UserCheck' },
        { step: 9, title: 'Milestone Completed', description: 'Candidate completes retention period (45 / 60 days).', iconName: 'Clock' },
        { step: 10, title: 'Receive Incentive', description: 'Funds credited directly to your SakhiHub Foundation wallet for withdrawal.', iconName: 'CreditCard' }
    ],
    recruitmentProcess: [
        { stage: 1, label: 'Company Mandate', description: 'Employer publishes job opening on SakhiHub Foundation portal.' },
        { stage: 2, label: 'Job Requirement', description: 'Role details, salary, & incentive terms published.' },
        { stage: 3, label: 'Partner Allocation', description: 'Recruitment partners access mandate on dashboard.' },
        { stage: 4, label: 'Candidate Submission', description: 'Partner submits screened candidate profiles.' },
        { stage: 5, label: 'Interview Round', description: 'Employer schedules and conducts candidate interview.' },
        { stage: 6, label: 'Selection & Offer', description: 'Employer issues formal offer letter to candidate.' },
        { stage: 7, label: 'Joining Date', description: 'Candidate joins duties at company workplace.' },
        { stage: 8, label: '45-Day Retention', description: 'Initial retention milestone verified by admin.' },
        { stage: 9, label: '60-Day Completion', description: 'Full retention criteria satisfied.' },
        { stage: 10, label: 'Incentive Release', description: 'Wallet payout processed & transferred.' }
    ],
    dashboardPreview: [
        { id: 'jobs', title: 'Active Jobs Mandates', metric: '150+ Open Roles', description: 'Real-time corporate & healthcare job openings.', badgeColor: 'bg-blue-500/10 text-blue-600', iconName: 'Briefcase' },
        { id: 'candidates', title: 'Candidate Pipeline', metric: 'Real-time Tracking', description: 'Screening → Interview → Selection → Joining.', badgeColor: 'bg-emerald-500/10 text-emerald-600', iconName: 'Users' },
        { id: 'wallet', title: 'Partner Wallet', metric: 'Instant Ledger', description: 'Track earned, cleared, and pending payouts.', badgeColor: 'bg-indigo-500/10 text-indigo-600', iconName: 'Wallet' },
        { id: 'referrals', title: 'Sub-Recruiter Referrals', metric: 'Tier Incentives', description: 'Grow your recruitment sub-network.', badgeColor: 'bg-amber-500/10 text-amber-600', iconName: 'Share2' }
    ],
    whyCompanies: [
        { title: 'Verified Recruitment Partners', desc: 'Pre-vetted recruiters ensuring authentic candidate profiles.', icon: 'ShieldCheck' },
        { title: 'Rigorous Quality Screening', desc: 'Candidates matched against strict eligibility criteria.', icon: 'CheckCircle2' },
        { title: 'Transparent Hiring Pipeline', desc: 'Live status tracking for employer HR teams.', icon: 'Eye' },
        { title: 'Fast Turnaround Time', desc: 'Rapid candidate submission reducing hiring cycle days.', icon: 'Zap' }
    ],
    statistics: [
        { id: 'partners', label: 'Active Recruitment Partners', value: '500', suffix: '+', description: 'Recruiters across India' },
        { id: 'companies', label: 'Hiring Employers', value: '120', suffix: '+', description: 'Healthcare & Corporates' },
        { id: 'placements', label: 'Successful Placements', value: '2,500', suffix: '+', description: 'Candidates joined' },
        { id: 'states', label: 'States Covered', value: '18', suffix: '+', description: 'National footprint' }
    ],
    testimonials: [
        {
            id: 't1',
            name: 'Ramesh Sharma',
            role: 'Senior Recruitment Partner',
            company: 'Apex Manpower Services, Pune',
            quote: 'SakhiHub Foundation Recruitment portal has given us direct access to healthcare mandates that were previously hard to get. The milestone tracking is completely transparent.',
            rating: 5,
            verified: true
        },
        {
            id: 't2',
            name: 'Priya Verma',
            role: 'Freelance HR Consultant',
            company: 'Independent Partner, Indore',
            quote: 'I can manage my candidate submissions easily from my mobile. The wallet system is clear and payouts are credited on time after retention milestones.',
            rating: 5,
            verified: true
        },
        {
            id: 't3',
            name: 'Anil Deshmukh',
            role: 'Placement Officer',
            company: 'SkillCare Institute, Nagpur',
            quote: 'Partnering with SakhiHub Foundation helped our nursing & healthcare trainees get placed with top hospitals seamlessly. High transparency & prompt support!',
            rating: 5,
            verified: true
        }
    ],
    faqs: [
        {
            id: 'faq1',
            question: 'Who can join the SakhiHub Foundation Recruitment Partner Program?',
            answer: 'Anyone with recruitment experience, including freelance recruiters, HR consultants, placement agencies, college placement cells, and career advisors, can join as a partner.',
            category: 'eligibility'
        },
        {
            id: 'faq2',
            question: 'How do I register as a Recruitment Partner?',
            answer: 'Click on "Become Recruitment Partner", fill out your basic contact and background details, and submit your registration. No registration fee is required.',
            category: 'registration'
        },
        {
            id: 'faq3',
            question: 'Is admin approval required after registration?',
            answer: 'Yes. Our compliance team verifies your details within 24 to 48 hours. Once approved, you will receive login credentials to access your partner dashboard.',
            category: 'registration'
        },
        {
            id: 'faq4',
            question: 'How do I receive job mandates to work on?',
            answer: 'All active job mandates from verified healthcare and corporate employers are listed directly on your partner dashboard with complete role requirements and incentive terms.',
            category: 'jobs'
        },
        {
            id: 'faq5',
            question: 'How are recruitment incentives calculated?',
            answer: 'Incentives are pre-defined for each job mandate based on role seniority, domain, and employer contract. The exact incentive amount is displayed upfront before candidate submission.',
            category: 'payout'
        },
        {
            id: 'faq6',
            question: 'When and how are payouts credited to my wallet?',
            answer: 'Incentives are credited to your SakhiHub Foundation digital wallet once the candidate completes the required retention period (e.g. 45 or 60 days). You can withdraw funds directly to your bank account.',
            category: 'payout'
        },
        {
            id: 'faq7',
            question: 'How do I track my submitted candidates?',
            answer: 'Your partner dashboard features a live candidate pipeline showing real-time updates when candidates are shortlisted, interviewed, offered, or joined.',
            category: 'jobs'
        },
        {
            id: 'faq8',
            question: 'How can I contact support if I have queries?',
            answer: 'You can reach out to our partner success team via email at info@sakhihub.com or call our partner helpline during working hours.',
            category: 'support'
        }
    ],
    support: {
        email: 'info@sakhihub.com',
        phone: '+91 8031492661',
        whatsapp: 'https://wa.me/919111806787',
        officeHours: 'Monday - Saturday: 10:00 AM - 6:00 PM IST',
        helpCenterUrl: '/contact'
    }
};
/**
 * Generate Schema.org JSON-LD structured data for SEO
 */
export function generateRecruitmentSchema() {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SakhiHub Foundation Recruitment Partner Program',
        url: 'https://sakhihub.com/recruitment',
        logo: 'https://sakhihub.com/logo.png',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: RECRUITMENT_LANDING_DATA.support.phone,
            contactType: 'customer service',
            email: RECRUITMENT_LANDING_DATA.support.email
        }
    };
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: RECRUITMENT_LANDING_DATA.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://sakhihub.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Recruitment Partner',
                item: 'https://sakhihub.com/recruitment'
            }
        ]
    };
    return {
        organizationSchema,
        faqSchema,
        breadcrumbSchema
    };
}
