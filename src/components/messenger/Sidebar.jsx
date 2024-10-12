import React from 'react';
import PropTypes from 'prop-types';
import { fDateTime } from '../../../utils/format-time';

const Sidebar = ({
  role,
  searchTerm,
  setSearchTerm,
  filteredContacts,
  selectedContact,
  handleSelectContact,
}) => {
  return (
    <div className="sidebar">
      <div className="search-contact-input">
        {(role === 'Admin' || role === 'Developer') && (
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        )}
      </div>
      <div className="tab-content">
        {filteredContacts.map((contact) => (
          <div
            key={contact._id}
            className={`contact ${selectedContact?._id === contact._id ? 'active' : ''}`}
            onClick={() => handleSelectContact(contact)}
          >
            <img src={contact?.images || DEFAULT_AVATAR} alt={contact.name} />
            <div className="contact-info">
              <p style={{ fontSize: '12px' }}>
                {contact?.name} ({contact?.role})
              </p>
              <span>{contact?.mobile}</span>
              <span className={`status ${contact.isOnline ? 'online' : 'offline'}`}>
                {contact.isOnline ? 'Online' : `Last Seen: ${fDateTime(contact.lastSeen)}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  role: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  filteredContacts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      mobile: PropTypes.string.isRequired,
      images: PropTypes.string,
      isOnline: PropTypes.bool.isRequired,
      lastSeen: PropTypes.string,
    })
  ).isRequired,
  selectedContact: PropTypes.shape({
    _id: PropTypes.string,
  }),
  handleSelectContact: PropTypes.func.isRequired,
};

export default Sidebar;
