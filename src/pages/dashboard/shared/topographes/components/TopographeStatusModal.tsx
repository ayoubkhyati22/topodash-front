import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { ToggleLeft, ToggleRight } from 'react-feather';
import { Topographe } from '../types';
import { useTopographeActions } from '../hooks/useTopographeActions';

interface TopographeStatusModalProps {
  show: boolean;
  onHide: () => void;
  topographe: Topographe | null;
  action: 'activate' | 'deactivate';
  onSuccess?: () => void;
}

const TopographeStatusModal: React.FC<TopographeStatusModalProps> = ({
  show,
  onHide,
  topographe,
  action,
  onSuccess
}) => {
  const { loading, error, activateTopographe, deactivateTopographe, resetState } = useTopographeActions();

  const isActivating = action === 'activate';
  const actionText = isActivating ? 'activer' : 'désactiver';
  const Icon = isActivating ? ToggleRight : ToggleLeft;
  const variant = isActivating ? 'success' : 'warning';

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && topographe) {
      console.log('TopographeStatusModal opened:', {
        action,
        topographeId: topographe.id,
        topographeName: `${topographe.firstName} ${topographe.lastName}`,
        currentStatus: topographe.isActive
      });
    }
  }, [show, topographe, action]);

  const handleAction = async () => {
    if (!topographe) {
      console.error('No topographe selected');
      return;
    }

    console.log(`Executing ${action} for topographe ${topographe.id}`);

    try {
      const success = isActivating 
        ? await activateTopographe(topographe.id)
        : await deactivateTopographe(topographe.id);

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
    console.log('Closing TopographeStatusModal');
    resetState();
    onHide();
  };

  if (!topographe) {
    console.warn('TopographeStatusModal: No topographe provided');
    return null;
  }

  console.log('Rendering TopographeStatusModal:', {
    show,
    action,
    loading,
    error,
    topographeId: topographe.id
  });

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className={`d-flex align-items-center text-${variant}`}>
          <Icon size="24px" className="me-2" />
          {isActivating ? 'Activer' : 'Désactiver'} le topographe
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
              {topographe.firstName} {topographe.lastName}
            </p>
            <small className="text-muted">
              Statut actuel: {topographe.isActive ? 'Actif' : 'Inactif'}
            </small>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <p className="mb-0">
            {isActivating ? (
              <>
                Le topographe pourra à nouveau se connecter et gérer ses clients, 
                techniciens et projets.
              </>
            ) : (
              <>
                Le topographe ne pourra plus se connecter au système. Ses clients, 
                techniciens et projets resteront visibles mais inactifs.
              </>
            )}
          </p>
        </div>

        <p className="text-muted">
          Voulez-vous {actionText} ce topographe ?
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

export default TopographeStatusModal;