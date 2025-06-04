import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { MoreVertical } from 'react-feather';
import { Link } from 'react-router-dom';

interface UserActionsProps {
  userId: number;
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

const UserActions: React.FC<UserActionsProps> = ({ userId, onAction }) => {
  const handleAction = (action: string) => {
    onAction?.(action, userId);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle}>
        <MoreVertical size="15px" className="text-muted" />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end">
        <Dropdown.Item onClick={() => handleAction('view')}>
          Voir
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('edit')}>
          Modifier
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('delete')}>
          Supprimer
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserActions;

