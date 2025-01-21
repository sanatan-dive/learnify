"use client";
import { useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { useRouter } from "next/navigation";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Alice",
    username: "@alice",
    body: "This platform helped me create a roadmap for my AI project in minutes! Highly recommended.",
    img: "https://avatar.vercel.sh/alice",
  },
  {
    name: "Bob",
    username: "@bob",
    body: "I love how easy it is to generate personalized roadmaps. It saved me so much time!",
    img: "https://avatar.vercel.sh/bob",
  },
  {
    name: "Charlie",
    username: "@charlie",
    body: "The AI-generated roadmaps are incredibly detailed and tailored to my needs. Amazing tool!",
    img: "https://avatar.vercel.sh/charlie",
  },
  {
    name: "Diana",
    username: "@diana",
    body: "I was stuck on my project, but this platform gave me a clear direction. Thank you!",
    img: "https://avatar.vercel.sh/diana",
  },
  {
    name: "Eve",
    username: "@eve",
    body: "The roadmaps are so intuitive and easy to follow. Perfect for beginners and experts alike.",
    img: "https://avatar.vercel.sh/eve",
  },
  {
    name: "Frank",
    username: "@frank",
    body: "This is exactly what I needed to organize my project. The AI suggestions are spot on!",
    img: "https://avatar.vercel.sh/frank",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-200 bg-white hover:bg-gray-100",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-gray-900">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-gray-500">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-gray-700">{body}</blockquote>
    </figure>
  );
};

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const placeholders = [
    "Enter your Topic",
    "Generate a Roadmap"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Encode the query for the URL
    const encodedQuery = encodeURIComponent(query);

    // Set loading state to true
    setIsLoading(true);

    try {
      // Simulate a delay (optional, for loading state)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to the landing page with the query as a URL parameter
      router.push(`/landing?query=${encodedQuery}`);
    } catch (error) {
      console.error("Error navigating to landing page:", error);
      // Optionally, show an error message to the user
    } finally {
      // Set loading state to false
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-8 justify-center items-center ">
      {/* Text Reveal Card */}
      <TextRevealCard text="Your Personalized Guide" revealText="At one click" />

      {/* Placeholders and Vanish Input */}
      <PlaceholdersAndVanishInput  
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
        disabled={isLoading} 
      />

      {/* Reviews Marquee Section */}
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  ">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover reverse className="[--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
       
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#1f1f1f]"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#1f1f1f]"></div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="text-white">Loading...</p>
        </div>
      )}
    </div>
  );
}