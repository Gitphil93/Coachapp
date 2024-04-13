import React, { createContext, useState } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setTimeout(() => {
      setIsMenuOpen((prevState) => !prevState);
    }, 10); //väntar 10ms här så att jag ska kunna använda isMenuOpen i andra komponenter som kontroll
            //för att inte kunna klicka på de underliggande elementen.
            //på så vis hinner den inte toggla om isMenuOpen
    
    
  };

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuContext;
