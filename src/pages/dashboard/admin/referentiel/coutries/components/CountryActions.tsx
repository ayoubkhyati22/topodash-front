import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { MoreVertical, Edit, Trash, Eye } from 'react-feather';
import { Link } from 'react-router-dom';

interface CountryActionsProps {
  countryId: number;
  countryName: string;
  onAction?: (action: string, countryId: number) => void;
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

const CountryActions: React.FC<CountryActionsProps> = ({ countryId, countryName, onAction }) => {
  const handleAction = (action: string) => {
    onAction?.(action, countryId);
  };

  // Get initials from country name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle}>
        <MoreVertical size="15px" className="text-muted" />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className="dropdown-menu-lg">
        {/* Country Header */}
        <div className="px-3 py-2 border-bottom">
          <div className="d-flex align-items-center">
            <div 
              className="avatar-sm rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ 
                backgroundColor: "#54A0FF",
                width: '32px',
                height: '32px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {getInitials(countryName)}
            </div>
            <div>
              <h6 className="mb-0 text-dark">{countryName}</h6>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <Dropdown.Item onClick={() => handleAction('view')}>
          <Eye size="15px" className="me-2" /> Voir
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('edit')}>
          <Edit size="15px" className="me-2" /> Modifier
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('delete')}>
          <Trash size="15px" className="me-2 text-danger" /> 
          <span className="text-danger">Supprimer</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CountryActions;
