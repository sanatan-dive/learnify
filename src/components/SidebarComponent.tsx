import React, { useState, ReactNode } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconArrowLeft, IconArrowRight, IconBookmark, IconHome, IconSearch } from "@tabler/icons-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUser, SignOutButton, SignInButton } from "@clerk/nextjs";
import { Logo, LogoIcon } from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button"; 

interface SidebarComponentProps {
  isLoading: boolean;
  children?: ReactNode;
}

export const SidebarComponent = ({ isLoading, children }: SidebarComponentProps) => {
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSigninDialog, setShowSigninDialog] = useState(false);
  const { isSignedIn, user } = useUser();

  const links = [
    {
      label: "Home",
      href: "/",
      icon: <IconHome className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Search",
      href: "/search",
      icon: <IconSearch className="text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Bookmarks",
      href: "/bookmarks",
      icon: <IconBookmark className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];

  const handleLogoutClick = () => {
    setShowLogoutDialog(true); // Open logout confirmation dialog
  };

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
            <SidebarBody className="justify-between bg-gradient-to-t from-[#1f1f1f] to-[#131313] gap-10 dark:bg-black">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {open ? <Logo /> : <LogoIcon />}
                
                <div className="mt-8 flex flex-col gap-2">
                  {isSignedIn && (
                    <>
                      {links.map((link, idx) => (
                        <SidebarLink
                          key={idx}
                          link={link}
                          className="hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-200 ease-in-out"
                        />
                      ))}
                    </>
                  )}
                </div>
                {isSignedIn ? (
                  <SidebarLink
                    link={{
                      label: "Logout",
                      href: "#",
                      icon: <IconArrowLeft className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
                    }}
                    className="hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-200 ease-in-out"
                    onClick={handleLogoutClick} // Show logout dialog
                  />
                ) : (
                  <SidebarLink
                    link={{
                      label: "Sign In",
                      href: "#",
                      icon: <IconArrowRight className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
                    }}
                    className="hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-200 ease-in-out"
                    onClick={() => setShowSigninDialog(true)} // Open sign-in dialog
                  />
                )}
              </div>
              
              <div>
                {isSignedIn && (
                  <>
                    <SidebarLink
                      link={{
                        label: user?.fullName || "Profile",
                        href: "/profile",
                        icon: (
                          <Image
                            src={user?.imageUrl || ""}
                            className="h-7 w-7 flex-shrink-0 rounded-full"
                            width={50}
                            height={50}
                            alt="Avatar"
                          />
                        ),
                      }}
                      className="hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-200 ease-in-out"
                    />
                  </>
                )}
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
                  <Button variant="destructive">
                    Logout
                  </Button>
                </SignOutButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sign In Confirmation Dialog */}
          <Dialog open={showSigninDialog} onOpenChange={setShowSigninDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign In to Your Account</DialogTitle>
                <DialogDescription>
                  Please log in to access your account and features.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <SignInButton redirectUrl="#">
                  <Button variant="destructive">
                    Signin
                  </Button>
                </SignInButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {children}
    </div>
  );
};
