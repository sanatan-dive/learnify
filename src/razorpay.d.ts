// globals.d.ts or razorpay.d.ts (in your project root or types folder)

interface options {
  key: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler?: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
}

interface Razorpay {
  open(): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => Razorpay;
}
