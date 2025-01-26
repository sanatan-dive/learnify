"use client";
import React, { useState, ReactNode } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconArrowLeft, IconBookmark, IconUserBolt } from "@tabler/icons-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Logo, LogoIcon } from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button"; 

interface SidebarComponentProps {
  isLoading: boolean;
  children?: ReactNode;
}

export const SidebarComponent = ({ isLoading, children }: SidebarComponentProps) => {
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false); // State to control logout dialog visibility
  const { isSignedIn, user } = useUser();

  const links = [
    {
      label: "Profile",
      href: "/profile",
      icon: <IconUserBolt className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Bookmarks",
      href: "/bookmarks",
      icon: <IconBookmark className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      href: "#",
      icon: <IconArrowLeft className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => setShowLogoutDialog(true), // Show logout dialog on click
    },
  ];

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row w-full flex-1 max-w-8xl mx-auto border border-neutral-700 dark:border-neutral-600 overflow-hidden",
        "h-screen text-white"
      )}
    >
      {!isLoading && (
        <>
          <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between bg-stone-900 gap-10 dark:bg-black">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <>
                    {isSignedIn ? (
                      link.label === "Logout" && (
                        <SidebarLink
                          key={idx}
                          link={link}
                          className="hover:bg-neutral-800 transition-colors duration-200"
                          onClick={link.onClick}
                        />
                        
                      )
                    ) : (
                      link.label !== "Logout" && (
                        <SidebarLink
                          key={idx}
                          link={link}
                          className="hover:bg-neutral-800 transition-colors duration-200"
                        />
                      )
                    )}
      </>
                  ))}
                  
                </div>
              </div>
              <div>
                <SidebarLink
                  link={{
                    label: isSignedIn ? user?.fullName || "Profile" : "Login",
                    href: isSignedIn ? "/profile" : "/sign-in",
                    icon: (
                      <Image
                        src={user?.imageUrl || ""}default-avatar
                        className="h-7 w-7 flex-shrink-0 rounded-full"
                        width={50}
                        height={50}
                        alt="Avatar"
                      />
                    ),
                  }}
                  className="hover:bg-neutral-800 transition-colors duration-200"
                />
              </div>
            </SidebarBody>
          </Sidebar>

          {/* Logout Confirmation Dialog */}
          <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to logout?</DialogTitle>
                <DialogDescription>
                  This will end your current session. You will need to log in again to access your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <SignOutButton redirectUrl="/">
                  <Button 
                    variant="destructive" 
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default if needed
                     
                    }}
                  >
                    Logout
                  </Button>
                </SignOutButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {children}
    </div>
  );
};
