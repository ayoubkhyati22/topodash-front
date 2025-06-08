import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ArrowLeft, Plus } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from './components/ProjectForm';

const AddProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Rediriger vers la liste des projets après création
    navigate('/projects');
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">
                <Plus size="32px" className="me-2" />
                Nouveau projet
              </h1>
              <p className="mb-0">
                Création d'un nouveau projet topographique
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
              <h4 className="mb-0">Informations du projet</h4>
              <p className="mb-0 text-muted">
                Remplissez les champs nécessaires pour créer un nouveau projet
              </p>
            </Card.Header>
            <Card.Body className="p-4">
              <ProjectForm 
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

export default AddProjectPage;