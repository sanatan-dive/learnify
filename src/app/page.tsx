"use client"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextRevealCard } from "@/components/ui/text-reveal-card";


export default function Home() {
  const placeholders = [
    "Enter your Topic",
    "Generate a Roadmap"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    
    <div className="min-h-screen flex flex-col gap-8 justify-center items-center  ">
      

<TextRevealCard text="Your Personalized Guide" revealText="At one click" />
      <PlaceholdersAndVanishInput  
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />

     
     
    </div>
  );
}
