import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 w-full px-4 sm:px-8">
        {/* YouTube Playlist Section */}
        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 w-full shadow-2xl">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-32 bg-gray-700" />
            <Skeleton className="h-4 w-24 bg-gray-700" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3,4,5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-20 w-32 bg-gray-700" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full bg-gray-700" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coursera and Udemy Section */}
        <div className="flex flex-col gap-8 h-full w-full">
          {/* Coursera */}
          <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 w-full shadow-2xl">
            <CardHeader>
              <Skeleton className="h-10 w-32 bg-gray-700" />
            </CardHeader>
            <CardContent className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-full bg-gray-700" />
                  <Skeleton className="h-8 w-2/3 bg-gray-700" />
                  <Skeleton className="h-8 w-1/3 bg-gray-700" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Udemy */}
          <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 w-full shadow-2xl">
            <CardHeader>
              <Skeleton className="h-10 w-32 bg-gray-700" />
            </CardHeader>
            <CardContent className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-full bg-gray-700" />
                  <Skeleton className="h-8 w-2/3 bg-gray-700" />
                  <Skeleton className="h-8 w-1/3 bg-gray-700" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Medium Blogs Section */}
        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 w-full shadow-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-700" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-2/3 bg-gray-700" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkeletonLoader;
