'use client';

import React from "react";
import Image from "next/image";
import PointsActivityTable from "@/components/pointsActivityTable";
import NextStatusChart from "@/components/ui/charts/nextStatusChart";
import PointsActivityService from "@/lib/PointsActivityService";
import UserProfileService from "@/lib/UserProfileService";

export default function Home() {

  const pointsActivityService = new PointsActivityService();
  const activityData = pointsActivityService.getPointsActivity();
  const currentPoints = pointsActivityService.getCurrentPoints().toLocaleString();
  const currentStatus = pointsActivityService.getCurrentStatus();

  const userProfileService = new UserProfileService();
  const userName = userProfileService.getUserName();
  const userAvatar = userProfileService.getUserAvatar();

  return (
    <div className="page-container profile">
      <div className="sidebar-menu">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ 
              margin: '0 auto', 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              marginBottom: 20
            }}>
              <Image
                src={userAvatar}
                alt={`Profile photo of ${userName}`}
                width={120}
                height={120}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            </div>
            <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>{userName}</h3>
            <p style={{ marginBottom: '8px' }}><strong>Current Status:</strong> {currentStatus}</p>
            <p><strong>Status Points:</strong> {currentPoints}</p>
          </div>

          <div>
          <NextStatusChart />
          </div>
    </div>

    <div className="content">
      <div className="profile-card">
          <PointsActivityTable activityData={activityData} />
      </div>

    </div>
  </div>
  );
}
