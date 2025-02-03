"use client";
import React, { useEffect, useState } from "react";
import { SidebarComponent } from "@/components/SidebarComponent";
import { LandingPageContent } from "@/components/LandingPage";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { isSignedIn, user } = useUser();
  const saveUserInfo = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await axios.post("/api/saveUserInfo", {
        email: user.emailAddresses[0]?.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        userId: user.id,
      });
      setIsLoading(false);
      
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving user info:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      saveUserInfo(); 
    }
  }, [isSignedIn, user]);
  return (
    <div className="flex">
      
     
        <LandingPageContent setIsLoading={setIsLoading} />


    </div>
  );
}