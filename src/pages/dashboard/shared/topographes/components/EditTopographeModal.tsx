import React from 'react';
import { Modal } from 'react-bootstrap';
import { Edit } from 'react-feather';
import TopographeEditForm from './TopographeEditForm';
import { Topographe } from '../types';

interface EditTopographeModalProps {
  show: boolean;
  onHide: () => void;
  topographeId: number;
  onSuccess?: (topographe: Topographe) => void;
}

const EditTopographeModal: React.FC<EditTopographeModalProps> = ({ 
  show, 
  onHide, 
  topographeId,
  onSuccess 
}) => {
  const handleSuccess = (topographe: Topographe) => {
    onSuccess?.(topographe);
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
          Modifier le topographe
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TopographeEditForm 
          topographeId={topographeId}
          onSuccess={handleSuccess}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  );
};

export default EditTopographeModal;