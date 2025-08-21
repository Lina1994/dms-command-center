import React from 'react';
import './CampaignCard.css';

function CampaignCard({ campaign, onEdit, onDelete, onView }) {
  return (
    <div className="campaign-card" onClick={() => onView(campaign)}>
      <h2>{campaign.name}</h2>
      <div className="campaign-card-actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit(campaign); }}>Edit</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}>Delete</button>
      </div>
    </div>
  );
}

export default CampaignCard;