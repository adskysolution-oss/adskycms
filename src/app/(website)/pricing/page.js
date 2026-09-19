import Link from 'next/link';
import { FaCheck, FaStar } from 'react-icons/fa';
import { Sparkles, Check } from 'lucide-react';
import { getActivePricingPlans } from '@/lib/data';
import { CardSpotlight } from '@/components/ui/card-spotlight';

export const metadata = { title: 'Pricing - AdSky Solution' };

export default async function PricingPage() {
  const plans = await getActivePricingPlans();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="deco-blob deco-blob-blue w-[500px] h-[500px] -top-32 -right-32 animate-blob" />
        <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/2 -left-32 animate-blob" style={{ animationDelay: '5s' }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles size={13} />
            <span>Transparent Investment</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-padding !pt-0 relative overflow-hidden pb-28">
        <div className="deco-dot top-[20%] right-[10%] w-3 h-3 bg-secondary opacity-25 hidden lg:block" />
        <div className="deco-ring w-20 h-20 bottom-[15%] left-[6%] hidden lg:block" />

        <div className="container-custom relative z-10">
          {plans.length === 0 ? (
            <div className="glass-card p-16 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-lg font-semibold">
                No pricing plans available yet.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Admin can add plans from the dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {plans.map((plan) => (
                <CardSpotlight
                  key={plan._id}
                  color="rgba(37, 99, 235, 0.08)"
                  className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                    plan.highlighted
                      ? 'bg-gradient-to-b from-blue-50/90 via-white to-white border-2 border-primary shadow-2xl shadow-primary/15 md:-translate-y-2'
                      : 'bg-white/90 border border-slate-200/90 hover:border-slate-300 shadow-md'
                  }`}
                >
                  <div>
                    {plan.highlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                        <FaStar size={11} className="text-amber-300" /> Most Popular
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>

                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mb-8 pb-6 border-b border-slate-100">
                      <span className="text-4xl sm:text-5xl font-extrabold gradient-text tracking-tight">
                        {plan.currency}
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-sm font-medium ml-1">
                        /{plan.period === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {plan.features?.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-slate-700 text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/about"
                    className={`block text-center py-3.5 rounded-xl font-bold transition-all text-sm ${
                      plan.highlighted
                        ? 'btn-primary w-full justify-center !rounded-xl'
                        : 'btn-secondary w-full justify-center !rounded-xl'
                    }`}
                  >
                    Get Started
                  </Link>
                </CardSpotlight>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}