// src/pages/dashboard/shared/clients/components/AddClientModal.tsx

import React from 'react';
import { Modal } from 'react-bootstrap';
import { UserPlus } from 'react-feather';
import { ClientForm } from './ClientForm';

interface AddClientModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ 
  show, 
  onHide, 
  onSuccess 
}) => {
  const handleSuccess = () => {
    onSuccess?.();
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <UserPlus size="20px" className="me-2" />
          Ajouter un nouveau client
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ClientForm 
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AddClientModal;