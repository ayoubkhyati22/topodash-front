// src/pages/dashboard/shared/techniciens/components/AddTechnicienModal.tsx

import React from 'react';
import { Modal } from 'react-bootstrap';
import { UserPlus } from 'react-feather';
import { TechnicienForm } from './TechnicienForm';

interface AddTechnicienModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void;
}

const AddTechnicienModal: React.FC<AddTechnicienModalProps> = ({ 
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
          Ajouter un nouveau technicien
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TechnicienForm 
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AddTechnicienModal;