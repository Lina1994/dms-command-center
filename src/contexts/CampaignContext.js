import React, { createContext, useState, useContext } from 'react';

const CampaignContext = createContext();

export const useCampaign = () => useContext(CampaignContext);

export const CampaignProvider = ({ children }) => {
  const [currentCampaign, setCurrentCampaign] = useState(null);

  const value = {
    currentCampaign,
    setCurrentCampaign,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};
