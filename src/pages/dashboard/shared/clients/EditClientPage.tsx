// src/pages/dashboard/shared/clients/EditClientPage.tsx

import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ArrowLeft, Edit } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import ClientEditForm from './components/ClientEditForm';

const EditClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id) : 0;

  const handleSuccess = () => {
    // Rediriger vers la liste des clients après modification
    navigate('/clients');
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  if (!clientId) {
    return (
      <Container fluid className="p-6">
        <div className="text-center">
          <h3>ID de client invalide</h3>
          <Button variant="primary" onClick={handleCancel}>
            Retour à la liste
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">
                <Edit size="32px" className="me-2" />
                Modifier le client
              </h1>
              <p className="mb-0">
                Modification des informations du client
              </p>
            </div>
            <div>
              <Button 
                variant="outline-secondary"
                onClick={handleCancel}
              >
                <ArrowLeft size="16px" className="me-2" />
                Retour à la liste
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="justify-content-center">
        <Col lg={8} md={10} sm={12}>
          <Card>
            <Card.Header className="bg-white py-4">
              <h4 className="mb-0">Informations du client</h4>
              <p className="mb-0 text-muted">
                Modifiez les champs nécessaires et sauvegardez
              </p>
            </Card.Header>
            <Card.Body className="p-4">
              <ClientEditForm 
                clientId={clientId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditClientPage;