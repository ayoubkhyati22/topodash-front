import React, { useState } from 'react';
import { Col, Row, Container, Button } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { useTopographes } from './hooks/useTopographes';
import { TopographeTable } from './components/TopographeTable';
import TopographeSearch from './components/TopographeSearch';
import AddTopographeModal from './components/AddTopographeModal';

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

  const [showAddModal, setShowAddModal] = useState(false);

  const handleUserAction = (action: string, userId: number) => {
    console.log(`Action ${action} for user ${userId}`);
    // Implement your action handlers here
    switch (action) {
      case 'view':
        console.log('Voir topographe:', userId);
        break;
      case 'edit':
        console.log('Modifier topographe:', userId);
        break;
      case 'delete':
        console.log('Supprimer topographe:', userId);
        break;
      case 'call':
        console.log('Appeler topographe:', userId);
        break;
      case 'sendMail':
        console.log('Envoyer email topographe:', userId);
        break;
      case 'sendSms':
        console.log('Envoyer WhatsApp topographe:', userId);
        break;
    }
  };

  const handleRetry = () => {
    fetchUsers(pagination.pageNumber, pagination.pageSize);
  };

  const handleAddSuccess = () => {
    // Recharger la liste après ajout
    fetchUsers(0, pagination.pageSize);
  };

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">Gestion des topographes</h1>
              <p className="mb-0">
                Gestion de vos topographes ({pagination.totalElements} topographe{pagination.totalElements !== 1 ? 's' : ''})
              </p>
            </div>
            <div>
              <Button 
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size="16px" className="me-2" />
                Nouveau topographe
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <TopographeSearch 
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={loading}
          />
        </Col>
      </Row>
      
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

      {/* Modal d'ajout */}
      <AddTopographeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </Container>
  );
};

export default Topographe;