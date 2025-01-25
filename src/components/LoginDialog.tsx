import { motion } from "framer-motion";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";

interface LoginDialogProps {
  setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

function LoginDialog({ setShowLoginDialog }: LoginDialogProps) {
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);

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
      setShowLoginDialog(false); 
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-neutral-900 p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-800/50"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Login Required</h2>
        <p className="text-gray-400 mb-6">
          To bookmark this, please log in or sign up.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowLoginDialog(false)}
            className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-all"
          >
            Cancel
          </button>
          <SignInButton>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
              Login / Sign Up
            </button>
          </SignInButton>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginDialog;
