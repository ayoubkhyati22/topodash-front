// components/TechnicienActions.tsx
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';
import { Eye, Mail, MessageCircle, Phone, Trash, User, ToggleLeft, ToggleRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';

interface TechnicienActionsProps {
  technicienId: number;
  technicienName: string;
  technicienEmail: string;
  isActive: boolean;
  onAction?: (action: string, technicienId: number) => void;
}

const TechnicienActions: React.FC<TechnicienActionsProps> = ({ 
  technicienId, 
  technicienName, 
  technicienEmail, 
  isActive, 
  onAction 
}) => {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === 'view') {
      // Naviguer vers la page de détails
      navigate(`/techniciens/${technicienId}`);
      return;
    }
    onAction?.(action, technicienId);
  };

  // Generate a consistent color based on technicien name
  const getAvatarColor = (name: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from technicien name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const avatarColor = getAvatarColor(technicienName);
  const initials = getInitials(technicienName);

  return (
    <Dropdown>
      <Dropdown.Toggle 
        variant="light" 
        size="sm"
        id={`dropdown-${technicienId}`}
      >
        Actions
      </Dropdown.Toggle>
      
      <Dropdown.Menu align="end" className="dropdown-menu-lg">
        {/* Technicien Header */}
        <div className="px-3 py-2 border-bottom">
          <div className="d-flex align-items-center">
            <div 
              className="avatar-sm rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ 
                backgroundColor: avatarColor,
                width: '32px',
                height: '32px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {initials || <User size="16px" />}
            </div>
            <div>
              <h6 className="mb-0 text-dark">{technicienName}</h6>
              <small className="text-muted">Email: {technicienEmail}</small>
              <div>
                {isActive ? (
                  <span className="badge bg-success">Actif</span>
                ) : (
                  <span className="badge bg-danger">Inactif</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <Dropdown.Item onClick={() => handleAction('view')}>
          <Eye size="15px" className="me-2" /> Voir détails
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('edit')}>
          <Pencil size="15px" className="me-2" /> Modifier
        </Dropdown.Item>
        
        {/* Status Actions */}
        <Dropdown.Divider />
        {isActive ? (
          <Dropdown.Item onClick={() => handleAction('deactivate')}>
            <ToggleLeft size="15px" className="me-2 text-warning" />
            <span className="text-warning">Désactiver</span>
          </Dropdown.Item>
        ) : (
          <Dropdown.Item onClick={() => handleAction('activate')}>
            <ToggleRight size="15px" className="me-2 text-success" />
            <span className="text-success">Activer</span>
          </Dropdown.Item>
        )}
        
        <Dropdown.Item onClick={() => handleAction('delete')}>
          <Trash size="15px" className="me-2 text-danger" /> 
          <span className="text-danger">Supprimer</span>
        </Dropdown.Item>
        
        {/* Communication Actions */}
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleAction('call')}>
          <Phone size="15px" className="me-2" /> Appeler
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('sendMail')}>
          <Mail size="15px" className="me-2" /> Envoyer un mail
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('sendSms')}>
          <MessageCircle size="15px" className="me-2 text-success" /> 
          <span className="text-success">Message WhatsApp</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TechnicienActions;