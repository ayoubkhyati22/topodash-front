import React from 'react';
import { Modal } from 'react-bootstrap';
import { Edit } from 'react-feather';
import ProjectEditForm from './ProjectEditForm';
import { Project } from '../types';

interface EditProjectModalProps {
  show: boolean;
  onHide: () => void;
  projectId: number;
  onSuccess?: (project: Project) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  show, 
  onHide, 
  projectId,
  onSuccess 
}) => {
  const handleSuccess = (project: Project) => {
    onSuccess?.(project);
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
          Modifier le projet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProjectEditForm 
          projectId={projectId}
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default EditProjectModal;