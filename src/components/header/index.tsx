import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";

import useWindowSize from "../../utils/useWindowSize";
import useOutsideClick from "../../utils/useOutsideClick";
import { LanguageContext } from "../../App";

import { SolanaNetworkType } from "../../App";
import {
  dashboardStage,
  isLoadingOverlay,
  profile,
  profileModerators,
  profileRoles,
  saveToLocalStorage,
} from "../../utils/store";
import { useAtom } from "jotai";

interface HeaderProps {
  solanaNetwork: SolanaNetworkType;
}

interface Role {
  id: string;
  text: string;
}

const Header = ({ solanaNetwork }: HeaderProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileClicked, setMobileClicked] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [langNum, setLangNum] = useState(0);
  const { language, setLanguage } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();
  const size = useWindowSize();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [, setStage] = useAtom(dashboardStage);
  const [user, setUser] = useAtom(profile);
  const [, setMods] = useAtom(profileModerators);
  const [, setRoles] = useAtom(profileRoles);
  const [isLoading, setLoading] = useAtom(isLoadingOverlay);
  const window = useWindowSize();

  const wallet = useWallet();

  useEffect(() => {
    if (window.width < 640) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  });

  useEffect(() => {
    if (user.walletAddress !== wallet.publicKey) {
      if (wallet.publicKey) {
        setIsWalletConnected(true);

        if (!user.walletAddress) {
          handleLoadingOverlay();
          axios({
            method: "post",
            url: `${process.env.REACT_APP_SERVER_URL}/users/login`,
            data: {
              walletAddress: wallet.publicKey,
            },
          }).then((res) => {
            setUser(res.data.user);
            setMods(res.data.moderators);
            let roles = res.data.user.roles.split(",") as string[];
            let roleArray: Role[] = [];
            roles.forEach((item) => {
              roleArray.push({ id: item, text: item });
            });
            setRoles(roleArray);
          });
        }
      } else {
        handleLoadingOverlay();
        setIsWalletConnected(false);
        setUser({ walletAddress: null, note: null, roles: null });
      }
    }
  }, [wallet]);

  useEffect(() => {
    if (isWalletConnected) {
      // handleLoadingOverlay();
      // toast("Wallet connected!");
    } else {
      // handleLoadingOverlay();
      // toast("Wallet disconnected!");
    }
  }, [isWalletConnected]);

  const goToDasboard = () => {
    navigate("/");
    setStage(0);
  };

  const handleLoadingOverlay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const renderWalletButton1 = () => {
    return (
      <div className="hidden sm:block">
        <WalletMultiButton className="bg-secondary hover:bg-[#15539a]" />
      </div>
    );
  };

  const renderMobileWalletButton = () => {
    if (mobileClicked)
      return (
        <WalletMultiButton className="mt-[40px] bg-secondary hover:bg-[#15539a]" />
      );
  };

  const renderWalletButton2 = () => {
    return (
      <WalletMultiButton className="before-connected hover:bg-[#15539a]">
        Connect
      </WalletMultiButton>
    );
  };

  const mobileMenuHandler = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  const renderMobileMenuButton = () => {
    return (
      <button
        type="button"
        className="text-4xl text-secondary sm:hidden"
        onClick={mobileMenuHandler}
      >
        {isMobileMenuOpen ? (
          <i className="bi bi-x-lg" />
        ) : (
          <i className="bi bi-list" />
        )}
      </button>
    );
  };

  useEffect(() => {
    if (size.width < 1024) {
      setIsMobile(true);
    } else setIsMobile(false);
  }, [size]);

  useEffect(() => {
    if (mobileClicked) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [mobileClicked]);

  const ref = useRef<HTMLHeadingElement>(null);
  useOutsideClick(ref, () => {
    if (mobileClicked) {
      setMobileClicked(false);
    }
  });

  const ref2 = useRef<HTMLHeadingElement>(null);
  useOutsideClick(ref2, () => {
    if (languageOpen) {
      setLanguageOpen(false);
    }
  });

  const showComingSoon = () => {
    toast("Coming soon.");
  };

  return wallet.publicKey ? (
    <div className="relative w-full z-[20]" ref={ref}>
      <div className="fixed header top-[30px] md:top-[43px] sm:px-[48px] px-[20px] w-full h-[83px] md:h-[100px] border-b-[2px] border-b-[#121217] bg-secondary flex flex-row items-center justify-between z-10">
        <div className="flex flex-row cursor-pointer">
          <div
            className="bg-logo bg-cover bg-center w-[40px] md:w-[60px] h-[40px] md:h-[60px]"
            onClick={() => {
              goToDasboard();
            }}
          />
        </div>
        <div className="flex items-center text-[14px] md:text-[18px] font-[600] text-[#545454]">
          <div
            className="mr-[40px] cursor-pointer hidden sm:block font-[700] text-[#FFFFFF]"
            onClick={() => {
              goToDasboard();
            }}
          >
            DASHBOARD
          </div>
          <div
            className="mr-[40px] cursor-pointer hidden sm:block"
            onClick={() => showComingSoon()}
          >
            PROFILE
            {/* <span className="ml-[10px] text-[12px]">soon</span> */}
          </div>
          <div
            className="mr-[40px] cursor-pointer hidden sm:block"
            onClick={() => showComingSoon()}
          >
            LEADERBOARD
            {/* <span className="ml-[10px] text-[12px]">soon</span> */}
          </div>
          <div
            className="mr-[56px] cursor-pointer hidden sm:block"
            onClick={() => showComingSoon()}
          >
            STAKING
            {/* <span className="ml-[10px] text-[12px]">soon</span> */}
          </div>
          <a
            className="mr-[36px] cursor-pointer hidden sm:block w-[30px] h-[30px] bg-discord bg-cover"
            href={"https://discord.com/invite/HRhdNPhB2A"}
            target="_blank"
            rel="noreferrer"
          ></a>
          <a
            className="mr-[40px] cursor-pointer hidden sm:block w-[30px] h-[30px] bg-twitter bg-cover"
            href={"https://twitter.com/facelesslabsnft"}
            target="_blank"
            rel="noreferrer"
          ></a>
          {renderWalletButton1()}
          {!mobileClicked ? (
            <div
              className="bg-mobile-open bg-cover w-[40px] h-[40px] block sm:hidden"
              onClick={() => {
                setMobileClicked(true);
              }}
            ></div>
          ) : (
            <div
              className="bg-mobile-close bg-cover w-[40px] h-[40px] block sm:hidden"
              onClick={() => {
                setMobileClicked(false);
              }}
            ></div>
          )}
        </div>

        <div className="overlay fixed w-full h-full top-0 z-[30] left-0 lg:hidden"></div>
      </div>
      {mobileClicked && (
        <div className="fixed top-[113px] left-0 w-full h-[calc(100vh-113px)] bg-secondary flex flex-col items-center text-[20px]">
          <div
            className="mt-[40px] cursor-pointer font-[700] text-[#FFFFFF]"
            onClick={() => {
              goToDasboard();
            }}
          >
            DASHBOARD
          </div>
          <div
            className="mt-[40px] text-[#CFCFCF] cursor-pointer"
            onClick={() => showComingSoon()}
          >
            PROFILE
            {/* <span className="ml-[10px] text-[12px]">soon</span> */}
          </div>
          <div
            className="mt-[40px] text-[#CFCFCF] cursor-pointer"
            onClick={() => showComingSoon()}
          >
            LEADERBOARD
            {/* <span className="ml-[10px] text-[12px]">soon</span> */}
          </div>
          <div
            className="mt-[40px] text-[#CFCFCF] cursor-pointer"
            onClick={() => showComingSoon()}
          >
            STAKING
            {/* <span className="ml-[10px] text-[12px]">soon</span> */}
          </div>
          <div className="flex mt-[40px]">
            <a
              className="cursor-pointer w-[30px] h-[30px] bg-discord bg-cover"
              href={"https://discord.com/invite/HRhdNPhB2A"}
              target="_blank"
              rel="noreferrer"
            ></a>
            <a
              className="ml-[40px] cursor-pointer w-[30px] h-[30px] bg-twitter bg-cover"
              href={"https://twitter.com/facelesslabsnft"}
              target="_blank"
              rel="noreferrer"
            ></a>
          </div>
          {renderMobileWalletButton()}
        </div>
      )}
    </div>
  ) : (
    <div className="relative w-full z-[20]" ref={ref}>
      <div className="fixed top-0 right-0 sm:px-[28px] px-[20px] w-full h-[83px] flex flex-row items-center justify-end z-10">
        <div className="flex items-center">{renderWalletButton2()}</div>
      </div>
    </div>
  );
};

export default Header;
