"use client";
import { useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { useRouter } from "next/navigation";

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
    } finally {
      // Set loading state to false
      setIsLoading(false);
    }

   
  };

  return (
    <BackgroundLines className="absolute inset-0 -z-10 h-full w-full items-center [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
      <div className="min-h-screen flex flex-col gap-8 justify-center items-center">
        <TextRevealCard text="Your Personalized Guide" revealText="At one click" />
        <PlaceholdersAndVanishInput  
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
          disabled={isLoading} // Disable input while loading
        />
        {isLoading && <p className="text-white">Loading...</p>} {/* Loading indicator */}
      </div>
    </BackgroundLines>
  );
}