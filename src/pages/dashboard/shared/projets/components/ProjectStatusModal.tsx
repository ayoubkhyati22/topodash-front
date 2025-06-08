import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { Play, Square, Pause, X } from 'react-feather';
import { Project } from '../types';
import { useProjectActions } from '../hooks/useProjectActions';

interface ProjectStatusModalProps {
  show: boolean;
  onHide: () => void;
  project: Project | null;
  action: 'start' | 'complete' | 'hold' | 'cancel';
  onSuccess?: () => void;
}

const ProjectStatusModal: React.FC<ProjectStatusModalProps> = ({
  show,
  onHide,
  project,
  action,
  onSuccess
}) => {
  const { loading, error, startProject, completeProject, putOnHold, cancelProject, resetState } = useProjectActions();

  // Configuration des actions
  const actionConfig = {
    start: {
      title: 'Démarrer le projet',
      icon: Play,
      variant: 'success',
      verb: 'démarrer',
      description: 'Le projet passera en statut "En cours" et pourra commencer à être exécuté.'
    },
    complete: {
      title: 'Terminer le projet',
      icon: Square,
      variant: 'success',
      verb: 'terminer',
      description: 'Le projet passera en statut "Terminé" et ne pourra plus être modifié.'
    },
    hold: {
      title: 'Mettre en attente',
      icon: Pause,
      variant: 'warning',
      verb: 'mettre en attente',
      description: 'Le projet passera en statut "En attente" et peut être repris ultérieurement.'
    },
    cancel: {
      title: 'Annuler le projet',
      icon: X,
      variant: 'danger',
      verb: 'annuler',
      description: 'Le projet passera en statut "Annulé" et ne pourra plus être exécuté.'
    }
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && project) {
      console.log('ProjectStatusModal opened:', {
        action,
        projectId: project.id,
        projectName: project.name,
        currentStatus: project.status
      });
    }
  }, [show, project, action]);

  const handleAction = async () => {
    if (!project) {
      console.error('No project selected');
      return;
    }

    console.log(`Executing ${action} for project ${project.id}`);

    try {
      let success = false;
      
      switch (action) {
        case 'start':
          success = await startProject(project.id);
          break;
        case 'complete':
          success = await completeProject(project.id);
          break;
        case 'hold':
          success = await putOnHold(project.id);
          break;
        case 'cancel':
          success = await cancelProject(project.id);
          break;
      }

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
    console.log('Closing ProjectStatusModal');
    resetState();
    onHide();
  };

  if (!project) {
    console.warn('ProjectStatusModal: No project provided');
    return null;
  }

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

  const getNewStatusLabel = () => {
    switch (action) {
      case 'start': return 'En cours';
      case 'complete': return 'Terminé';
      case 'hold': return 'En attente';
      case 'cancel': return 'Annulé';
      default: return '';
    }
  };

  console.log('Rendering ProjectStatusModal:', {
    show,
    action,
    loading,
    error,
    projectId: project.id
  });

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className={`d-flex align-items-center text-${config.variant}`}>
          <Icon size="24px" className="me-2" />
          {config.title}
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
            className={`rounded-circle d-flex align-items-center justify-content-center me-3 bg-${config.variant}`}
            style={{ width: '48px', height: '48px' }}
          >
            <Icon size="24px" className="text-white" />
          </div>
          <div>
            <h5 className="mb-1">
              {config.title}
            </h5>
            <p className="mb-0 text-muted">
              {project.name}
            </p>
            <small className="text-muted">
              Statut actuel: {getStatusLabel(project.status)} → {getNewStatusLabel()}
            </small>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du projet :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {project.name}</li>
            <li><strong>Client :</strong> {project.clientName}</li>
            <li><strong>Topographe :</strong> {project.topographeName}</li>
            <li><strong>Progression :</strong> {Math.round(project.progressPercentage)}% ({project.completedTasks}/{project.totalTasks} tâches)</li>
            <li><strong>Date de début :</strong> {new Date(project.startDate).toLocaleDateString('fr-FR')}</li>
            <li><strong>Date de fin :</strong> {new Date(project.endDate).toLocaleDateString('fr-FR')}</li>
          </ul>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <p className="mb-0">
            <strong>Effet de cette action :</strong><br />
            {config.description}
          </p>
        </div>

        {/* Avertissements spécifiques selon l'action */}
        {action === 'complete' && project.progressPercentage < 100 && (
          <Alert variant="warning" className="mb-3">
            <strong>Attention :</strong> Le projet n'est pas entièrement terminé ({Math.round(project.progressPercentage)}% de progression).
            Êtes-vous sûr de vouloir le marquer comme terminé ?
          </Alert>
        )}

        {action === 'cancel' && project.progressPercentage > 0 && (
          <Alert variant="danger" className="mb-3">
            <strong>Attention :</strong> Ce projet a déjà du travail effectué ({Math.round(project.progressPercentage)}% de progression).
            L'annulation arrêtera définitivement tous les travaux.
          </Alert>
        )}

        <p className="text-muted">
          Voulez-vous {config.verb} ce projet ?
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
          variant={config.variant}
          onClick={handleAction}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {action === 'start' && 'Démarrage...'}
              {action === 'complete' && 'Finalisation...'}
              {action === 'hold' && 'Mise en attente...'}
              {action === 'cancel' && 'Annulation...'}
            </>
          ) : (
            <>
              <Icon size="16px" className="me-2" />
              {action === 'start' && 'Démarrer'}
              {action === 'complete' && 'Terminer'}
              {action === 'hold' && 'Mettre en attente'}
              {action === 'cancel' && 'Annuler'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectStatusModal;