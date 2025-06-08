// Technicien.tsx - Version complète avec gestion des actions et rôles
import React, { useState } from 'react';
import { Col, Row, Container, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { useTechniciens } from './hooks/useTechniciens';
import { TechnicienTable } from './components/TechnicienTable';
import TechnicienSearch from './components/TechnicienSearch';
import AddTechnicienModal from './components/AddTechnicienModal';
import EditTechnicienModal from './components/EditTechnicienModal';
import TechnicienDeleteModal from './components/TechnicienDeleteModal';
import TechnicienStatusModal from './components/TechnicienStatusModal';
import { Technicien as TechnicienType } from './types';

const Technicien: React.FC = () => {
  const { 
    techniciens, 
    pagination, 
    loading, 
    error, 
    currentUserRole,
    fetchTechniciens, 
    handlePageChange, 
    handleSearch,
    clearSearch 
  } = useTechniciens();

  // États des modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // États pour gérer les sélections
  const [selectedTechnicien, setSelectedTechnicien] = useState<TechnicienType | null>(null);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');
  
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
  const handleTechnicienAction = (action: string, technicienId: number) => {
    console.log(`Action triggered: ${action} for technicien ID: ${technicienId}`);
    
    const technicien = techniciens.find(t => t.id === technicienId);
    if (!technicien) {
      showNotification('Technicien non trouvé', 'danger');
      console.error('Technicien not found for ID:', technicienId);
      return;
    }

    console.log('Selected technicien:', technicien);
    setSelectedTechnicien(technicien);

    switch (action) {
      case 'view':
        console.log('Viewing technicien:', technicienId);
        showNotification('Fonctionnalité de visualisation en cours de développement', 'warning');
        break;
        
      case 'edit':
        console.log('Editing technicien:', technicienId);
        setShowEditModal(true);
        break;
        
      case 'delete':
        console.log('Deleting technicien:', technicienId);
        setShowDeleteModal(true);
        break;
        
      case 'activate':
        console.log('Activating technicien:', technicienId, 'Current status:', technicien.isActive);
        if (technicien.isActive) {
          showNotification('Ce technicien est déjà actif', 'warning');
          return;
        }
        setStatusAction('activate');
        setShowStatusModal(true);
        break;
        
      case 'deactivate':
        console.log('Deactivating technicien:', technicienId, 'Current status:', technicien.isActive);
        if (!technicien.isActive) {
          showNotification('Ce technicien est déjà inactif', 'warning');
          return;
        }
        setStatusAction('deactivate');
        setShowStatusModal(true);
        break;
        
      case 'call':
        try {
          const cleanPhoneNumber = technicien.phoneNumber.replace(/[^0-9+]/g, '');
          console.log('Calling:', cleanPhoneNumber);
          window.location.href = `tel:${cleanPhoneNumber}`;
          showNotification(`Appel vers ${technicien.firstName} ${technicien.lastName}`, 'success');
        } catch (error) {
          console.error('Error making call:', error);
          showNotification('Impossible d\'initier l\'appel', 'danger');
        }
        break;
        
      case 'sendMail':
        try {
          const subject = encodeURIComponent(`Contact - ${technicien.firstName} ${technicien.lastName}`);
          const body = encodeURIComponent(`Bonjour ${technicien.firstName},\n\n`);
          const mailtoUrl = `mailto:${technicien.email}?subject=${subject}&body=${body}`;
          console.log('Opening email:', mailtoUrl);
          window.location.href = mailtoUrl;
          showNotification(`Email ouvert pour ${technicien.firstName} ${technicien.lastName}`, 'success');
        } catch (error) {
          console.error('Error opening email:', error);
          showNotification('Impossible d\'ouvrir l\'application email', 'danger');
        }
        break;
        
      case 'sendSms':
        try {
          const cleanPhoneNumber = technicien.phoneNumber.replace(/[^0-9]/g, '');
          const message = encodeURIComponent(`Bonjour ${technicien.firstName}, `);
          const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${message}`;
          console.log('Opening WhatsApp:', whatsappUrl);
          window.open(whatsappUrl, '_blank');
          showNotification(`WhatsApp ouvert pour ${technicien.firstName} ${technicien.lastName}`, 'success');
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          showNotification('Impossible d\'ouvrir WhatsApp', 'danger');
        }
        break;
        
      default:
        console.warn(`Unhandled action: ${action} for technicien ${technicienId}`);
        showNotification(`Action non reconnue: ${action}`, 'warning');
    }
  };

  // Gestionnaire de retry pour les erreurs
  const handleRetry = () => {
    fetchTechniciens(pagination.pageNumber, pagination.pageSize);
    showNotification('Liste des techniciens rechargée', 'success');
  };

  // Gestionnaire de succès après ajout
  const handleAddSuccess = () => {
    fetchTechniciens(0, pagination.pageSize);
    showNotification('Technicien créé avec succès !', 'success');
  };

  // Gestionnaire de succès après modification
  const handleEditSuccess = () => {
    fetchTechniciens(pagination.pageNumber, pagination.pageSize);
    showNotification('Technicien modifié avec succès !', 'success');
  };

  // Gestionnaire de succès après suppression
  const handleDeleteSuccess = () => {
    const totalAfterDelete = pagination.totalElements - 1;
    const maxPage = Math.max(0, Math.ceil(totalAfterDelete / pagination.pageSize) - 1);
    const targetPage = Math.min(pagination.pageNumber, maxPage);
    
    fetchTechniciens(targetPage, pagination.pageSize);
    showNotification('Technicien supprimé avec succès !', 'success');
  };

  // Gestionnaire de succès après changement de statut
  const handleStatusSuccess = () => {
    console.log('Status change successful, refreshing list');
    fetchTechniciens(pagination.pageNumber, pagination.pageSize);
    const action = statusAction === 'activate' ? 'activé' : 'désactivé';
    showNotification(`Technicien ${action} avec succès !`, 'success');
  };

  // Gestionnaire de fermeture des modals
  const handleModalClose = () => {
    console.log('Closing modals');
    setSelectedTechnicien(null);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowStatusModal(false);
  };

  // Gestionnaire des erreurs de recherche
  const handleSearchError = (errorMessage: string) => {
    showNotification(`Erreur de recherche: ${errorMessage}`, 'danger');
  };

  // Debug: Afficher l'état actuel
  console.log('Current state:', {
    techniciensCount: techniciens.length,
    pagination,
    loading,
    error,
    currentUserRole,
    selectedTechnicien: selectedTechnicien?.id,
    showStatusModal,
    statusAction
  });

  // Déterminer le titre selon le rôle
  const getPageTitle = () => {
    if (currentUserRole === 'ADMIN') {
      return 'Gestion des techniciens';
    }
    return 'Mes techniciens';
  };

  const getPageSubtitle = () => {
    if (currentUserRole === 'ADMIN') {
      return `Gestion de tous les techniciens (${pagination.totalElements} technicien${pagination.totalElements !== 1 ? 's' : ''})`;
    }
    return `Gestion de vos techniciens (${pagination.totalElements} technicien${pagination.totalElements !== 1 ? 's' : ''})`;
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
                Nouveau technicien
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Section de recherche */}
      <Row>
        <Col>
          <TechnicienSearch 
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={loading}
            onError={handleSearchError}
          />
        </Col>
      </Row>
      
      {/* Table des techniciens */}
      <Row>
        <Col>
          <TechnicienTable
            techniciens={techniciens}
            pagination={pagination}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onTechnicienAction={handleTechnicienAction}
          />
        </Col>
      </Row>

      {/* Modals */}
      
      {/* Modal d'ajout */}
      <AddTechnicienModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal d'édition */}
      {selectedTechnicien && showEditModal && (
        <EditTechnicienModal
          show={showEditModal}
          onHide={handleModalClose}
          technicienId={selectedTechnicien.id}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de suppression */}
      {selectedTechnicien && showDeleteModal && (
        <TechnicienDeleteModal
          show={showDeleteModal}
          onHide={handleModalClose}
          technicien={selectedTechnicien}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Modal d'activation/désactivation */}
      {selectedTechnicien && showStatusModal && (
        <TechnicienStatusModal
          show={showStatusModal}
          onHide={handleModalClose}
          technicien={selectedTechnicien}
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

export default Technicien;