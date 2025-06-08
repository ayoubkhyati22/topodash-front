// src/pages/dashboard/shared/techniciens/components/TechnicienDeleteModal.tsx

import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { Trash2, AlertTriangle } from 'react-feather';
import { Technicien } from '../types';
import { useTechnicienActions } from '../hooks/useTechnicienActions';

interface TechnicienDeleteModalProps {
  show: boolean;
  onHide: () => void;
  technicien: Technicien | null;
  onSuccess?: () => void;
}

const TechnicienDeleteModal: React.FC<TechnicienDeleteModalProps> = ({
  show,
  onHide,
  technicien,
  onSuccess
}) => {
  const { loading, error, deleteTechnicien, resetState } = useTechnicienActions();

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && technicien) {
      console.log('TechnicienDeleteModal opened:', {
        technicienId: technicien.id,
        technicienName: `${technicien.firstName} ${technicien.lastName}`,
        totalTasks: technicien.totalTasks,
        activeTasks: technicien.activeTasks
      });
    }
  }, [show, technicien]);

  const handleDelete = async () => {
    if (!technicien) {
      console.error('No technicien selected for deletion');
      return;
    }

    console.log(`Executing delete for technicien ${technicien.id}`);

    try {
      const success = await deleteTechnicien(technicien.id);
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
    console.log('Closing TechnicienDeleteModal');
    resetState();
    onHide();
  };

  if (!technicien) {
    console.warn('TechnicienDeleteModal: No technicien provided');
    return null;
  }

  const canDelete = technicien.totalTasks === 0;

  console.log('Rendering TechnicienDeleteModal:', {
    show,
    loading,
    error,
    technicienId: technicien.id,
    canDelete
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
        <Modal.Title className="d-flex align-items-center text-danger">
          <Trash2 size="24px" className="me-2" />
          Supprimer le technicien
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
              Vous êtes sur le point de supprimer définitivement le technicien{' '}
              <strong>{technicien.firstName} {technicien.lastName}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du technicien :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {technicien.firstName} {technicien.lastName}</li>
            <li><strong>Email :</strong> {technicien.email}</li>
            <li><strong>Niveau :</strong> {getSkillLevelLabel(technicien.skillLevel)}</li>
            {technicien.specialties && <li><strong>Spécialités :</strong> {technicien.specialties}</li>}
            <li><strong>Tâches totales :</strong> {technicien.totalTasks}</li>
            <li><strong>Tâches actives :</strong> {technicien.activeTasks}</li>
            <li><strong>Tâches terminées :</strong> {technicien.completedTasks}</li>
            <li><strong>Affecté à :</strong> {technicien.assignedToTopographeName}</li>
          </ul>
        </div>

        {!canDelete ? (
          <Alert variant="danger" className="mb-3">
            <strong>Suppression impossible !</strong><br />
            Ce technicien a {technicien.totalTasks} tâche(s) assignée(s).
            Vous devez d'abord supprimer ou réassigner toutes les tâches avant de pouvoir supprimer ce technicien.
          </Alert>
        ) : (
          <Alert variant="warning" className="mb-3">
            <strong>Note :</strong> Cette action est <strong>irréversible</strong>. 
            Toutes les données associées à ce technicien seront définitivement perdues.
          </Alert>
        )}

        <p className="text-muted">
          {canDelete 
            ? "Êtes-vous sûr de vouloir continuer ?" 
            : "Supprimez ou réassignez d'abord toutes les tâches."}
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

export default TechnicienDeleteModal;