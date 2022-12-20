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
        "sidebar-bgcolor":
          "linear-gradient(170.52deg, #1B192B 21.73%, rgba(27, 25, 43, 0.05) 77.83%);",
        "dashboard-backcolor":
          "linear-gradient(124.03deg, rgba(0, 0, 0, 0.51) 0%, rgba(15, 16, 26, 0) 100%)",
        "home-card-bgcolor":
          "linear-gradient(256.46deg, rgba(5, 5, 4, 0.3) 0.49%, rgba(152, 147, 130, 0) 84.46%), #0A0707",
        "home-card2":
          "linear-gradient(269.82deg, #020202 0.14%, rgba(0, 0, 0, 0) 99.84%), linear-gradient(135deg, #FFFFFF 0%, #A5A5A5 100%)",
        "about-card1":
          "linear-gradient(196.72deg, rgba(5, 5, 4, 0.3) -8.41%, rgba(152, 147, 130, 0) 88.45%), #0A0707;",
      }),
    },
  },
  plugins: [],
};
