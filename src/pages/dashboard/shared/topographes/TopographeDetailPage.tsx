import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, CreditCard, Award, BookOpen, Users, Briefcase, Edit, ToggleLeft, ToggleRight, Trash, BarChart2 } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import { useTopographeDetail } from './hooks/useTopographeDetail';
import EditTopographeModal from './components/EditTopographeModal';
import TopographeDeleteModal from './components/TopographeDeleteModal';
import TopographeStatusModal from './components/TopographeStatusModal';

const TopographeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const topographeId = id ? parseInt(id) : 0;

  // États pour les modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');

  const {
    topographe,
    loading,
    error,
    fetchTopographe,
    refreshTopographe
  } = useTopographeDetail();

  useEffect(() => {
    if (topographeId) {
      fetchTopographe(topographeId);
    }
  }, [topographeId, fetchTopographe]);

  const handleBack = () => {
    navigate('/topographes');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleStatusToggle = () => {
    if (!topographe) return;
    setStatusAction(topographe.isActive ? 'deactivate' : 'activate');
    setShowStatusModal(true);
  };

  const handleSuccess = () => {
    refreshTopographe();
  };

  const handleDeleteSuccess = () => {
    navigate('/topographes');
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

  if (!topographeId) {
    return (
      <Container fluid className="p-6">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>ID de topographe invalide</p>
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
                <p className="mt-3">Chargement des détails du topographe...</p>
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
            <Button variant="outline-danger" onClick={() => fetchTopographe(topographeId)}>
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

  if (!topographe) {
    return (
      <Container fluid className="p-6">
        <Alert variant="warning">
          <Alert.Heading>Topographe non trouvé</Alert.Heading>
          <p>Le topographe demandé n'existe pas ou a été supprimé.</p>
          <Button variant="outline-warning" onClick={handleBack}>
            Retour à la liste
          </Button>
        </Alert>
      </Container>
    );
  }

  const avatarColor = getAvatarColor(`${topographe.firstName} ${topographe.lastName}`);
  const initials = getInitials(`${topographe.firstName} ${topographe.lastName}`);

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
                    Détails du topographe
                  </h1>
                  <p className="mb-0 text-muted">
                    Informations complètes de {topographe.firstName} {topographe.lastName}
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
                  variant={topographe.isActive ? "outline-warning" : "outline-success"}
                  onClick={handleStatusToggle}
                >
                  {topographe.isActive ? (
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
                    Détails du topographe
                  </h1>
                  <p className="mb-0 text-muted small">
                    {topographe.firstName} {topographe.lastName}
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
                  variant={topographe.isActive ? "outline-warning" : "outline-success"}
                  size="sm"
                  className="flex-fill"
                  onClick={handleStatusToggle}
                >
                  {topographe.isActive ? (
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
              <h3 className="mb-2 fs-5 fs-lg-3">{topographe.firstName} {topographe.lastName}</h3>
              <p className="text-muted mb-3 small">@{topographe.username}</p>
              
              {/* Badge de statut */}
              <Badge 
                bg={topographe.isActive ? "success" : "danger"} 
                className="mb-3 px-3 py-2"
              >
                {topographe.isActive ? "Actif" : "Inactif"}
              </Badge>

              {/* Actions rapides */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="flex-grow-1 flex-lg-grow-0"
                  onClick={() => window.location.href = `tel:${topographe.phoneNumber}`}
                >
                  <Phone size="14px" className="me-1" />
                  <span className="d-none d-sm-inline">Appeler</span>
                  <span className="d-sm-none">Tel</span>
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="flex-grow-1 flex-lg-grow-0"
                  onClick={() => window.location.href = `mailto:${topographe.email}`}
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
                        <p className="mb-0">{topographe.firstName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Nom:</strong>
                        <p className="mb-0">{topographe.lastName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">CIN:</strong>
                        <p className="mb-0">{topographe.cin}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Date de naissance:</strong>
                        <p className="mb-0 small">
                          <Calendar size="12px" className="me-1" />
                          {formatDate(topographe.birthday)}
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Ville:</strong>
                        <p className="mb-0 small">
                          <MapPin size="12px" className="me-1" />
                          {topographe.cityName}
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
                          <a href={`mailto:${topographe.email}`} className="text-break">
                            {topographe.email}
                          </a>
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Téléphone:</strong>
                        <p className="mb-0">
                          <a href={`tel:${topographe.phoneNumber}`}>
                            {topographe.phoneNumber}
                          </a>
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Nom d'utilisateur:</strong>
                        <p className="mb-0">@{topographe.username}</p>
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
                        <Award size="16px" className="me-2" />
                        Informations professionnelles
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Numéro de licence:</strong>
                        <p className="mb-0">{topographe.licenseNumber}</p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Rôle:</strong>
                        <Badge bg="info">{topographe.role}</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <CreditCard size="16px" className="me-2" />
                        Compte
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Créé le:</strong>
                        <p className="mb-0 small">{formatDate(topographe.createdAt)}</p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Statut:</strong>
                        <Badge bg={topographe.isActive ? "success" : "danger"}>
                          {topographe.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={12} className="mb-4">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <BookOpen size="16px" className="me-2" />
                        Spécialisation
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-0 small">{topographe.specialization}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            {/* Onglet Statistiques */}
            <Tab eventKey="stats" title={
              <span>
                <BarChart2 size="14px" className="me-1 d-none d-sm-inline" />
                Stats
              </span>
            }>
              <Row>
                <Col sm={6} lg={4} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <User size="36px" className="text-info mb-3" />
                      <h2 className="mb-2 fs-4">{topographe.totalClients}</h2>
                      <h5 className="text-muted fs-6">Clients</h5>
                      <p className="text-muted mb-0 small">
                        Nombre total de clients assignés
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={4} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Users size="36px" className="text-warning mb-3" />
                      <h2 className="mb-2 fs-4">{topographe.totalTechniciens}</h2>
                      <h5 className="text-muted fs-6">Techniciens</h5>
                      <p className="text-muted mb-0 small">
                        Nombre total de techniciens supervisés
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={12} lg={4} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Briefcase size="36px" className="text-secondary mb-3" />
                      <h2 className="mb-2 fs-4">{topographe.totalProjects}</h2>
                      <h5 className="text-muted fs-6">Projets</h5>
                      <p className="text-muted mb-0 small">
                        Nombre total de projets gérés
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Résumé des activités */}
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0 fs-6">Résumé d'activité</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="row text-center">
                        <div className="col-6 col-md-3 mb-3 mb-md-0">
                          <h4 className="text-primary fs-5">{topographe.totalClients + topographe.totalTechniciens}</h4>
                          <p className="text-muted small mb-0">Total personnes</p>
                        </div>
                        <div className="col-6 col-md-3 mb-3 mb-md-0">
                          <h4 className="text-success fs-5">{topographe.totalProjects}</h4>
                          <p className="text-muted small mb-0">Projets actifs</p>
                        </div>
                        <div className="col-6 col-md-3 mb-3 mb-md-0">
                          <h4 className="text-info fs-5">
                            {topographe.totalProjects > 0 ? 
                              Math.round((topographe.totalClients + topographe.totalTechniciens) / topographe.totalProjects * 100) / 100 : 0}
                          </h4>
                          <p className="text-muted small mb-0">Ratio personnes/projet</p>
                        </div>
                        <div className="col-6 col-md-3">
                          <h4 className={`fs-5 ${topographe.isActive ? "text-success" : "text-danger"}`}>
                            {topographe.isActive ? "Actif" : "Inactif"}
                          </h4>
                          <p className="text-muted small mb-0">Statut du compte</p>
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
      {topographe && showEditModal && (
        <EditTopographeModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          topographeId={topographe.id}
          onSuccess={handleSuccess}
        />
      )}

      {topographe && showDeleteModal && (
        <TopographeDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          topographe={topographe}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {topographe && showStatusModal && (
        <TopographeStatusModal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          topographe={topographe}
          action={statusAction}
          onSuccess={handleSuccess}
        />
      )}
    </Container>
  );
};

export default TopographeDetailPage;