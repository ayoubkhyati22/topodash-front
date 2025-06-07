// src/pages/dashboard/shared/clients/components/EditClientModal.tsx

import React from 'react';
import { Modal } from 'react-bootstrap';
import { Edit } from 'react-feather';
import ClientEditForm from './ClientEditForm';
import { Client } from '../types';

interface EditClientModalProps {
  show: boolean;
  onHide: () => void;
  clientId: number;
  onSuccess?: (client: Client) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ 
  show, 
  onHide, 
  clientId,
  onSuccess 
}) => {
  const handleSuccess = (client: Client) => {
    onSuccess?.(client);
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
          <Edit size="20px" className="me-2" />
          Modifier le client
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ClientEditForm 
          clientId={clientId}
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default EditClientModal;