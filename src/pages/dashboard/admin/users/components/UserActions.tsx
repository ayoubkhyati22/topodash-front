import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';
import { Eye, Mail, MessageCircle, MoreVertical, Phone, Trash, User } from 'react-feather';
import { Link } from 'react-router-dom';

interface UserActionsProps {
  userId: number;
  username: string;
  userEmail: string;
  onAction?: (action: string, userId: number) => void;
}

const CustomToggle = React.forwardRef<HTMLAnchorElement, any>(
  ({ children, onClick }, ref) => (
    <Link
      to=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="text-muted text-primary-hover"
    >
      {children}
    </Link>
  )
);

CustomToggle.displayName = "CustomToggle";

const UserActions: React.FC<UserActionsProps> = ({ userId, username, userEmail, onAction }) => {
  const handleAction = (action: string) => {
    onAction?.(action, userId);
  };

  // Generate a consistent color based on username
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

  // Get initials from username
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const avatarColor = getAvatarColor(username);
  const initials = getInitials(username);

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" className="btn-sm">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="dropdown-menu-lg">
        {/* User Header */}
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
              <h6 className="mb-0 text-dark">{username}</h6>
              <small className="text-muted">Email: {userEmail}</small>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <Dropdown.Item onClick={() => handleAction('view')}>
          <Eye size="15px" className="me-2" /> Voir
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('edit')}>
          <Pencil size="15px" className="me-2" /> Modifier
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('delete')}>
          <Trash size="15px" className="me-2 text-danger" /> 
          <span className="text-danger">Supprimer</span>
        </Dropdown.Item>
        
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

export default UserActions;