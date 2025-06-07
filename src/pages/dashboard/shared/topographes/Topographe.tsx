// Topographe.tsx - Version corrigée avec gestion complète des actions
import React, { useState } from 'react';
import { Col, Row, Container, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { useTopographes } from './hooks/useTopographes';
import { TopographeTable } from './components/TopographeTable';
import TopographeSearch from './components/TopographeSearch';
import AddTopographeModal from './components/AddTopographeModal';
import EditTopographeModal from './components/EditTopographeModal';
import TopographeDeleteModal from './components/TopographeDeleteModal';
import TopographeStatusModal from './components/TopographeStatusModal';
import { Topographe as TopographeType } from './types';

const Topographe: React.FC = () => {
  const { 
    users, 
    pagination, 
    loading, 
    error, 
    fetchUsers, 
    handlePageChange, 
    handleSearch,
    clearSearch 
  } = useTopographes();

  // États des modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // États pour gérer les sélections
  const [selectedTopographe, setSelectedTopographe] = useState<TopographeType | null>(null);
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
  const handleUserAction = (action: string, userId: number) => {
    console.log(`Action triggered: ${action} for user ID: ${userId}`);
    
    const topographe = users.find(u => u.id === userId);
    if (!topographe) {
      showNotification('Topographe non trouvé', 'danger');
      console.error('Topographe not found for ID:', userId);
      return;
    }

    console.log('Selected topographe:', topographe);
    setSelectedTopographe(topographe);

    switch (action) {
      case 'view':
        console.log('Viewing topographe:', userId);
        showNotification('Fonctionnalité de visualisation en cours de développement', 'warning');
        break;
        
      case 'edit':
        console.log('Editing topographe:', userId);
        setShowEditModal(true);
        break;
        
      case 'delete':
        console.log('Deleting topographe:', userId);
        setShowDeleteModal(true);
        break;
        
      case 'activate':
        console.log('Activating topographe:', userId, 'Current status:', topographe.isActive);
        if (topographe.isActive) {
          showNotification('Ce topographe est déjà actif', 'warning');
          return;
        }
        setStatusAction('activate');
        setShowStatusModal(true);
        break;
        
      case 'deactivate':
        console.log('Deactivating topographe:', userId, 'Current status:', topographe.isActive);
        if (!topographe.isActive) {
          showNotification('Ce topographe est déjà inactif', 'warning');
          return;
        }
        setStatusAction('deactivate');
        setShowStatusModal(true);
        break;
        
      case 'call':
        try {
          const cleanPhoneNumber = topographe.phoneNumber.replace(/[^0-9+]/g, '');
          console.log('Calling:', cleanPhoneNumber);
          window.location.href = `tel:${cleanPhoneNumber}`;
          showNotification(`Appel vers ${topographe.firstName} ${topographe.lastName}`, 'success');
        } catch (error) {
          console.error('Error making call:', error);
          showNotification('Impossible d\'initier l\'appel', 'danger');
        }
        break;
        
      case 'sendMail':
        try {
          const subject = encodeURIComponent(`Contact - ${topographe.firstName} ${topographe.lastName}`);
          const body = encodeURIComponent(`Bonjour ${topographe.firstName},\n\n`);
          const mailtoUrl = `mailto:${topographe.email}?subject=${subject}&body=${body}`;
          console.log('Opening email:', mailtoUrl);
          window.location.href = mailtoUrl;
          showNotification(`Email ouvert pour ${topographe.firstName} ${topographe.lastName}`, 'success');
        } catch (error) {
          console.error('Error opening email:', error);
          showNotification('Impossible d\'ouvrir l\'application email', 'danger');
        }
        break;
        
      case 'sendSms':
        try {
          const cleanPhoneNumber = topographe.phoneNumber.replace(/[^0-9]/g, '');
          const message = encodeURIComponent(`Bonjour ${topographe.firstName}, `);
          const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${message}`;
          console.log('Opening WhatsApp:', whatsappUrl);
          window.open(whatsappUrl, '_blank');
          showNotification(`WhatsApp ouvert pour ${topographe.firstName} ${topographe.lastName}`, 'success');
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          showNotification('Impossible d\'ouvrir WhatsApp', 'danger');
        }
        break;
        
      default:
        console.warn(`Unhandled action: ${action} for topographe ${userId}`);
        showNotification(`Action non reconnue: ${action}`, 'warning');
    }
  };

  // Gestionnaire de retry pour les erreurs
  const handleRetry = () => {
    fetchUsers(pagination.pageNumber, pagination.pageSize);
    showNotification('Liste des topographes rechargée', 'success');
  };

  // Gestionnaire de succès après ajout
  const handleAddSuccess = () => {
    fetchUsers(0, pagination.pageSize);
    showNotification('Topographe créé avec succès !', 'success');
  };

  // Gestionnaire de succès après modification
  const handleEditSuccess = () => {
    fetchUsers(pagination.pageNumber, pagination.pageSize);
    showNotification('Topographe modifié avec succès !', 'success');
  };

  // Gestionnaire de succès après suppression
  const handleDeleteSuccess = () => {
    const totalAfterDelete = pagination.totalElements - 1;
    const maxPage = Math.max(0, Math.ceil(totalAfterDelete / pagination.pageSize) - 1);
    const targetPage = Math.min(pagination.pageNumber, maxPage);
    
    fetchUsers(targetPage, pagination.pageSize);
    showNotification('Topographe supprimé avec succès !', 'success');
  };

  // Gestionnaire de succès après changement de statut
  const handleStatusSuccess = () => {
    console.log('Status change successful, refreshing list');
    fetchUsers(pagination.pageNumber, pagination.pageSize);
    const action = statusAction === 'activate' ? 'activé' : 'désactivé';
    showNotification(`Topographe ${action} avec succès !`, 'success');
  };

  // Gestionnaire de fermeture des modals
  const handleModalClose = () => {
    console.log('Closing modals');
    setSelectedTopographe(null);
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
    usersCount: users.length,
    pagination,
    loading,
    error,
    selectedTopographe: selectedTopographe?.id,
    showStatusModal,
    statusAction
  });

  return (
    <Container fluid className="p-6">
      {/* En-tête de la page */}
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">Gestion des topographes</h1>
              <p className="mb-0">
                Gestion de vos topographes ({pagination.totalElements} topographe{pagination.totalElements !== 1 ? 's' : ''})
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="primary"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                <Plus size="16px" className="me-2" />
                Nouveau topographe
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Section de recherche */}
      <Row>
        <Col>
          <TopographeSearch 
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={loading}
            onError={handleSearchError}
          />
        </Col>
      </Row>
      
      {/* Table des topographes */}
      <Row>
        <Col>
          <TopographeTable
            users={users}
            pagination={pagination}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onUserAction={handleUserAction}
          />
        </Col>
      </Row>

      {/* Modals */}
      
      {/* Modal d'ajout */}
      <AddTopographeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal d'édition */}
      {selectedTopographe && showEditModal && (
        <EditTopographeModal
          show={showEditModal}
          onHide={handleModalClose}
          topographeId={selectedTopographe.id}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de suppression */}
      {selectedTopographe && showDeleteModal && (
        <TopographeDeleteModal
          show={showDeleteModal}
          onHide={handleModalClose}
          topographe={selectedTopographe}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Modal d'activation/désactivation */}
      {selectedTopographe && showStatusModal && (
        <TopographeStatusModal
          show={showStatusModal}
          onHide={handleModalClose}
          topographe={selectedTopographe}
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

export default Topographe;