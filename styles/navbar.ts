export const navbarStyles = {
  layout: {
    nav: "bg-white text-gray-800 shadow-sm border-b border-gray-200",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    inner: "flex items-center justify-between h-16",
  },
  brand: {
    link: "flex items-center gap-3",
    logo: "rounded-lg",
    name: "font-bold text-lg hidden sm:block text-[#101661]",
  },
  desktop: {
    navLinks: "hidden md:flex items-center gap-6 text-sm font-medium",
    link: "hover:text-[#101661] transition-colors",
    divider: "border-l border-gray-300 h-5",
    primaryLink: "bg-[#101661] hover:bg-blue-900 text-white px-4 py-2 rounded-md transition-colors",
    userMenu: "relative",
    userButton: "flex items-center gap-2 hover:text-[#101661] transition-colors",
    avatar: "w-8 h-8 bg-[#101661] rounded-full flex items-center justify-center text-xs font-bold text-white",
    dropdown: "absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg z-50 border border-gray-100",
    dropdownLink: "block px-4 py-2 hover:bg-gray-100",
    dropdownDivider: "border-t border-gray-100",
    signOutButton: "w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600",
  },
  mobile: {
    menuButton: "md:hidden p-2",
    menuIconLine: "w-5 h-0.5 bg-gray-600 mb-1",
    menuIconLineLast: "w-5 h-0.5 bg-gray-600",
    menu: "md:hidden pb-4 border-t border-gray-100 mt-2 pt-2 space-y-2",
    link: "block px-2 py-1 hover:text-[#101661]",
    primaryLink: "block px-2 py-1 text-[#101661] font-semibold",
    signOutButton: "block px-2 py-1 text-red-500 hover:text-red-700",
  },
};
