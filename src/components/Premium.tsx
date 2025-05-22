import Script from 'next/script';
import { useState } from 'react';
import { Check, Star, Zap, Target, BarChart3, Infinity, Crown } from 'lucide-react';

export default function PricingPlans({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      const { subscription } = await res.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: subscription.id,
        name: "Learnify Premium",
        description: "Unlock unlimited learning potential",
        handler: async function (response: any) {
          await fetch('/api/razorpay/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_subscription_id: subscription.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
            }),
          });
          window.location.reload();
        },
        theme: { color: "#4F46E5" },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: "Explorer",
      price: "Free",
      period: "forever",
      description: "Perfect for learners just getting started",
      features: [
        { icon: <Target className="w-4 h-4" />, text: "3 AI-generated learning roadmaps per week" },
        { icon: <Zap className="w-4 h-4" />, text: "5 intelligent search queries per week" },
        { icon: <BarChart3 className="w-4 h-4" />, text: "1 detailed quiz analysis per week" },
        { icon: <Star className="w-4 h-4" />, text: "Community support access" }
      ],
      buttonText: "Current Plan",
      isPopular: false,
      gradient: "from-slate-600 to-slate-700"
    },
    {
      name: "Pro Learner",
      price: "$6.99",
      period: "per month",
      description: "Unleash your full learning potential",
      features: [
        { icon: <Infinity className="w-4 h-4" />, text: "Unlimited AI learning roadmaps" },
        { icon: <Infinity className="w-4 h-4" />, text: "Unlimited smart search queries" },
        { icon: <Infinity className="w-4 h-4" />, text: "Unlimited detailed quiz analyses" },
        { icon: <Crown className="w-4 h-4" />, text: "Priority customer support" },
        { icon: <Zap className="w-4 h-4" />, text: "Advanced learning analytics" },
        { icon: <Star className="w-4 h-4" />, text: "Early access to new features" }
      ],
      buttonText: "Upgrade Now",
      isPopular: true,
      gradient: "from-blue-600 to-purple-600"
    }
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="min-h-screen absolute  py-16 px-4" >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6">
              <Crown className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Choose Your Learning Journey</span>
            </div>
            <h1 className="text-5xl font-bold font-serif text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Unlock Your Potential
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Choose the perfect plan to accelerate your learning journey with AI-powered insights and unlimited growth opportunities
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative group transform transition-all duration-500 hover:scale-105 ${
                  plan.isPopular ? 'md:-translate-y-4' : ''
                }`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                {/* Card */}
                <div 
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-500 group-hover:shadow-2xl ${
                    plan.isPopular 
                      ? 'border-blue-500/50 shadow-blue-500/20 shadow-xl bg-gradient-to-br from-slate-800/80 to-blue-900/20' 
                      : 'border-gray-700/50 hover:border-gray-600/50 bg-gradient-to-br from-slate-800/60 to-slate-900/80'
                  }`}
                  style={{
                    backdropFilter: 'blur(10px)',
                    background: plan.isPopular 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(20, 24, 53, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  }}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                      backgroundSize: '30px 30px',
                      animation: 'float 6s ease-in-out infinite'
                    }}></div>
                  </div>

                  {/* Glowing Edge Effect */}
                  {plan.isPopular && (
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-2xl" style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      }}></div>
                    </div>
                  )}

                  <div className="relative p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 ${
                        plan.isPopular ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'
                      }`}>
                        {plan.isPopular ? <Crown className="w-8 h-8 text-white" /> : <Star className="w-8 h-8 text-white" />}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-4xl font-bold transition-all duration-300 ${
                            plan.isPopular ? 'text-blue-400 group-hover:text-blue-300' : 'text-white'
                          }`}>
                            {plan.price}
                          </span>
                          {plan.period !== 'forever' && (
                            <span className="text-gray-400 text-sm">/{plan.period.split(' ')[1]}</span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">{plan.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex}
                          className="flex items-start gap-3 group/feature"
                          style={{
                            animationDelay: `${(index * 200) + (featureIndex * 100)}ms`,
                            animation: 'slideInLeft 0.6s ease-out forwards'
                          }}
                        >
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover/feature:scale-110 ${
                            plan.isPopular 
                              ? 'bg-blue-500/20 text-blue-400 group-hover/feature:bg-blue-500/30' 
                              : 'bg-gray-600/30 text-gray-400 group-hover/feature:bg-gray-500/40'
                          }`}>
                            {feature.icon}
                          </div>
                          <span className="text-gray-300 text-sm leading-relaxed group-hover/feature:text-white transition-colors duration-300">
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={plan.buttonText === "Upgrade Now" ? handleSubscribe : undefined}
                      disabled={isLoading || plan.buttonText === "Current Plan"}
                      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/30'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500'
                      } ${
                        plan.buttonText === "Current Plan" ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      }`}
                    >
                      {isLoading && plan.buttonText === "Upgrade Now" ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        plan.buttonText
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-16 opacity-0" style={{ animation: 'fadeIn 1s ease-out 1.5s forwards' }}>
            <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}