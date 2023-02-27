/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1280px",
    },
    fontSize: {
      sm: "1rem",
      base: "1.25rem",
    },
    extend: {
      colors: {
        primary: "#7C98A9",
        dark: "#26363E",
        secondary: "#0A0E12",
      },
      backgroundImage: (theme) => ({
        arrow: "url('./assets/images/footer/arrow.png')",
        banner: "url('./assets/images/home/banner.png')",
        image1: "url('./assets/images/home/image1.png')",
        image2: "url('./assets/images/home/image2.png')",
        icon1: "url('./assets/images/home/icon1.svg')",
        icon2: "url('./assets/images/home/icon2.svg')",
        icon3: "url('./assets/images/home/icon3.svg')",
        icon4: "url('./assets/images/home/icon4.svg')",
        icon5: "url('./assets/images/home/icon5.svg')",
        link: "url('./assets/images/home/link-external.svg')",
        check: "url('./assets/images/check.svg')",
        logo: "url('./assets/images/logo.png')",
        loading: "url('./assets/images/loading.svg')",
        splash: "url('./assets/images/splash.png')",
        dispute: "url('./assets/images/dispute.svg')",
        progress: "url('./assets/images/progress.svg')",
        "new-splash": "url('./assets/images/new-splash.png')",
        hidden: "url('./assets/images/header/hidden.png')",
        user: "url('./assets/images/header/user.png')",
        dashboard: "url('./assets/images/sidebar/dashboard.svg')",
        profile: "url('./assets/images/sidebar/profile.svg')",
        faq: "url('./assets/images/sidebar/faq.svg')",
        analytics: "url('./assets/images/sidebar/analytics.svg')",
        staking: "url('./assets/images/sidebar/staking.svg')",
        twitter: "url('./assets/images/sidebar/twitter.svg')",
        discord: "url('./assets/images/sidebar/discord.svg')",
        "mobile-open": "url('./assets/images/header/mobileopen.png')",
        "mobile-close": "url('./assets/images/header/mobileclose.png')",
        chart: "url('./assets/images/home/chart.svg')",
        stars: "url('./assets/images/home/stars.svg')",
        usdc: "url('./assets/images/usdc.png')",
        completed: "url('./assets/images/home/completed.svg')",
        "sidebar-bgcolor":
          "linear-gradient(170.52deg, #1B192B 21.73%, rgba(27, 25, 43, 0.05) 77.83%);",
        "dashboard-backcolor":
          "linear-gradient(124.03deg, rgba(0, 0, 0, 0.51) 0%, rgba(15, 16, 26, 0) 100%)",
        "dashboard-card1-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgb(243 126 5 / 11%) 0%, rgba(37, 39, 62, 0.299) 57.81%, rgba(15, 16, 26, 0.65) 98.44%)",
        "dashboard-card3-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgb(235 239 5 / 6%) 0%, rgba(37, 39, 62, 0.299) 57.81%, rgba(15, 16, 26, 0.65) 98.44%)",
        "dashboard-card4-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgb(62 130 130 / 24%) 0%, rgba(37, 39, 62, 0.23) 57.81%, rgba(15, 16, 26, 0.5) 98.44%)",
        "dashboard-card2-bgcolor":
          "linear-gradient(124.78deg, #2E2D3A 0%, rgba(27, 25, 43, 0) 100%)",
        "dashboard-card2-interior1-bgcolor":
          "linear-gradient(80deg, #017CE9,  #817b70)",
        "dashboard-card2-interior2-bgcolor":
          "radial-gradient(50.15% 58.33% at 49.85% 50.21%, rgba(24, 29, 38, 0.8) 0%, rgba(24, 29, 38, 0.16) 97.4%)",
        "dashboard-card2-interior3-bgcolor":
          "linear-gradient(109.17deg, rgba(0, 0, 0, 0.09) 0%, rgba(130, 192, 82, 0.15) 99.98%, rgba(206, 82, 82, 0.33) 99.99%, #12191D 100%)",
        "dashboard-button1-bgcolor":
          "linear-gradient(96.04deg, #7C98A9 1.2%, rgba(124, 152, 169, 0.6) 100%)",
        "dashboard-buttonwrapper-bgcolor":
          "linear-gradient(91.67deg, #272942 0%, rgba(39, 41, 66, 0.44) 100%)",
        "input-box-bgcolor":
          "linear-gradient(170.52deg, #000000 21.73%, rgba(0, 0, 0, 0.05) 77.83%)",
        "fee-panel-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgba(158, 159, 95, 0.026) 0%, rgba(37, 39, 62, 0.299) 57.81%, rgba(15, 16, 26, 0.65) 98.44%)",
        "profile-card-bgcolor":
          "linear-gradient(124.78deg, #2E2D3A 0%, rgba(27, 25, 43, 0) 100%)",
        "profile-card-inner-bgcolor":
          "linear-gradient(109.17deg, rgba(0, 0, 0, 0.09) 0%, rgba(206, 82, 82, 0.33) 99.99%, #12191D 100%)",
        "profile-card-inner2-bgcolor":
          "linear-gradient(109.17deg, rgba(0, 0, 0, 0.09) 0%, rgba(130, 192, 82, 0.15) 99.98%, rgba(206, 82, 82, 0.33) 99.99%, #12191D 100%)",
        "milestone-index1-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgba(95, 147, 159, 0.195) 0%, rgba(37, 50, 62, 0.39) 61.98%, rgba(37, 39, 62, 0.65) 98.44%)",
        "milestone-index2-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgb(28 241 241 / 11%) 0%, rgb(26 42 223 / 23%) 57.81%, rgb(87 98 209 / 50%) 98.44%)",
      }),
    },
  },
  plugins: [],
};
