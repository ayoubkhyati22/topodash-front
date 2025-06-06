import React from 'react';
import { Modal } from 'react-bootstrap';
import { UserPlus } from 'react-feather';
import { TopographeForm } from './TopographeForm';

interface AddTopographeModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void;
}

const AddTopographeModal: React.FC<AddTopographeModalProps> = ({ 
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
          Ajouter un nouveau topographe
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TopographeForm 
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AddTopographeModal;