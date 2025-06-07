// Client.tsx - Version complète avec gestion des actions
import React, { useState } from 'react';
import { Col, Row, Container, Button, Toast, ToastContainer } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { useClients } from './hooks/useClients';
import { ClientTable } from './components/ClientTable';
import ClientSearch from './components/ClientSearch';
import AddClientModal from './components/AddClientModal';
import EditClientModal from './components/EditClientModal';
import ClientDeleteModal from './components/ClientDeleteModal';
import ClientStatusModal from './components/ClientStatusModal';
import { Client as ClientType } from './types';

const Client: React.FC = () => {
  const { 
    clients, 
    pagination, 
    loading, 
    error, 
    fetchClients, 
    handlePageChange, 
    handleSearch,
    clearSearch 
  } = useClients();

  // États des modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // États pour gérer les sélections
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
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
  const handleClientAction = (action: string, clientId: number) => {
    console.log(`Action triggered: ${action} for client ID: ${clientId}`);
    
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      showNotification('Client non trouvé', 'danger');
      console.error('Client not found for ID:', clientId);
      return;
    }

    console.log('Selected client:', client);
    setSelectedClient(client);

    switch (action) {
      case 'view':
        console.log('Viewing client:', clientId);
        showNotification('Fonctionnalité de visualisation en cours de développement', 'warning');
        break;
        
      case 'edit':
        console.log('Editing client:', clientId);
        setShowEditModal(true);
        break;
        
      case 'delete':
        console.log('Deleting client:', clientId);
        setShowDeleteModal(true);
        break;
        
      case 'activate':
        console.log('Activating client:', clientId, 'Current status:', client.isActive);
        if (client.isActive) {
          showNotification('Ce client est déjà actif', 'warning');
          return;
        }
        setStatusAction('activate');
        setShowStatusModal(true);
        break;
        
      case 'deactivate':
        console.log('Deactivating client:', clientId, 'Current status:', client.isActive);
        if (!client.isActive) {
          showNotification('Ce client est déjà inactif', 'warning');
          return;
        }
        setStatusAction('deactivate');
        setShowStatusModal(true);
        break;
        
      case 'call':
        try {
          const cleanPhoneNumber = client.phoneNumber.replace(/[^0-9+]/g, '');
          console.log('Calling:', cleanPhoneNumber);
          window.location.href = `tel:${cleanPhoneNumber}`;
          showNotification(`Appel vers ${client.firstName} ${client.lastName}`, 'success');
        } catch (error) {
          console.error('Error making call:', error);
          showNotification('Impossible d\'initier l\'appel', 'danger');
        }
        break;
        
      case 'sendMail':
        try {
          const subject = encodeURIComponent(`Contact - ${client.firstName} ${client.lastName}`);
          const body = encodeURIComponent(`Bonjour ${client.firstName},\n\n`);
          const mailtoUrl = `mailto:${client.email}?subject=${subject}&body=${body}`;
          console.log('Opening email:', mailtoUrl);
          window.location.href = mailtoUrl;
          showNotification(`Email ouvert pour ${client.firstName} ${client.lastName}`, 'success');
        } catch (error) {
          console.error('Error opening email:', error);
          showNotification('Impossible d\'ouvrir l\'application email', 'danger');
        }
        break;
        
      case 'sendSms':
        try {
          const cleanPhoneNumber = client.phoneNumber.replace(/[^0-9]/g, '');
          const message = encodeURIComponent(`Bonjour ${client.firstName}, `);
          const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${message}`;
          console.log('Opening WhatsApp:', whatsappUrl);
          window.open(whatsappUrl, '_blank');
          showNotification(`WhatsApp ouvert pour ${client.firstName} ${client.lastName}`, 'success');
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          showNotification('Impossible d\'ouvrir WhatsApp', 'danger');
        }
        break;
        
      default:
        console.warn(`Unhandled action: ${action} for client ${clientId}`);
        showNotification(`Action non reconnue: ${action}`, 'warning');
    }
  };

  // Gestionnaire de retry pour les erreurs
  const handleRetry = () => {
    fetchClients(pagination.pageNumber, pagination.pageSize);
    showNotification('Liste des clients rechargée', 'success');
  };

  // Gestionnaire de succès après ajout
  const handleAddSuccess = () => {
    fetchClients(0, pagination.pageSize);
    showNotification('Client créé avec succès !', 'success');
  };

  // Gestionnaire de succès après modification
  const handleEditSuccess = () => {
    fetchClients(pagination.pageNumber, pagination.pageSize);
    showNotification('Client modifié avec succès !', 'success');
  };

  // Gestionnaire de succès après suppression
  const handleDeleteSuccess = () => {
    const totalAfterDelete = pagination.totalElements - 1;
    const maxPage = Math.max(0, Math.ceil(totalAfterDelete / pagination.pageSize) - 1);
    const targetPage = Math.min(pagination.pageNumber, maxPage);
    
    fetchClients(targetPage, pagination.pageSize);
    showNotification('Client supprimé avec succès !', 'success');
  };

  // Gestionnaire de succès après changement de statut
  const handleStatusSuccess = () => {
    console.log('Status change successful, refreshing list');
    fetchClients(pagination.pageNumber, pagination.pageSize);
    const action = statusAction === 'activate' ? 'activé' : 'désactivé';
    showNotification(`Client ${action} avec succès !`, 'success');
  };

  // Gestionnaire de fermeture des modals
  const handleModalClose = () => {
    console.log('Closing modals');
    setSelectedClient(null);
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
    clientsCount: clients.length,
    pagination,
    loading,
    error,
    selectedClient: selectedClient?.id,
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
              <h1 className="mb-0 h2 fw-bold">Gestion des clients</h1>
              <p className="mb-0">
                Gestion de vos clients ({pagination.totalElements} client{pagination.totalElements !== 1 ? 's' : ''})
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="primary"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                <Plus size="16px" className="me-2" />
                Nouveau client
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Section de recherche */}
      <Row>
        <Col>
          <ClientSearch 
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={loading}
            onError={handleSearchError}
          />
        </Col>
      </Row>
      
      {/* Table des clients */}
      <Row>
        <Col>
          <ClientTable
            clients={clients}
            pagination={pagination}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onClientAction={handleClientAction}
          />
        </Col>
      </Row>

      {/* Modals */}
      
      {/* Modal d'ajout */}
      <AddClientModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal d'édition */}
      {selectedClient && showEditModal && (
        <EditClientModal
          show={showEditModal}
          onHide={handleModalClose}
          clientId={selectedClient.id}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de suppression */}
      {selectedClient && showDeleteModal && (
        <ClientDeleteModal
          show={showDeleteModal}
          onHide={handleModalClose}
          client={selectedClient}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Modal d'activation/désactivation */}
      {selectedClient && showStatusModal && (
        <ClientStatusModal
          show={showStatusModal}
          onHide={handleModalClose}
          client={selectedClient}
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

export default Client;