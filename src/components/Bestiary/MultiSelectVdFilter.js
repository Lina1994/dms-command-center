import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectVdFilter.css';

function MultiSelectVdFilter({ options, selectedValues, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (value) => {
    if (value === 'all') { // Handle "Todos" option
      if (selectedValues.length === options.length) {
        onChange([]); // Deselect all
      } else {
        onChange([...options]); // Select all
      }
    } else { // Handle individual options
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onChange(newSelectedValues);
    }
  };

  const isAllSelected = selectedValues.length === options.length;

  const getDisplayValue = () => {
    if (selectedValues.length === 0) {
      return 'Todos';
    } else if (selectedValues.length === options.length) {
      return 'Todos seleccionados';
    } else {
      return selectedValues.join(', ');
    }
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <button type="button" className="dropdown-toggle" onClick={handleToggle}>
        {getDisplayValue()}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <label key="all" className="dropdown-item">
            <input
              type="checkbox"
              value="all"
              checked={isAllSelected}
              onChange={() => handleCheckboxChange('all')}
            />
            Todos
          </label>
          {options.map((option) => (
            <label key={option} className="dropdown-item">
              <input
                type="checkbox"
                value={option}
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelectVdFilter;