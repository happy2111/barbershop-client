import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SkeletonPulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-muted rounded-md ${className}`} />
);

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Skeleton Personal Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <SkeletonPulse className="h-8 w-48" /> {/* Title */}
              <SkeletonPulse className="h-9 w-24" /> {/* Edit Button */}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <SkeletonPulse className="w-28 h-28 rounded-full" /> {/* Avatar */}
              <div className="space-y-2">
                <SkeletonPulse className="h-7 w-40" /> {/* Name */}
                <SkeletonPulse className="h-4 w-32" /> {/* Phone */}
              </div>
            </div>
            <div className="space-y-3 pt-4">
              <SkeletonPulse className="h-4 w-full" /> {/* Description line 1 */}
              <SkeletonPulse className="h-4 w-5/6" /> {/* Description line 2 */}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Services */}
        <Card>
          <CardHeader>
            <SkeletonPulse className="h-7 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 flex gap-4">
                  <SkeletonPulse className="w-16 h-16 rounded-md" /> {/* Service Image */}
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-4 w-full" />
                    <SkeletonPulse className="h-3 w-1/2" />
                    <SkeletonPulse className="h-5 w-3/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Change Password */}
        <Card>
          <CardHeader>
            <SkeletonPulse className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <SkeletonPulse className="h-10 w-full" />
            <SkeletonPulse className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Skeleton Blocked Time */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <SkeletonPulse className="h-7 w-44" />
              <SkeletonPulse className="h-9 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <SkeletonPulse key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ProfileSkeleton;