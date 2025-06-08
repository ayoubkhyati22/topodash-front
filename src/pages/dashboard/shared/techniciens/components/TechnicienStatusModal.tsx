// src/pages/dashboard/shared/techniciens/components/TechnicienStatusModal.tsx

import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { ToggleLeft, ToggleRight } from 'react-feather';
import { Technicien } from '../types';
import { useTechnicienActions } from '../hooks/useTechnicienActions';

interface TechnicienStatusModalProps {
  show: boolean;
  onHide: () => void;
  technicien: Technicien | null;
  action: 'activate' | 'deactivate';
  onSuccess?: () => void;
}

const TechnicienStatusModal: React.FC<TechnicienStatusModalProps> = ({
  show,
  onHide,
  technicien,
  action,
  onSuccess
}) => {
  const { loading, error, activateTechnicien, deactivateTechnicien, resetState } = useTechnicienActions();

  const isActivating = action === 'activate';
  const actionText = isActivating ? 'activer' : 'désactiver';
  const Icon = isActivating ? ToggleRight : ToggleLeft;
  const variant = isActivating ? 'success' : 'warning';

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && technicien) {
      console.log('TechnicienStatusModal opened:', {
        action,
        technicienId: technicien.id,
        technicienName: `${technicien.firstName} ${technicien.lastName}`,
        currentStatus: technicien.isActive
      });
    }
  }, [show, technicien, action]);

  const handleAction = async () => {
    if (!technicien) {
      console.error('No technicien selected');
      return;
    }

    console.log(`Executing ${action} for technicien ${technicien.id}`);

    try {
      const success = isActivating 
        ? await activateTechnicien(technicien.id)
        : await deactivateTechnicien(technicien.id);

      console.log(`${action} result:`, success);

      if (success) {
        console.log('Action successful, calling onSuccess');
        onSuccess?.();
        onHide();
        resetState();
      }
    } catch (err) {
      console.error(`Error during ${action}:`, err);
    }
  };

  const handleClose = () => {
    console.log('Closing TechnicienStatusModal');
    resetState();
    onHide();
  };

  if (!technicien) {
    console.warn('TechnicienStatusModal: No technicien provided');
    return null;
  }

  console.log('Rendering TechnicienStatusModal:', {
    show,
    action,
    loading,
    error,
    technicienId: technicien.id
  });

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR': return 'Junior';
      case 'SENIOR': return 'Senior';
      case 'EXPERT': return 'Expert';
      default: return level;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className={`d-flex align-items-center text-${variant}`}>
          <Icon size="24px" className="me-2" />
          {isActivating ? 'Activer' : 'Désactiver'} le technicien
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        <div className="d-flex align-items-center mb-3">
          <div 
            className={`rounded-circle d-flex align-items-center justify-content-center me-3 bg-${variant}`}
            style={{ width: '48px', height: '48px' }}
          >
            <Icon size="24px" className="text-white" />
          </div>
          <div>
            <h5 className="mb-1">
              {isActivating ? 'Activer' : 'Désactiver'} le compte
            </h5>
            <p className="mb-0 text-muted">
              {technicien.firstName} {technicien.lastName}
            </p>
            <small className="text-muted">
              Statut actuel: {technicien.isActive ? 'Actif' : 'Inactif'}
            </small>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du technicien :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {technicien.firstName} {technicien.lastName}</li>
            <li><strong>Email :</strong> {technicien.email}</li>
            <li><strong>Niveau :</strong> {getSkillLevelLabel(technicien.skillLevel)}</li>
            {technicien.specialties && <li><strong>Spécialités :</strong> {technicien.specialties}</li>}
            <li><strong>Tâches actives :</strong> {technicien.activeTasks}</li>
            <li><strong>Affecté à :</strong> {technicien.assignedToTopographeName}</li>
          </ul>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <p className="mb-0">
            {isActivating ? (
              <>
                Le technicien pourra à nouveau accéder au système et ses tâches 
                redeviendront visibles et accessibles.
              </>
            ) : (
              <>
                Le technicien ne pourra plus accéder au système. Ses tâches resteront 
                visibles mais seront marquées comme inactives.
              </>
            )}
          </p>
        </div>

        <p className="text-muted">
          Voulez-vous {actionText} ce technicien ?
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button 
          variant={variant}
          onClick={handleAction}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isActivating ? 'Activation...' : 'Désactivation...'}
            </>
          ) : (
            <>
              <Icon size="16px" className="me-2" />
              {isActivating ? 'Activer' : 'Désactiver'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TechnicienStatusModal;