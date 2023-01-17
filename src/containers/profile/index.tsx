import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, createAccount } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";

import { Idl } from "@project-serum/anchor/dist/cjs/idl";
import React, { Component, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";
import idl from "../../idl.json";

import { constants } from "../../constants";
import { validateAddress } from "../../utils/general";
export interface EscrowData {
  randomSeed: number;
  initializerKey: PublicKey;
  initializerDepositTokenAccount: PublicKey;
  initializerAmount: Array<number>;
  admin1: PublicKey;
  resolver: PublicKey;
  admin2TokenAccount: PublicKey;
  pubkey: PublicKey;
  active: boolean;
  index: number;
}

const programID = new PublicKey(idl.metadata.address);

const Profile = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    console.log(publicKey);
  }, [publicKey]);

  return (
    <div className="bg-dashboard-backcolor min-h-[100vh] px-[49px] pb-[75px]">
      <div className="flex items-center">
        <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
          My Profile
        </div>
      </div>
      <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
        Create and update your profile within the Faceless ecosystem.
      </div>
      <div className="mt-[82px] rounded-[10px] bg-profile-card-bgcolor">
        <div className="py-[16px] px-[25px] font-[600] text-[22px] leading-[26px]">
          Connections
        </div>
        <div className="rounded-[10px] bg-profile-card-inner-bgcolor h-[262px] flex items-center justify-between px-[49px]">
          <div className="flex items-center">
            <div className="w-[150px] h-[150px] bg-white rounded-[200px] cursor-pointer"></div>
            <div className="ml-[33px]">
              <div className="w-[214px] h-[45px] rounded-[5px] bg-[#7c98a9] flex items-center pl-[21px] cursor-pointer">
                <div className="bg-twitter bg-cover w-[21px] h-[21px]"></div>
                <div className="ml-[18px] text-[20px] leading-[23px] font-[400]">
                  @twitteruser
                </div>
              </div>
              <div className="mt-[32px] w-[214px] h-[45px] rounded-[5px] bg-[#7c98a9] flex items-center pl-[21px] cursor-pointer">
                <div className="bg-twitter bg-cover w-[21px] h-[21px]"></div>
                <div className="ml-[18px] text-[20px] leading-[23px] font-[400]">
                  @discorduser
                </div>
              </div>
            </div>
          </div>
          <div className="w-[467px]">
            <div className="text-[20px] leading-[23px] font-[300]">
              Connect your Solana wallet. Keep in mind, your reviews and scores
              are registered to only one wallet.
            </div>
            <div className="mt-[37px] flex justify-between items-center">
              <div className="bg-[#7c98a9] rounded-[5px] flex justify-center items-center text-[20px] leading-[23px] font-[800] py-[10px] px-[14px] cursor-pointer">
                Disconnect
              </div>
              <div className="bg-[#1c262d] rounded-[9px] flex justify-center items-center text-[20px] leading-[23px] font-[700] py-[16px] px-[13px] cursor-pointer">
                {publicKey &&
                  publicKey?.toString().slice(0, 10) +
                    "..." +
                    publicKey?.toString().slice(-10)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[40px] rounded-[10px] bg-profile-card-bgcolor">
        <div className="py-[16px] px-[25px] font-[600] text-[22px] leading-[26px]">
          Profile
        </div>
        <div className="pt-[45px] rounded-[10px] bg-profile-card-inner2-bgcolor pb-[45px] flex justify-between px-[49px] leading-[23px] text-[20px]">
          <div>
            <div className="font-[300]">
              Write a short description about yourself
            </div>
            <div className="mt-[31px]">
              <textarea className="h-[110px] w-[470px] bg-[#1c1c1c] rounded-[9px] px-[14px] py-[20px]" />
            </div>
          </div>
          <div className="w-[467px]">
            <div className="text-[20px] leading-[23px] font-[300]">
              Select skills that best suit you
            </div>
            <input className="mt-[31px] w-[467px] h-[59PX] rounded-[9px] p-[12px] bg-[#1C1C1C]" />
            <div className="mt-[16px] flex">
              <div className="bg-[#7c98a9] rounded-[5px] text-[20px] leading-[23px] font-[800] py-[10px] px-[14px] cursor-pointer">
                Moderator -
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
