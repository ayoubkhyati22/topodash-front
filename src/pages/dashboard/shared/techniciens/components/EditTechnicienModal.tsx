// src/pages/dashboard/shared/techniciens/components/EditTechnicienModal.tsx

import React from 'react';
import { Modal } from 'react-bootstrap';
import { Edit } from 'react-feather';
import TechnicienEditForm from './TechnicienEditForm';
import { Technicien } from '../types';

interface EditTechnicienModalProps {
  show: boolean;
  onHide: () => void;
  technicienId: number;
  onSuccess?: (technicien: Technicien) => void;
}

const EditTechnicienModal: React.FC<EditTechnicienModalProps> = ({ 
  show, 
  onHide, 
  technicienId,
  onSuccess 
}) => {
  const handleSuccess = (technicien: Technicien) => {
    onSuccess?.(technicien);
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
          Modifier le technicien
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TechnicienEditForm 
          technicienId={technicienId}
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default EditTechnicienModal;