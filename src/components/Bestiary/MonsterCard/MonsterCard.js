import React from 'react';
import './MonsterCard.css';

// Accept monsterImage prop
function MonsterCard({ monster, onDelete, monsterImage }) {
  // Use monsterImage for background style
  const cardStyle = {
    backgroundImage: monsterImage ? `url(${monsterImage})` : 'none',
  };

  return (
    // Apply cardStyle to the main div
    <div className="monster-card" style={cardStyle}>
      {/* Existing image tag will become the thumbnail */}
      {monster.image && (
        <img src={monster.image} alt={monster.name} className="monster-thumbnail" />
      )}
      <div className="monster-info">
        <h3>{monster.name}</h3>
        <p><strong>VD:</strong> {monster.vd}</p>
        <p><strong>Tipo:</strong> {monster.type}</p>
        <p><strong>Alineamiento:</strong> {monster.alignment}</p>
      </div>
      
    </div>
  );
}

export default MonsterCard;