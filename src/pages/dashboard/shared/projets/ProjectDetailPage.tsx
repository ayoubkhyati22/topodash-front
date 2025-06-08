import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tab, Tabs, ProgressBar } from 'react-bootstrap';
import { ArrowLeft, BarChart2, User, Calendar, Edit, Play, Square, Pause, X, Trash, Clock, CheckCircle, Users } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectDetail } from './hooks/useProjectDetail';
import EditProjectModal from './components/EditProjectModal';
import ProjectDeleteModal from './components/ProjectDeleteModal';
import ProjectStatusModal from './components/ProjectStatusModal';

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projectId = id ? parseInt(id) : 0;

  // États pour les modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'start' | 'complete' | 'hold' | 'cancel'>('start');

  const {
    project,
    loading,
    error,
    fetchProject,
    refreshProject
  } = useProjectDetail();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleStatusAction = (action: 'start' | 'complete' | 'hold' | 'cancel') => {
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const handleSuccess = () => {
    refreshProject();
  };

  const handleDeleteSuccess = () => {
    navigate('/projects');
  };

  // Fonction pour obtenir la couleur du projet
  const getProjectColor = (name: string): string => {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLANNING: { bg: 'secondary', text: 'Planification' },
      IN_PROGRESS: { bg: 'primary', text: 'En cours' },
      ON_HOLD: { bg: 'warning', text: 'En attente' },
      COMPLETED: { bg: 'success', text: 'Terminé' },
      CANCELLED: { bg: 'danger', text: 'Annulé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNING;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getHealthStatusBadge = (healthStatus: string) => {
    const healthConfig = {
      GOOD: { bg: 'success', text: '✓ Bon état' },
      WARNING: { bg: 'warning', text: '⚠ Attention' },
      CRITICAL: { bg: 'danger', text: '⚠ Critique' }
    };

    const config = healthConfig[healthStatus as keyof typeof healthConfig] || healthConfig.GOOD;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const canPerformAction = (action: string) => {
    if (!project) return false;
    
    switch (action) {
      case 'start':
        return ['PLANNING', 'ON_HOLD'].includes(project.status);
      case 'complete':
        return project.status === 'IN_PROGRESS';
      case 'hold':
        return ['PLANNING', 'IN_PROGRESS'].includes(project.status);
      case 'cancel':
        return !['COMPLETED', 'CANCELLED'].includes(project.status);
      default:
        return false;
    }
  };

  if (!projectId) {
    return (
      <Container fluid className="p-6">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>ID de projet invalide</p>
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
          <p className="mt-3">Chargement des détails du projet...</p>
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
            <Button variant="outline-danger" onClick={() => fetchProject(projectId)}>
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

  if (!project) {
    return (
      <Container fluid className="p-6">
        <Alert variant="warning">
          <Alert.Heading>Projet non trouvé</Alert.Heading>
          <p>Le projet demandé n'existe pas ou a été supprimé.</p>
          <Button variant="outline-warning" onClick={handleBack}>
            Retour à la liste
          </Button>
        </Alert>
      </Container>
    );
  }

  const projectColor = getProjectColor(project.name);
  const progressVariant = project.progressPercentage >= 75 ? 'success' :
                         project.progressPercentage >= 50 ? 'info' :
                         project.progressPercentage >= 25 ? 'warning' : 'danger';

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
                    Détails du projet
                  </h1>
                  <p className="mb-0 text-muted">
                    Informations complètes de {project.name}
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
                
                {canPerformAction('start') && (
                  <Button 
                    variant="outline-success"
                    onClick={() => handleStatusAction('start')}
                  >
                    <Play size="16px" className="me-2" />
                    {project.status === 'ON_HOLD' ? 'Reprendre' : 'Démarrer'}
                  </Button>
                )}
                
                {canPerformAction('complete') && (
                  <Button 
                    variant="outline-success"
                    onClick={() => handleStatusAction('complete')}
                  >
                    <Square size="16px" className="me-2" />
                    Terminer
                  </Button>
                )}
                
                {canPerformAction('hold') && (
                  <Button 
                    variant="outline-warning"
                    onClick={() => handleStatusAction('hold')}
                  >
                    <Pause size="16px" className="me-2" />
                    En attente
                  </Button>
                )}
                
                {canPerformAction('cancel') && (
                  <Button 
                    variant="outline-danger"
                    onClick={() => handleStatusAction('cancel')}
                  >
                    <X size="16px" className="me-2" />
                    Annuler
                  </Button>
                )}
                
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
                    Détails du projet
                  </h1>
                  <p className="mb-0 text-muted small">
                    {project.name}
                  </p>
                </div>
              </div>

              <div className="d-flex gap-1 flex-wrap">
                <Button 
                  variant="outline-primary"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit size="14px" className="me-1" />
                  Modifier
                </Button>
                
                {canPerformAction('start') && (
                  <Button 
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleStatusAction('start')}
                  >
                    <Play size="14px" />
                  </Button>
                )}
                
                {canPerformAction('complete') && (
                  <Button 
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleStatusAction('complete')}
                  >
                    <Square size="14px" />
                  </Button>
                )}
                
                {canPerformAction('hold') && (
                  <Button 
                    variant="outline-warning"
                    size="sm"
                    onClick={() => handleStatusAction('hold')}
                  >
                    <Pause size="14px" />
                  </Button>
                )}
                
                <Button 
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDelete}
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
              {/* Icône du projet */}
              <div 
                className="rounded d-flex align-items-center justify-content-center mx-auto mb-3 d-lg-none"
                style={{ 
                  backgroundColor: projectColor,
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                <BarChart2 size="40px" />
              </div>
              <div 
                className="rounded d-flex align-items-center justify-content-center mx-auto mb-3 d-none d-lg-flex"
                style={{ 
                  backgroundColor: projectColor,
                  width: '120px',
                  height: '120px',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                <BarChart2 size="60px" />
              </div>

              {/* Nom et statut */}
              <h3 className="mb-2 fs-5 fs-lg-3">{project.name}</h3>
              
              {/* Badges de statut */}
              <div className="mb-3">
                {getStatusBadge(project.status)}
                <div className="mt-2">
                  {getHealthStatusBadge(project.healthStatus)}
                </div>
              </div>

              {/* Progression */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <small className="fw-bold">Progression</small>
                  <small>{Math.round(project.progressPercentage)}%</small>
                </div>
                <ProgressBar 
                  variant={progressVariant}
                  now={project.progressPercentage}
                  style={{ height: '10px' }}
                />
                <small className="text-muted mt-1 d-block">
                  {project.completedTasks}/{project.totalTasks} tâches terminées
                </small>
              </div>

              {/* Message de santé */}
              {project.healthMessage && (
                <Alert variant={project.healthStatus === 'CRITICAL' ? 'danger' : 'warning'} className="p-2">
                  <small>{project.healthMessage}</small>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Informations détaillées */}
        <Col lg={8} md={12}>
          <Tabs defaultActiveKey="info" className="mb-3 nav-fill">
            {/* Onglet Informations */}
            <Tab eventKey="info" title={
              <span>
                <BarChart2 size="14px" className="me-1 d-none d-sm-inline" />
                Informations
              </span>
            }>
              <Row>
                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <BarChart2 size="16px" className="me-2" />
                        Détails du projet
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Nom:</strong>
                        <p className="mb-0">{project.name}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Description:</strong>
                        <p className="mb-0">{project.description}</p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Statut:</strong>
                        <div className="mt-1">{getStatusBadge(project.status)}</div>
                      </div>
                      <div className="mb-0">
                        <strong className="small">État de santé:</strong>
                        <div className="mt-1">{getHealthStatusBadge(project.healthStatus)}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <User size="16px" className="me-2" />
                        Intervenants
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Client:</strong>
                        <p className="mb-0">{project.clientName}</p>
                        {project.clientCompanyName && (
                          <small className="text-muted">{project.clientCompanyName}</small>
                        )}
                      </div>
                      <div className="mb-3">
                        <strong className="small">Topographe:</strong>
                        <p className="mb-0">{project.topographeName}</p>
                        <small className="text-muted">{project.topographeLicenseNumber}</small>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Techniciens assignés:</strong>
                        <p className="mb-0">{project.assignedTechniciensCount} technicien{project.assignedTechniciensCount !== 1 ? 's' : ''}</p>
                        {project.assignedTechniciensNames && (
                          <small className="text-muted">{project.assignedTechniciensNames}</small>
                        )}
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
                        <Calendar size="16px" className="me-2" />
                        Planning
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Date de début:</strong>
                        <p className="mb-0 small">
                          <Calendar size="12px" className="me-1" />
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Date de fin:</strong>
                        <p className="mb-0 small">
                          <Calendar size="12px" className="me-1" />
                          {formatDate(project.endDate)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Durée totale:</strong>
                        <p className="mb-0">{project.totalDuration} jour{project.totalDuration !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Temps restant:</strong>
                        <p className="mb-0">
                          {project.daysRemaining > 0 ? (
                            <span className={project.isOverdue ? 'text-danger' : 'text-info'}>
                              <Clock size="12px" className="me-1" />
                              {project.isOverdue ? `En retard de ${Math.abs(project.daysRemaining)}` : project.daysRemaining} jour{Math.abs(project.daysRemaining) !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-success">
                              <CheckCircle size="12px" className="me-1" />
                              Terminé
                            </span>
                          )}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="h-100">
                    <Card.Header>
                      <h5 className="mb-0 fs-6 fs-md-5">
                        <CheckCircle size="16px" className="me-2" />
                        Progression
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong className="small">Progression des tâches:</strong>
                        <div className="mt-2">
                          <div className="d-flex justify-content-between mb-1">
                            <small>Progression globale</small>
                            <small>{Math.round(project.progressPercentage)}%</small>
                          </div>
                          <ProgressBar 
                            variant={progressVariant}
                            now={project.progressPercentage}
                            style={{ height: '8px' }}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong className="small">Progression temporelle:</strong>
                        <div className="mt-2">
                          <div className="d-flex justify-content-between mb-1">
                            <small>Temps écoulé</small>
                            <small>{Math.round(project.timeProgressPercentage)}%</small>
                          </div>
                          <ProgressBar 
                            variant="info"
                            now={project.timeProgressPercentage}
                            style={{ height: '8px' }}
                          />
                        </div>
                      </div>
                      <div className="mb-0">
                        <strong className="small">Progression pondérée:</strong>
                        <p className="mb-0">{Math.round(project.weightedProgressPercentage)}%</p>
                        <small className="text-muted">Basée sur l'importance des tâches</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            {/* Onglet Tâches */}
            <Tab eventKey="tasks" title={
              <span>
                <CheckCircle size="14px" className="me-1 d-none d-sm-inline" />
                Tâches
              </span>
            }>
              <Row>
                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <div className="mb-3">
                        <div 
                          className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: '#6c757d',
                            width: '60px',
                            height: '60px',
                            color: 'white'
                          }}
                        >
                          <CheckCircle size="24px" />
                        </div>
                      </div>
                      <h2 className="mb-2 fs-4">{project.totalTasks}</h2>
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
                      <div className="mb-3">
                        <div 
                          className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: '#007bff',
                            width: '60px',
                            height: '60px',
                            color: 'white'
                          }}
                        >
                          <Clock size="24px" />
                        </div>
                      </div>
                      <h2 className="mb-2 fs-4">{project.todoTasks}</h2>
                      <h5 className="text-muted fs-6">À faire</h5>
                      <p className="text-muted mb-0 small">
                        Tâches en attente
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <div className="mb-3">
                        <div 
                          className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: '#ffc107',
                            width: '60px',
                            height: '60px',
                            color: 'white'
                          }}
                        >
                          <Users size="24px" />
                        </div>
                      </div>
                      <h2 className="mb-2 fs-4">{project.inProgressTasks}</h2>
                      <h5 className="text-muted fs-6">En cours</h5>
                      <p className="text-muted mb-0 small">
                        Tâches en exécution
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} lg={3} className="mb-4">
                  <Card className="text-center h-100">
                    <Card.Body className="py-4">
                      <div className="mb-3">
                        <div 
                          className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: '#28a745',
                            width: '60px',
                            height: '60px',
                            color: 'white'
                          }}
                        >
                          <CheckCircle size="24px" />
                        </div>
                      </div>
                      <h2 className="mb-2 fs-4">{project.completedTasks}</h2>
                      <h5 className="text-muted fs-6">Terminées</h5>
                      <p className="text-muted mb-0 small">
                        Tâches complétées
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
                      <h5 className="mb-0 fs-6">Répartition des tâches</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="row text-center">
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-secondary fs-5">{project.totalTasks}</h4>
                          <p className="text-muted small mb-0">Total</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-primary fs-5">{project.todoTasks}</h4>
                          <p className="text-muted small mb-0">À faire</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-warning fs-5">{project.inProgressTasks}</h4>
                          <p className="text-muted small mb-0">En cours</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-info fs-5">{project.reviewTasks}</h4>
                          <p className="text-muted small mb-0">En révision</p>
                        </div>
                        <div className="col-6 col-md-2 mb-3 mb-md-0">
                          <h4 className="text-success fs-5">{project.completedTasks}</h4>
                          <p className="text-muted small mb-0">Terminées</p>
                        </div>
                        <div className="col-6 col-md-2">
                          <h4 className="text-success fs-5">
                            {project.totalTasks > 0 ? 
                              Math.round((project.completedTasks / project.totalTasks) * 100) : 0}%
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
      {project && showEditModal && (
        <EditProjectModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          projectId={project.id}
          onSuccess={handleSuccess}
        />
      )}

      {project && showDeleteModal && (
        <ProjectDeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          project={project}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {project && showStatusModal && (
        <ProjectStatusModal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          project={project}
          action={statusAction}
          onSuccess={handleSuccess}
        />
      )}
    </Container>
  );
};

export default ProjectDetailPage;