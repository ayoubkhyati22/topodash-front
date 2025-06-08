// src/pages/dashboard/shared/techniciens/TechnicienDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, Award, BarChart2, Edit, ToggleLeft, ToggleRight, Trash, Tool } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import { useTechnicienDetail } from './hooks/useTechnicienDetail';
import EditTechnicienModal from './components/EditTechnicienModal';
import TechnicienDeleteModal from './components/TechnicienDeleteModal';
import TechnicienStatusModal from './components/TechnicienStatusModal';

const TechnicienDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const technicienId = id ? parseInt(id) : 0;

  // États pour les modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('activate');

  const {
    technicien,
    loading,
    error,
    fetchTechnicien,
    refreshTechnicien
  } = useTechnicienDetail();

  useEffect(() => {
    if (technicienId) {
      fetchTechnicien(technicienId);
    }
  }, [technicienId, fetchTechnicien]);

  const handleBack = () => {
    navigate('/techniciens');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleStatusToggle = () => {
    if (!technicien) return;
    setStatusAction(technicien.isActive ? 'deactivate' : 'activate');
    setShowStatusModal(true);
  };

  const handleSuccess = () => {
    refreshTechnicien();
  };

  const handleDeleteSuccess = () => {
    navigate('/techniciens');
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

  // Fonction pour obtenir le label du niveau de compétence
  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR': return 'Junior';
      case 'SENIOR': return 'Senior';
      case 'EXPERT': return 'Expert';
      default: return level;
    }
  };

  // Fonction pour obtenir la couleur du badge du niveau
  const getSkillLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'JUNIOR': return 'bg-info';
      case 'SENIOR': return 'bg-success';
      case 'EXPERT': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (!technicienId) {
    return (
      <Container fluid className="p-6">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>ID de technicien invalide</p>
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
          <p className="mt-3">Chargement des détails du technicien...</p>
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
            <Button variant="outline-danger" onClick={() => fetchTechnicien(technicienId)}>
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

  if (!technicien) {
    return (
      <Container fluid className="p-6">
        <Alert variant="warning">
          <Alert.Heading>Technicien non trouvé</Alert.Heading>
          <p>Le technicien demandé n'existe pas ou a été supprimé.</p>
          <Button variant="outline-warning" onClick={handleBack}>
            Retour à la liste
          </Button>
        </Alert>
      </Container>
    );
  }

  const avatarColor = getAvatarColor(`${technicien.firstName} ${technicien.lastName}`);
  const initials = getInitials(`${technicien.firstName} ${technicien.lastName}`);

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
                    Détails du technicien
                  </h1>
                  <p className="mb-0 text-muted">
                    Informations complètes de {technicien.firstName} {technicien.lastName}
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
                  variant={technicien.isActive ? "outline-warning" : "outline-success"}
                  onClick={handleStatusToggle}
                >
                  {technicien.isActive ? (
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
                    Détails du technicien
                  </h1>
                  <p className="mb-0 text-muted small">
                    {technicien.firstName} {technicien.lastName}
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
                  variant={technicien.isActive ? "outline-warning" : "outline-success"}
                  size="sm"
                  className="flex-fill"
                  onClick={handleStatusToggle}
                >
                  {technicien.isActive ? (
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
              <h3 className="mb-2 fs-5 fs-lg-3">{technicien.firstName} {technicien.lastName}</h3>
              <p className="text-muted mb-3 small">@{technicien.username}</p>
              
              {/* Badge de statut */}
              <Badge 
                bg={technicien.isActive ? "success" : "danger"} 
                className="mb-3 px-3 py-2"
              >
                {technicien.isActive ? "Actif" : "Inactif"}
              </Badge>

              {/* Niveau de compétence */}
              <div className="mb-3">
                <Badge 
                  className={`${getSkillLevelBadgeClass(technicien.skillLevel)} px-3 py-2`}
                >
                  {getSkillLevelLabel(technicien.skillLevel)}
                </Badge>
              </div>

              {/* Actions rapides */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="flex-grow-1 flex-lg-grow-0"
                  onClick={() => window.location.href = `tel:${technicien.phoneNumber}`}
                >
                  <Phone size="14px" className="me-1" />
                  <span className="d-none d-sm-inline">Appeler</span>
                  <span className="d-sm-none">Tel</span>
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="flex-grow-1 flex-lg-grow-0"
                  onClick={() => window.location.href = `mailto:${technicien.email}`}
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
                        <p className="mb-0">{technicien.firstName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Nom:</strong>
                        <p className="mb-0">{technicien.lastName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">CIN:</strong>
                        <p className="mb-0">{technicien.cin}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Date de naissance:</strong>
                        <p className="mb-0 small">
                          <Calendar size="12px" className="me-1" />
                          {formatDate(technicien.birthday)}
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Ville:</strong>
                        <p className="mb-0 small">
                          <MapPin size="12px" className="me-1" />
                          {technicien.cityName}
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
                          <a href={`mailto:${technicien.email}`} className="text-break">
                            {technicien.email}
                          </a>
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Téléphone:</strong>
                        <p className="mb-0">
                          <a href={`tel:${technicien.phoneNumber}`}>
                            {technicien.phoneNumber}
                          </a>
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Nom d'utilisateur:</strong>
                        <p className="mb-0">@{technicien.username}</p>
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
                        <Tool size="16px" className="me-2" />
                        Compétences
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Niveau de compétence:</strong>
                        <p className="mb-0">
                          <Badge className={getSkillLevelBadgeClass(technicien.skillLevel)}>
                            {getSkillLevelLabel(technicien.skillLevel)}
                          </Badge>
                        </p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Spécialités:</strong>
                        <p className="mb-0">{technicien.specialties}</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <Award size="16px" className="me-2" />
                        Affectation
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Affecté à:</strong>
                        <p className="mb-0">{technicien.assignedToTopographeName}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Créé le:</strong>
                        <p className="mb-0 small">{formatDate(technicien.createdAt)}</p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Statut:</strong>
                        <Badge bg={technicien.isActive ? "success" : "danger"}>
                          {technicien.isActive ? "Actif" : "Inactif"}
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
                Tâches
              </span>
            }>
              <Row>
                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Tool size="36px" className="text-primary mb-3" />
                      <h2 className="mb-2 fs-4">{technicien.totalTasks}</h2>
                      <h5 className="text-muted fs-6">Total</h5>
                      <p className="text-muted mb-0 small">
                        Nombre total de tâches
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Tool size="36px" className="text-warning mb-3" />
                      <h2 className="mb-2 fs-4">{technicien.activeTasks}</h2>
                      <h5 className="text-muted fs-6">Actives</h5>
                      <p className="text-muted mb-0 small">
                        Tâches en cours
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Tool size="36px" className="text-success mb-3" />
                      <h2 className="mb-2 fs-4">{technicien.completedTasks}</h2>
                      <h5 className="text-muted fs-6">Terminées</h5>
                      <p className="text-muted mb-0 small">
                        Tâches complétées
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <Tool size="36px" className="text-info mb-3" />
                      <h2 className="mb-2 fs-4">{technicien.todoTasks}</h2>
                      <h5 className="text-muted fs-6">À faire</h5>
                      <p className="text-muted mb-0 small">
                        Tâches à traiter
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Résumé des tâches */}
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0 fs-6">Résumé des tâches</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="row text-center">
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-primary fs-5">{technicien.totalTasks}</h4>
                          <p className="text-muted small mb-0">Total tâches</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-warning fs-5">{technicien.activeTasks}</h4>
                          <p className="text-muted small mb-0">En cours</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-success fs-5">{technicien.completedTasks}</h4>
                          <p className="text-muted small mb-0">Terminées</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-info fs-5">{technicien.todoTasks}</h4>
                          <p className="text-muted small mb-0">À faire</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-secondary fs-5">{technicien.reviewTasks}</h4>
                          <p className="text-muted small mb-0">En révision</p>
                        </div>
                        <div className="col-6 col-md-2">
                          <h4 className="text-success fs-5">
                            {technicien.totalTasks > 0 ? 
                              Math.round((technicien.completedTasks / technicien.totalTasks) * 100) : 0}%
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
      {technicien && showEditModal && (
        <EditTechnicienModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          technicienId={technicien.id}
          onSuccess={handleSuccess}
        />
      )}

      {technicien && showDeleteModal && (
        <TechnicienDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          technicien={technicien}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {technicien && showStatusModal && (
        <TechnicienStatusModal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          technicien={technicien}
          action={statusAction}
          onSuccess={handleSuccess}
        />
      )}
    </Container>
  );
};

export default TechnicienDetailPage;