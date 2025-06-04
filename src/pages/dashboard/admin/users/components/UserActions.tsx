import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';
import { Eye, Mail, MessageSquare, MoreVertical, Phone, Trash } from 'react-feather';
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
          <Eye size="15px" className="me-2" /> Voir
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('edit')}>
          <Pencil size="15px" className="me-2" /> Modifier
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('delete')}>
          <Trash size="15px" className="me-2 text-danger" /> <span className="text-danger">Supprimer</span>
        </Dropdown.Item>
        <hr />
        <Dropdown.Item onClick={() => handleAction('call')}>
          <Phone size="15px" className="me-2" /> Appeller
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('sendMail')}>
          <Mail size="15px" className="me-2" /> Envoyer un mail
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('sendSms')}>
          <MessageSquare size="15px" className="me-2" /> Envoyer un sms
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserActions;

