/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: (theme) => ({
        banner: "url('./assets/images/home/banner.png')",
        image1: "url('./assets/images/home/image1.png')",
        image2: "url('./assets/images/home/image2.png')",
        logo: "url('./assets/images/logo.png')",
        hidden: "url('./assets/images/header/hidden.png')",
        user: "url('./assets/images/header/user.png')",
        dashboard: "url('./assets/images/sidebar/dashboard.svg')",
        profile: "url('./assets/images/sidebar/profile.svg')",
        faq: "url('./assets/images/sidebar/faq.svg')",
        analytics: "url('./assets/images/sidebar/analytics.svg')",
        staking: "url('./assets/images/sidebar/staking.svg')",
        twitter: "url('./assets/images/sidebar/twitter.svg')",
        discord: "url('./assets/images/sidebar/discord.svg')",
        "sidebar-bgcolor":
          "linear-gradient(170.52deg, #1B192B 21.73%, rgba(27, 25, 43, 0.05) 77.83%);",
        "dashboard-backcolor":
          "linear-gradient(124.03deg, rgba(0, 0, 0, 0.51) 0%, rgba(15, 16, 26, 0) 100%)",
        "dashboard-card1-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgba(206, 156, 82, 0.026) 0%, rgba(37, 39, 62, 0.299) 57.81%, rgba(15, 16, 26, 0.65) 98.44%)",
        "dashboard-button1-bgcolor":
          "linear-gradient(96.04deg, #7C98A9 1.2%, rgba(124, 152, 169, 0.6) 100%)",
        "dashboard-buttonwrapper-bgcolor":
          "linear-gradient(91.67deg, #272942 0%, rgba(39, 41, 66, 0.44) 100%)",
        "input-box-bgcolor":
          "linear-gradient(170.52deg, #000000 21.73%, rgba(0, 0, 0, 0.05) 77.83%)",
        "fee-panel-bgcolor":
          "radial-gradient(100% 400% at 0% 0%, rgba(158, 159, 95, 0.026) 0%, rgba(37, 39, 62, 0.299) 57.81%, rgba(15, 16, 26, 0.65) 98.44%)",
      }),
    },
  },
  plugins: [],
};
