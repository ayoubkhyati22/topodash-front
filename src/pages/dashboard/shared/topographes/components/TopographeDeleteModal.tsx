import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { Trash2, AlertTriangle } from 'react-feather';
import { Topographe } from '../types';
import { useTopographeActions } from '../hooks/useTopographeActions';

interface TopographeDeleteModalProps {
  show: boolean;
  onHide: () => void;
  topographe: Topographe | null;
  onSuccess?: () => void;
}

const TopographeDeleteModal: React.FC<TopographeDeleteModalProps> = ({
  show,
  onHide,
  topographe,
  onSuccess
}) => {
  const { loading, error, deleteTopographe, resetState } = useTopographeActions();

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && topographe) {
      console.log('TopographeDeleteModal opened:', {
        topographeId: topographe.id,
        topographeName: `${topographe.firstName} ${topographe.lastName}`,
        totalClients: topographe.totalClients,
        totalTechniciens: topographe.totalTechniciens,
        totalProjects: topographe.totalProjects
      });
    }
  }, [show, topographe]);

  const handleDelete = async () => {
    if (!topographe) {
      console.error('No topographe selected for deletion');
      return;
    }

    console.log(`Executing delete for topographe ${topographe.id}`);

    try {
      const success = await deleteTopographe(topographe.id);
      console.log('Delete result:', success);

      if (success) {
        console.log('Delete successful, calling onSuccess');
        onSuccess?.();
        onHide();
        resetState();
      }
    } catch (err) {
      console.error('Error during delete:', err);
    }
  };

  const handleClose = () => {
    console.log('Closing TopographeDeleteModal');
    resetState();
    onHide();
  };

  if (!topographe) {
    console.warn('TopographeDeleteModal: No topographe provided');
    return null;
  }

  const canDelete = topographe.totalClients === 0 && topographe.totalTechniciens === 0;

  console.log('Rendering TopographeDeleteModal:', {
    show,
    loading,
    error,
    topographeId: topographe.id,
    canDelete
  });

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center text-danger">
          <Trash2 size="24px" className="me-2" />
          Supprimer le topographe
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        <div className="d-flex align-items-start mb-3">
          <AlertTriangle size="48px" className="text-warning me-3 flex-shrink-0" />
          <div>
            <h5>Attention !</h5>
            <p className="mb-0">
              Vous êtes sur le point de supprimer définitivement le topographe{' '}
              <strong>{topographe.firstName} {topographe.lastName}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du topographe :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {topographe.firstName} {topographe.lastName}</li>
            <li><strong>Email :</strong> {topographe.email}</li>
            <li><strong>Licence :</strong> {topographe.licenseNumber}</li>
            <li><strong>Clients :</strong> {topographe.totalClients}</li>
            <li><strong>Techniciens :</strong> {topographe.totalTechniciens}</li>
            <li><strong>Projets :</strong> {topographe.totalProjects}</li>
          </ul>
        </div>

        {!canDelete ? (
          <Alert variant="danger" className="mb-3">
            <strong>Suppression impossible !</strong><br />
            Ce topographe a {topographe.totalClients} client(s) et {topographe.totalTechniciens} technicien(s) assigné(s).
            Vous devez d'abord les réassigner ou les supprimer avant de pouvoir supprimer ce topographe.
          </Alert>
        ) : (
          <Alert variant="warning" className="mb-3">
            <strong>Note :</strong> Cette action est <strong>irréversible</strong>. 
            Toutes les données associées à ce topographe seront définitivement perdues.
          </Alert>
        )}

        <p className="text-muted">
          {canDelete 
            ? "Êtes-vous sûr de vouloir continuer ?" 
            : "Réassignez ou supprimez d'abord les clients et techniciens."}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          {canDelete ? 'Annuler' : 'Fermer'}
        </Button>
        {canDelete && (
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size="16px" className="me-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TopographeDeleteModal;