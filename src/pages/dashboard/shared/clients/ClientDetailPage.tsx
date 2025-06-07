// src/pages/dashboard/shared/clients/ClientDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, Award, BarChart2, Edit, ToggleLeft, ToggleRight, Trash, Briefcase } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientDetail } from './hooks/useClientDetail';
import EditClientModal from './components/EditClientModal';
import ClientDeleteModal from './components/ClientDeleteModal';
import ClientStatusModal from './components/ClientStatusModal';
import { Building } from 'react-bootstrap-icons';

const ClientDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id) : 0;

  // États pour les modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');

  const {
    client,
    loading,
    error,
    fetchClient,
    refreshClient
  } = useClientDetail();

  useEffect(() => {
    if (clientId) {
      fetchClient(clientId);
    }
  }, [clientId, fetchClient]);

  const handleBack = () => {
    navigate('/clients');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleStatusToggle = () => {
    if (!client) return;
    setStatusAction(client.isActive ? 'deactivate' : 'activate');
    setShowStatusModal(true);
  };

  const handleSuccess = () => {
    refreshClient();
  };

  const handleDeleteSuccess = () => {
    navigate('/clients');
  };

  // Fonction pour obtenir la couleur de l'avatar
  const getAvatarColor = (name: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Fonction pour obtenir les initiales
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fonction pour obtenir le label du type de client
  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return 'Particulier';
      case 'COMPANY': return 'Entreprise';
      case 'GOVERNMENT': return 'Gouvernement';
      default: return type;
    }
  };

  // Fonction pour obtenir la couleur du badge du type de client
  const getClientTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return 'bg-info';
      case 'COMPANY': return 'bg-primary';
      case 'GOVERNMENT': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  if (!clientId) {
    return (
      <Container fluid className="p-6">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>ID de client invalide</p>
          <Button variant="outline-danger" onClick={handleBack}>
            Retour à la liste
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container fluid className="p-6">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement des détails du client...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-6">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={() => fetchClient(clientId)}>
              Réessayer
            </Button>
            <Button variant="outline-secondary" onClick={handleBack}>
              Retour à la liste
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!client) {
    return (
      <Container fluid className="p-6">
        <Alert variant="warning">
          <Alert.Heading>Client non trouvé</Alert.Heading>
          <p>Le client demandé n'existe pas ou a été supprimé.</p>
          <Button variant="outline-warning" onClick={handleBack}>
            Retour à la liste
          </Button>
        </Alert>
      </Container>
    );
  }

  const avatarColor = getAvatarColor(`${client.firstName} ${client.lastName}`);
  const initials = getInitials(`${client.firstName} ${client.lastName}`);

  return (
    <Container fluid className="p-6">
      {/* En-tête */}
      <Row>
        <Col xs={12}>
          <div className="border-bottom pb-4 mb-4">
            {/* Version Desktop */}
            <div className="d-none d-lg-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Button 
                  variant="outline-secondary" 
                  className="me-3"
                  onClick={handleBack}
                >
                  <ArrowLeft size="16px" className="me-2" />
                  Retour
                </Button>
                <div>
                  <h1 className="mb-0 h2 fw-bold">
                    Détails du client
                  </h1>
                  <p className="mb-0 text-muted">
                    Informations complètes de {client.firstName} {client.lastName}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary"
                  onClick={handleEdit}
                >
                  <Edit size="16px" className="me-2" />
                  Modifier
                </Button>
                <Button 
                  variant={client.isActive ? "outline-warning" : "outline-success"}
                  onClick={handleStatusToggle}
                >
                  {client.isActive ? (
                    <>
                      <ToggleLeft size="16px" className="me-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <ToggleRight size="16px" className="me-2" />
                      Activer
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline-danger"
                  onClick={handleDelete}
                >
                  <Trash size="16px" className="me-2" />
                  Supprimer
                </Button>
              </div>
            </div>

            {/* Version Mobile/Tablet */}
            <div className="d-lg-none">
              {/* Bouton retour et titre */}
              <div className="d-flex align-items-center mb-3">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="me-3"
                  onClick={handleBack}
                >
                  <ArrowLeft size="14px" className="me-1" />
                  Retour
                </Button>
                <div className="flex-grow-1">
                  <h1 className="mb-0 h4 fw-bold">
                    Détails du client
                  </h1>
                  <p className="mb-0 text-muted small">
                    {client.firstName} {client.lastName}
                  </p>
                </div>
              </div>

              {/* Boutons d'actions sur mobile */}
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant="outline-primary"
                  size="sm"
                  className="flex-fill"
                  onClick={handleEdit}
                >
                  <Edit size="14px" className="me-1" />
                  Modifier
                </Button>
                <Button 
                  variant={client.isActive ? "outline-warning" : "outline-success"}
                  size="sm"
                  className="flex-fill"
                  onClick={handleStatusToggle}
                >
                  {client.isActive ? (
                    <>
                      <ToggleLeft size="14px" className="me-1" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <ToggleRight size="14px" className="me-1" />
                      Activer
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDelete}
                  style={{ minWidth: 'auto' }}
                >
                  <Trash size="14px" />
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Profil principal */}
        <Col lg={4} md={12} className="mb-4">
          <Card className="text-center">
            <Card.Body className="p-4">
              {/* Avatar - Mobile */}
              <div 
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center d-lg-none"
                style={{ 
                  backgroundColor: avatarColor,
                  width: '80px',
                  height: '80px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {initials}
              </div>
              {/* Avatar - Desktop */}
              <div 
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center d-none d-lg-flex"
                style={{ 
                  backgroundColor: avatarColor,
                  width: '120px',
                  height: '120px',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {initials}
              </div>

              {/* Nom et statut */}
              <h3 className="mb-2 fs-5 fs-lg-3">{client.firstName} {client.lastName}</h3>
              <p className="text-muted mb-3 small">@{client.username}</p>
              
              {/* Badge de statut */}
              <Badge 
                bg={client.isActive ? "success" : "danger"} 
                className="mb-3 px-3 py-2"
              >
                {client.isActive ? "Actif" : "Inactif"}
              </Badge>

              {/* Type de client */}
              <div className="mb-3">
                <Badge 
                  className={`${getClientTypeBadgeClass(client.clientType)} px-3 py-2`}
                >
                  {getClientTypeLabel(client.clientType)}
                </Badge>
              </div>

              {/* Actions rapides */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="flex-grow-1 flex-lg-grow-0"
                  onClick={() => window.location.href = `tel:${client.phoneNumber}`}
                >
                  <Phone size="14px" className="me-1" />
                  <span className="d-none d-sm-inline">Appeler</span>
                  <span className="d-sm-none">Tel</span>
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="flex-grow-1 flex-lg-grow-0"
                  onClick={() => window.location.href = `mailto:${client.email}`}
                >
                  <Mail size="14px" className="me-1" />
                  Email
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Informations détaillées */}
        <Col lg={8} md={12}>
          <Tabs defaultActiveKey="info" className="mb-3 nav-fill">
            {/* Onglet Informations */}
            <Tab eventKey="info" title={
              <span>
                <User size="14px" className="me-1 d-none d-sm-inline" />
                Informations
              </span>
            }>
              <Row>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <User size="16px" className="me-2" />
                        Informations personnelles
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Prénom:</strong>
                        <p className="mb-0">{client.firstName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Nom:</strong>
                        <p className="mb-0">{client.lastName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">CIN:</strong>
                        <p className="mb-0">{client.cin}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Date de naissance:</strong>
                        <p className="mb-0 small">
                          <Calendar size="12px" className="me-1" />
                          {formatDate(client.birthday)}
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Ville:</strong>
                        <p className="mb-0 small">
                          <MapPin size="12px" className="me-1" />
                          {client.cityName}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <Mail size="16px" className="me-2" />
                        Contact
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Email:</strong>
                        <p className="mb-0 small">
                          <a href={`mailto:${client.email}`} className="text-break">
                            {client.email}
                          </a>
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Téléphone:</strong>
                        <p className="mb-0">
                          <a href={`tel:${client.phoneNumber}`}>
                            {client.phoneNumber}
                          </a>
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Nom d'utilisateur:</strong>
                        <p className="mb-0">@{client.username}</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <Building size="16px" className="me-2" />
                        Informations client
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Type de client:</strong>
                        <p className="mb-0">
                          <Badge className={getClientTypeBadgeClass(client.clientType)}>
                            {getClientTypeLabel(client.clientType)}
                          </Badge>
                        </p>
                      </div>
                      {client.companyName && (
                        <div className="mb-3">
                          <strong className="small">Entreprise/Organisation:</strong>
                          <p className="mb-0">{client.companyName}</p>
                        </div>
                      )}
                      <div className="mb-0">
                        <strong className="small">Rôle:</strong>
                        <Badge bg="info">{client.role}</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <Award size="16px" className="me-2" />
                        Gestion
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Créé par:</strong>
                        <p className="mb-0">{client.createdByTopographeName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Créé le:</strong>
                        <p className="mb-0 small">{formatDate(client.createdAt)}</p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Statut:</strong>
                        <Badge bg={client.isActive ? "success" : "danger"}>
                          {client.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            {/* Onglet Statistiques */}
            <Tab eventKey="stats" title={
              <span>
                <BarChart2 size="14px" className="me-1 d-none d-sm-inline" />
                Projets
              </span>
            }>
              <Row>
                <Col sm={6} lg={4} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Briefcase size="36px" className="text-primary mb-3" />
                      <h2 className="mb-2 fs-4">{client.totalProjects}</h2>
                      <h5 className="text-muted fs-6">Total</h5>
                      <p className="text-muted mb-0 small">
                        Nombre total de projets
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={4} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Briefcase size="36px" className="text-warning mb-3" />
                      <h2 className="mb-2 fs-4">{client.activeProjects}</h2>
                      <h5 className="text-muted fs-6">Actifs</h5>
                      <p className="text-muted mb-0 small">
                        Projets en cours
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={12} lg={4} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Briefcase size="36px" className="text-success mb-3" />
                      <h2 className="mb-2 fs-4">{client.completedProjects}</h2>
                      <h5 className="text-muted fs-6">Terminés</h5>
                      <p className="text-muted mb-0 small">
                        Projets complétés
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Résumé des projets */}
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0 fs-6">Résumé des projets</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="row text-center">
                        <div className="col-6 col-md-3 mb-3 mb-md-0">
                          <h4 className="text-primary fs-5">{client.totalProjects}</h4>
                          <p className="text-muted small mb-0">Total projets</p>
                        </div>
                        <div className="col-6 col-md-3 mb-3 mb-md-0">
                          <h4 className="text-warning fs-5">{client.activeProjects}</h4>
                          <p className="text-muted small mb-0">En cours</p>
                        </div>
                        <div className="col-6 col-md-3 mb-3 mb-md-0">
                          <h4 className="text-success fs-5">{client.completedProjects}</h4>
                          <p className="text-muted small mb-0">Terminés</p>
                        </div>
                        <div className="col-6 col-md-3">
                          <h4 className="text-info fs-5">
                            {client.totalProjects > 0 ? 
                              Math.round((client.completedProjects / client.totalProjects) * 100) : 0}%
                          </h4>
                          <p className="text-muted small mb-0">Taux de réussite</p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Modals */}
      {client && showEditModal && (
        <EditClientModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          clientId={client.id}
          onSuccess={handleSuccess}
        />
      )}

      {client && showDeleteModal && (
        <ClientDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          client={client}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {client && showStatusModal && (
        <ClientStatusModal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          client={client}
          action={statusAction}
          onSuccess={handleSuccess}
        />
      )}
    </Container>
  );
};

export default ClientDetailPage;