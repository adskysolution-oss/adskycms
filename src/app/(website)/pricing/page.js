import Link from 'next/link';
import { FaCheck, FaStar } from 'react-icons/fa';
import { getActivePricingPlans } from '@/lib/data';

export const metadata = { title: 'Pricing - AdSky Solution' };

export default async function PricingPage() {
  const plans = await getActivePricingPlans();

  return (
    <>
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-secondary top-20 left-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees.</p>
        </div>
      </section>

      <section className="section-padding !pt-0">
        <div className="container-custom">
          {plans.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <p className="text-text-secondary text-lg">No pricing plans available yet.</p>
              <p className="text-text-muted text-sm mt-2">Admin can add plans from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div key={plan._id} className={`relative rounded-2xl p-8 transition-all duration-300 ${plan.highlighted ? 'bg-gradient-to-b from-primary/20 to-dark-light border-2 border-primary/40 scale-105 shadow-2xl shadow-primary/10' : 'glass-card-hover'}`}>
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <FaStar size={10} /> Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{plan.name}</h3>
                  <p className="text-text-muted text-sm mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold gradient-text">{plan.currency}{plan.price.toLocaleString()}</span>
                    <span className="text-text-muted text-sm">/{plan.period === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features?.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-text-secondary text-sm">
                        <FaCheck className="text-secondary flex-shrink-0" size={12} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/about" className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.highlighted ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}`}>
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
