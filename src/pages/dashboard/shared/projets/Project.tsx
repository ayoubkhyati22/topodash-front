// Project.tsx - Version complète avec gestion des actions et rôles
import React, { useState } from 'react';
import { Col, Row, Container, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { useProjects } from './hooks/useProjects';
import { ProjectTable } from './components/ProjectTable';
import ProjectSearch from './components/ProjectSearch';
import AddProjectModal from './components/AddProjectModal';
import EditProjectModal from './components/EditProjectModal';
import ProjectDeleteModal from './components/ProjectDeleteModal';
import ProjectStatusModal from './components/ProjectStatusModal';
import { Project as ProjectType } from './types';

const Project: React.FC = () => {
  const { 
    projects, 
    pagination, 
    loading, 
    error, 
    currentUserRole,
    fetchProjects, 
    handlePageChange, 
    handleSearch,
    clearSearch 
  } = useProjects();

  // États des modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // États pour gérer les sélections
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [statusAction, setStatusAction] = useState<'start' | 'complete' | 'hold' | 'cancel'>('start');
  
  // États pour les notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger' | 'warning'>('success');

  // Fonction pour afficher une notification
  const showNotification = (message: string, variant: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Gestionnaire principal des actions utilisateur
  const handleProjectAction = (action: string, projectId: number) => {
    console.log(`Action triggered: ${action} for project ID: ${projectId}`);
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      showNotification('Projet non trouvé', 'danger');
      console.error('Project not found for ID:', projectId);
      return;
    }

    console.log('Selected project:', project);
    setSelectedProject(project);

    switch (action) {
      case 'view':
        console.log('Viewing project:', projectId);
        // Naviguer vers les détails du projet
        window.location.href = `/projects/${projectId}`;
        break;
        
      case 'edit':
        console.log('Editing project:', projectId);
        setShowEditModal(true);
        break;
        
      case 'delete':
        console.log('Deleting project:', projectId);
        setShowDeleteModal(true);
        break;
        
      case 'start':
        console.log('Starting project:', projectId);
        if (project.status !== 'PLANNING') {
          showNotification('Ce projet ne peut pas être démarré dans son état actuel', 'warning');
          return;
        }
        setStatusAction('start');
        setShowStatusModal(true);
        break;
        
      case 'complete':
        console.log('Completing project:', projectId);
        if (project.status !== 'IN_PROGRESS') {
          showNotification('Seuls les projets en cours peuvent être terminés', 'warning');
          return;
        }
        setStatusAction('complete');
        setShowStatusModal(true);
        break;
        
      case 'hold':
        console.log('Putting project on hold:', projectId);
        if (!['PLANNING', 'IN_PROGRESS'].includes(project.status)) {
          showNotification('Ce projet ne peut pas être mis en attente', 'warning');
          return;
        }
        setStatusAction('hold');
        setShowStatusModal(true);
        break;
        
      case 'cancel':
        console.log('Cancelling project:', projectId);
        if (project.status === 'COMPLETED') {
          showNotification('Un projet terminé ne peut pas être annulé', 'warning');
          return;
        }
        setStatusAction('cancel');
        setShowStatusModal(true);
        break;
        
      default:
        console.warn(`Unhandled action: ${action} for project ${projectId}`);
        showNotification(`Action non reconnue: ${action}`, 'warning');
    }
  };

  // Gestionnaire de retry pour les erreurs
  const handleRetry = () => {
    fetchProjects(pagination.pageNumber, pagination.pageSize);
    showNotification('Liste des projets rechargée', 'success');
  };

  // Gestionnaire de succès après ajout
  const handleAddSuccess = () => {
    fetchProjects(0, pagination.pageSize);
    showNotification('Projet créé avec succès !', 'success');
  };

  // Gestionnaire de succès après modification
  const handleEditSuccess = () => {
    fetchProjects(pagination.pageNumber, pagination.pageSize);
    showNotification('Projet modifié avec succès !', 'success');
  };

  // Gestionnaire de succès après suppression
  const handleDeleteSuccess = () => {
    const totalAfterDelete = pagination.totalElements - 1;
    const maxPage = Math.max(0, Math.ceil(totalAfterDelete / pagination.pageSize) - 1);
    const targetPage = Math.min(pagination.pageNumber, maxPage);
    
    fetchProjects(targetPage, pagination.pageSize);
    showNotification('Projet supprimé avec succès !', 'success');
  };

  // Gestionnaire de succès après changement de statut
  const handleStatusSuccess = () => {
    console.log('Status change successful, refreshing list');
    fetchProjects(pagination.pageNumber, pagination.pageSize);
    const actionText = {
      start: 'démarré',
      complete: 'terminé',
      hold: 'mis en attente',
      cancel: 'annulé'
    }[statusAction];
    showNotification(`Projet ${actionText} avec succès !`, 'success');
  };

  // Gestionnaire de fermeture des modals
  const handleModalClose = () => {
    console.log('Closing modals');
    setSelectedProject(null);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowStatusModal(false);
  };

  // Gestionnaire des erreurs de recherche
  const handleSearchError = (errorMessage: string) => {
    showNotification(`Erreur de recherche: ${errorMessage}`, 'danger');
  };

  // Déterminer le titre selon le rôle
  const getPageTitle = () => {
    if (currentUserRole === 'ADMIN') {
      return 'Gestion des projets';
    }
    return 'Mes projets';
  };

  const getPageSubtitle = () => {
    if (currentUserRole === 'ADMIN') {
      return `Gestion de tous les projets (${pagination.totalElements} projet${pagination.totalElements !== 1 ? 's' : ''})`;
    }
    return `Gestion de vos projets (${pagination.totalElements} projet${pagination.totalElements !== 1 ? 's' : ''})`;
  };

  return (
    <Container fluid className="p-6">
      {/* En-tête de la page */}
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">{getPageTitle()}</h1>
              <p className="mb-0">
                {getPageSubtitle()}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="primary"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                <Plus size="16px" className="me-2" />
                Nouveau projet
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Section de recherche */}
      <Row>
        <Col>
          <ProjectSearch 
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={loading}
            onError={handleSearchError}
          />
        </Col>
      </Row>
      
      {/* Table des projets */}
      <Row>
        <Col>
          <ProjectTable
            projects={projects}
            pagination={pagination}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onProjectAction={handleProjectAction}
          />
        </Col>
      </Row>

      {/* Modals */}
      
      {/* Modal d'ajout */}
      <AddProjectModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal d'édition */}
      {selectedProject && showEditModal && (
        <EditProjectModal
          show={showEditModal}
          onHide={handleModalClose}
          projectId={selectedProject.id}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de suppression */}
      {selectedProject && showDeleteModal && (
        <ProjectDeleteModal
          show={showDeleteModal}
          onHide={handleModalClose}
          project={selectedProject}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Modal de changement de statut */}
      {selectedProject && showStatusModal && (
        <ProjectStatusModal
          show={showStatusModal}
          onHide={handleModalClose}
          project={selectedProject}
          action={statusAction}
          onSuccess={handleStatusSuccess}
        />
      )}

      {/* Notifications Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === 'success' && '✅ Succès'}
              {toastVariant === 'danger' && '❌ Erreur'}
              {toastVariant === 'warning' && '⚠️ Attention'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Project;