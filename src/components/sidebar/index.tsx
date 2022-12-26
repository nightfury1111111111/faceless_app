import React, { useEffect, useState, useCallback } from "react";
export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 w-[220px] h-[100vh] bg-sidebar-bgcolor text-[#FFFFFF]">
      <div className="mt-[16px] mx-auto w-[60px] h-[60px] bg-logo bg-cover cursor-pointer"></div>
      <div className="mt-[69px] bg-[#272942] h-[50px] flex items-center pl-[30px] cursor-pointer">
        <div className="bg-dashboard w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        Dashboard
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer">
        <div className="bg-profile w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        My Profile
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer">
        <div className="bg-staking w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        Staking
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer">
        <div className="bg-analytics w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        Analytics
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer">
        <div className="bg-faq w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        FAQ
      </div>
      <div className="fixed bottom-[38px] left-0 w-[220px]">
        <div className="text-[18px] leading-[21px] text-center">
          Connect with us
        </div>
        <div className="mt-[14px] flex justify-center">
          <div className="w-[30px] h-[30px] bg-discord bg-cover cursor-pointer"></div>
          <div className="ml-[24px] w-[30px] h-[30px] bg-twitter bg-cover cursor-pointer"></div>
        </div>
      </div>
    </div>
  );
}
