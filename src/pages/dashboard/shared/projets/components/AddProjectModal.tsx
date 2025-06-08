import React from 'react';
import { Modal } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { ProjectForm } from './ProjectForm';

interface AddProjectModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ 
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
          <Plus size="20px" className="me-2" />
          Ajouter un nouveau projet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProjectForm 
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AddProjectModal;