import React from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { useUsers } from './hooks/useUsers';
import { UserTable } from './components/UserTable';

const User: React.FC = () => {
  const { users, pagination, loading, error, fetchUsers, handlePageChange } = useUsers();

  const handleUserAction = (action: string, userId: number) => {
    console.log(`Action ${action} for user ${userId}`);
    // Implement your action handlers here
    switch (action) {
      case 'view':
        // Navigate to user detail page
        break;
      case 'edit':
        // Navigate to user edit page
        break;
      case 'delete':
        // Show delete confirmation
        break;
    }
  };

  const handleRetry = () => {
    fetchUsers(pagination.pageNumber, pagination.pageSize);
  };

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">Gestion des utilisateurs</h1>
              <p className="mb-0">
                Gestion de vos utilisateurs ({pagination.totalElements} utilisateurs)
              </p>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <UserTable
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
    </Container>
  );
};

export default User;