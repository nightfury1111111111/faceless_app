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

  const [user, setUser] = useAtom(profile);
  const [, setMods] = useAtom(profileModerators);
  const [, setRoles] = useAtom(profileRoles);
  const [isLoading, setLoading] = useAtom(isLoadingOverlay);

  const wallet = useWallet();

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

  const handleLoadingOverlay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const renderWalletButton1 = () => {
    return <WalletMultiButton className="bg-secondary hover:bg-[#15539a]" />;
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
      toggleSidebar();
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

  console.log();

  const toggleSidebar = () => {
    document.querySelector("body")?.classList.toggle("menu-opened");
  };

  return wallet.publicKey ? (
    <div className="relative w-full z-[20]" ref={ref}>
      <div className="fixed header top-[30px] sm:px-[48px] px-[20px] w-full h-[83px] bg-secondary flex flex-row items-center justify-between z-10">
        <div className="flex flex-row cursor-pointer" onClick={toggleSidebar}>
          <div className="bg-hidden bg-cover bg-center w-[30px] h-[30px]" />
        </div>
        <div className="flex items-center">
          <div className="bg-user bg-cover w-[32px] h-[32px] mr-[33px] cursor-pointer hidden sm:block"></div>
          {renderWalletButton1()}
        </div>

        <div
          className="overlay fixed w-full h-full top-0 z-[30] left-0 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      </div>
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
