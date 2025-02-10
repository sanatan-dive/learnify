"use client";
import { useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { useRouter } from "next/navigation";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SidebarComponent } from "@/components/SidebarComponent";
import { Youtube, BookOpen, PlayCircle, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const reviews = [
  {
    name: "Amit",
    username: "@amit",
    body: "This platform helped me create a roadmap for my AI project in minutes! Highly recommended.",
    img: "https://avatar.vercel.sh/amit",
  },
  {
    name: "Neha",
    username: "@neha",
    body: "I love how easy it is to generate personalized roadmaps. It saved me so much time!",
    img: "https://avatar.vercel.sh/neha",
  },
  {
    name: "Raj",
    username: "@raj",
    body: "The AI-generated roadmaps are incredibly detailed and tailored to my needs. Amazing tool!",
    img: "https://avatar.vercel.sh/raj",
  },
  {
    name: "Priya",
    username: "@priya",
    body: "I was stuck on my project, but this platform gave me a clear direction. Thank you!",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Vikram",
    username: "@vikram",
    body: "The roadmaps are so intuitive and easy to follow. Perfect for beginners and experts alike.",
    img: "https://avatar.vercel.sh/vikram",
  },
  {
    name: "Anjali",
    username: "@anjali",
    body: "This is exactly what I needed to organize my project. The AI suggestions are spot on!",
    img: "https://avatar.vercel.sh/anjali",
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
    <figure className="relative w-64 cursor-pointer overflow-hidden rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm p-4 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full ring-2 ring-gray-700" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-gray-100">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-gray-400">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-xs leading-relaxed text-gray-300">{body}</blockquote>
    </figure>
  );
};

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const placeholders = ["Enter your Topic", "Generate a Roadmap"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/landing?query=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error("Error navigating to landing page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleResources = [
    {
      type: "YouTube Playlists",
      title: "Complete Web Development Bootcamp",
      icon: Youtube,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "group-hover:border-red-500/50",
    },
    {
      type: "Coursera Courses",
      title: "Machine Learning Specialization",
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "group-hover:border-blue-500/50",
    },
    {
      type: "Udemy Courses",
      title: "Python for Data Science",
      icon: PlayCircle,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "group-hover:border-purple-500/50",
    },
    {
      type: "Medium blogs",
      title: "Getting Started with React",
      icon: FileText,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "group-hover:border-green-500/50",
    },
  ];

  return (
    <div className="h-screen flex flex-col gap-8 justify-center items-center w-full overflow-hidden p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-[1000px] mx-auto mt-8 px-4 text-center"
      >
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Find the Best Resources on Any Topic
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-6">
          Discover curated learning resources from top platforms
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight mb-4">
          All In One Place
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-3xl px-4 mb-8"
      >
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
          disabled={isLoading}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl mx-auto px-4 mb-12"
      >
        {sampleResources.map((resource, index) => (
          <Card
            key={index}
            className={cn(
              "p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-800 bg-gray-900/50 backdrop-blur-sm group hover:-translate-y-1",
              resource.borderColor
            )}
          >
            <div className={cn(resource.bgColor, "p-3 rounded-lg inline-block mb-4")}>
              <resource.icon className={cn("h-6 w-6", resource.color)} />
            </div>
            <h3 className="font-semibold mb-2 text-gray-100 text-sm">{resource.type}</h3>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              {resource.title}
            </p>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full"
      >
        <div className="relative flex h-72 w-full flex-col z-20 items-center justify-end overflow-hidden">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee pauseOnHover reverse className="[--duration:40s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[10%] bg-gradient-to-r from-gray-950"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-gray-950"></div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl shadow-xl shadow-purple-500/10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      )}
    </div>
  );
}
