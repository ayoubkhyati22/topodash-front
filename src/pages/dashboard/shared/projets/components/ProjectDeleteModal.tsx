import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { Trash2, AlertTriangle } from 'react-feather';
import { Project } from '../types';
import { useProjectActions } from '../hooks/useProjectActions';

interface ProjectDeleteModalProps {
  show: boolean;
  onHide: () => void;
  project: Project | null;
  onSuccess?: () => void;
}

const ProjectDeleteModal: React.FC<ProjectDeleteModalProps> = ({
  show,
  onHide,
  project,
  onSuccess
}) => {
  const { loading, error, deleteProject, resetState } = useProjectActions();

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && project) {
      console.log('ProjectDeleteModal opened:', {
        projectId: project.id,
        projectName: project.name,
        totalTasks: project.totalTasks,
        status: project.status
      });
    }
  }, [show, project]);

  const handleDelete = async () => {
    if (!project) {
      console.error('No project selected for deletion');
      return;
    }

    console.log(`Executing delete for project ${project.id}`);

    try {
      const success = await deleteProject(project.id);
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
    console.log('Closing ProjectDeleteModal');
    resetState();
    onHide();
  };

  if (!project) {
    console.warn('ProjectDeleteModal: No project provided');
    return null;
  }

  const canDelete = project.totalTasks === 0 || project.status === 'CANCELLED';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'Planification';
      case 'IN_PROGRESS': return 'En cours';
      case 'ON_HOLD': return 'En attente';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  console.log('Rendering ProjectDeleteModal:', {
    show,
    loading,
    error,
    projectId: project.id,
    canDelete
  });

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center text-danger">
          <Trash2 size="24px" className="me-2" />
          Supprimer le projet
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
              Vous êtes sur le point de supprimer définitivement le projet{' '}
              <strong>{project.name}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du projet :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {project.name}</li>
            <li><strong>Description :</strong> {project.description}</li>
            <li><strong>Statut :</strong> {getStatusLabel(project.status)}</li>
            <li><strong>Client :</strong> {project.clientName}</li>
            <li><strong>Topographe :</strong> {project.topographeName}</li>
            <li><strong>Date de début :</strong> {new Date(project.startDate).toLocaleDateString('fr-FR')}</li>
            <li><strong>Date de fin :</strong> {new Date(project.endDate).toLocaleDateString('fr-FR')}</li>
            <li><strong>Tâches totales :</strong> {project.totalTasks}</li>
            <li><strong>Progression :</strong> {Math.round(project.progressPercentage)}%</li>
          </ul>
        </div>

        {!canDelete ? (
          <Alert variant="danger" className="mb-3">
            <strong>Suppression impossible !</strong><br />
            Ce projet a {project.totalTasks} tâche(s) associée(s) et n'est pas annulé.
            Vous devez d'abord supprimer toutes les tâches ou annuler le projet avant de pouvoir le supprimer.
          </Alert>
        ) : (
          <Alert variant="warning" className="mb-3">
            <strong>Note :</strong> Cette action est <strong>irréversible</strong>. 
            Toutes les données associées à ce projet seront définitivement perdues, y compris :
            <ul className="mt-2 mb-0">
              <li>Toutes les tâches du projet</li>
              <li>Les fichiers et documents associés</li>
              <li>L'historique des modifications</li>
              <li>Les rapports de progression</li>
            </ul>
          </Alert>
        )}

        <p className="text-muted">
          {canDelete 
            ? "Êtes-vous sûr de vouloir continuer ?" 
            : "Supprimez d'abord toutes les tâches ou annulez le projet."}
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

export default ProjectDeleteModal;