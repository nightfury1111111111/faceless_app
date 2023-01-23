import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="fixed left-0 top-0 z-20 w-[220px] h-[100vh] bg-[#000] text-[#FFFFFF] sidebar">
      <div className="w-full h-full absolute z-[-1]  bg-sidebar-bgcolor"></div>

      <div className="mt-[16px] mx-auto w-[60px] h-[60px] bg-logo bg-cover cursor-pointer"></div>
      <div
        className={
          location.pathname === "/"
            ? "mt-[69px] bg-[#272942] h-[50px] flex items-center pl-[30px] cursor-pointer"
            : "mt-[69px] h-[50px] flex items-center pl-[30px] cursor-pointer hover:bg-[#0c3150]"
        }
        onClick={() => {
          navigate("/");
        }}
      >
        <div className="bg-dashboard w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        Dashboard
      </div>
      <div
        className={
          location.pathname === "/profile"
            ? "bg-[#272942] h-[50px] flex items-center pl-[30px] cursor-pointer"
            : "h-[50px] flex items-center pl-[30px] cursor-pointer hover:bg-[#0c3150]"
        }
        onClick={() => {
          navigate("/profile");
        }}
      >
        <div className="bg-profile w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        My Profile
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer hover:bg-[#0c3150]">
        <div className="bg-staking w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        <div className="flex flex-col">
          Staking
          <div className="text-[10px] text-[#C7C7C7]">(Coming soon)</div>
        </div>
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer hover:bg-[#0c3150]">
        <div className="bg-analytics w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        <div className="flex flex-col">
          Analytics
          <div className="text-[10px] text-[#C7C7C7]">(Coming soon)</div>
        </div>
      </div>
      <div className="h-[50px] flex items-center pl-[30px] cursor-pointer hover:bg-[#0c3150]">
        <div className="bg-faq w-[24px] h-[24px] bg-cover mr-[20px]"></div>
        FAQ
      </div>
      <div className="fixed bottom-[38px] left-0 w-[220px]">
        <div className="text-[18px] leading-[21px] text-center">
          Connect with us
        </div>
        <div className="mt-[14px] flex justify-center">
          <a
            className="w-[30px] h-[30px] bg-discord bg-cover cursor-pointer"
            href={"https://discord.com/invite/HRhdNPhB2A"}
            target="_blank"
            rel="noreferrer"
          ></a>
          <a
            className="ml-[24px] w-[30px] h-[30px] bg-twitter bg-cover cursor-pointer"
            href={"https://twitter.com/facelesslabsnft"}
            target="_blank"
            rel="noreferrer"
          ></a>
        </div>
      </div>
    </div>
  );
}
