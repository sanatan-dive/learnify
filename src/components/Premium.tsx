import Script from 'next/script';

export default function UpgradeButton({ userId }: { userId: string }) {
  const handleSubscribe = async () => {
    const res = await fetch('/api/razorpay/create-subscription', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    const { subscription } = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      subscription_id: subscription.id,
      name: "Learnify Premium",
      description: "Unlock unlimited quizzes and roadmaps",
      handler: async function (response: any) {
        // Call backend to verify payment and update plan
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
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={handleSubscribe} className="btn btn-primary">
        Upgrade to Premium
      </button>
    </>
  );
}
