import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Campaign.css';
import AddCampaignModal from './AddCampaignModal';
import EditCampaignModal from './EditCampaignModal';
import CampaignSheetModal from './CampaignSheetModal';
import CampaignCard from './CampaignCard/CampaignCard';
import { useCampaign } from '../../contexts/CampaignContext';

function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { currentCampaign, setCurrentCampaign } = useCampaign();

  useEffect(() => {
    fetch('http://localhost:3001/campaigns')
      .then(response => response.json())
      .then(data => setCampaigns(data))
      .catch(error => console.error('Error fetching campaigns:', error));
  }, []);

  const handleAddCampaign = (campaign) => {
    const newCampaign = { ...campaign, id: uuidv4() };
    fetch('http://localhost:3001/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCampaign),
    })
      .then(response => response.json())
      .then(data => {
        setCampaigns([...campaigns, { ...newCampaign, id: data.id }]);
        setIsAddModalOpen(false);
      })
      .catch(error => console.error('Error adding campaign:', error));
  };

  const handleEditCampaign = (campaign) => {
    fetch(`http://localhost:3001/campaigns/${campaign.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      })
      .then(() => {
        setCampaigns(campaigns.map(c => c.id === campaign.id ? campaign : c));
        setIsEditModalOpen(false);
        setSelectedCampaign(null);
      })
      .catch(error => console.error('Error updating campaign:', error));
  };

  const handleDeleteCampaign = (campaignId) => {
    fetch(`http://localhost:3001/campaigns/${campaignId}`,
      {
        method: 'DELETE',
      })
      .then(() => {
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
      })
      .catch(error => console.error('Error deleting campaign:', error));
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const openSheetModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsSheetModalOpen(true);
  };

  return (
    <div className="campaign-container">
      <h1>Campaigns</h1>
      <button className="add-campaign-button" onClick={() => setIsAddModalOpen(true)}>+ Add Campaign</button>
      <div className="campaign-list">
        {campaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onEdit={openEditModal}
            onDelete={handleDeleteCampaign}
            onView={openSheetModal} // This now only opens the sheet
            onSelect={setCurrentCampaign} // This now only selects the campaign
            isSelected={currentCampaign?.id === campaign.id}
          />
        ))}
      </div>
      {isAddModalOpen && (
        <AddCampaignModal
          onSave={handleAddCampaign}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isEditModalOpen && selectedCampaign && (
        <EditCampaignModal
          campaign={selectedCampaign}
          onSave={handleEditCampaign}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCampaign(null);
          }}
        />
      )}
      {isSheetModalOpen && selectedCampaign && (
        <CampaignSheetModal
          campaign={selectedCampaign}
          onClose={() => {
            setIsSheetModalOpen(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
}

export default Campaign;