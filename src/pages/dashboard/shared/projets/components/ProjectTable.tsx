import React from 'react';
import { Table, Card, Pagination, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { Calendar, User, BarChart2, MoreHorizontal, CheckCircle, Clock } from 'react-feather';
import ProjectActions from './ProjectActions';
import ProjectMobileCard from './ProjectMobileCard';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../../AuthContext';

interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface ProjectTableProps {
  projects: Project[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onProjectAction?: (action: string, projectId: number) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PLANNING: { bg: '#6c757d', text: 'Planification' },
    IN_PROGRESS: { bg: '#007bff', text: 'En cours' },
    ON_HOLD: { bg: '#ffc107', text: 'En attente' },
    COMPLETED: { bg: '#28a745', text: 'Terminé' },
    CANCELLED: { bg: '#dc3545', text: 'Annulé' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNING;

  return (
    <Badge style={{ backgroundColor: config.bg, color: 'white' }}>
      {config.text}
    </Badge>
  );
};

const getHealthStatusBadge = (healthStatus: string) => {
  const healthConfig = {
    GOOD: { bg: '#28a745', text: '✓ Bon' },
    WARNING: { bg: '#ffc107', text: '⚠ Attention' },
    CRITICAL: { bg: '#dc3545', text: '⚠ Critique' }
  };

  const config = healthConfig[healthStatus as keyof typeof healthConfig] || healthConfig.GOOD;

  return (
    <small style={{
      backgroundColor: config.bg,
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem'
    }}>
      {config.text}
    </small>
  );
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const ProgressCell: React.FC<{ project: Project }> = ({ project }) => {
  const progressVariant = project.progressPercentage >= 75 ? 'success' :
                         project.progressPercentage >= 50 ? 'info' :
                         project.progressPercentage >= 25 ? 'warning' : 'danger';

  return (
    <div style={{ minWidth: '150px' }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="fw-bold">Progression</small>
        <small>{Math.round(project.progressPercentage)}%</small>
      </div>
      <ProgressBar 
        variant={progressVariant}
        now={project.progressPercentage}
        style={{ height: '6px' }}
      />
      <div className="d-flex justify-content-between mt-1">
        <small className="text-muted">
          {project.completedTasks}/{project.totalTasks} tâches
        </small>
        {project.isOverdue && (
          <small className="text-danger">
            <Clock size="12px" /> En retard
          </small>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
    <BarChart2 size="48px" style={{ color: '#6c757d', marginBottom: '1rem' }} />
    <h5>Aucun projet trouvé</h5>
    <p style={{ color: '#6c757d' }}>Il n'y a pas de projets à afficher pour le moment.</p>
  </div>
);

const LoadingState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Chargement...</span>
    </Spinner>
    <p style={{ marginTop: '1rem' }}>Chargement des projets...</p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <Alert variant="danger">
    <Alert.Heading>Erreur</Alert.Heading>
    <p>{error}</p>
    <button className="btn btn-outline-danger" onClick={onRetry}>
      Réessayer
    </button>
  </Alert>
);

const PaginationComponent: React.FC<{
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  const { pageNumber: currentPage, totalPages } = pagination;
  const maxVisiblePages = 5;
  const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  const items = [];

  items.push(
    <Pagination.Prev
      key="prev"
      disabled={currentPage === 0}
      onClick={() => onPageChange(currentPage - 1)}
    />
  );

  for (let page = startPage; page <= endPage; page++) {
    items.push(
      <Pagination.Item
        key={page}
        active={page === currentPage}
        onClick={() => onPageChange(page)}
      >
        {page + 1}
      </Pagination.Item>
    );
  }

  items.push(
    <Pagination.Next
      key="next"
      disabled={currentPage === totalPages - 1}
      onClick={() => onPageChange(currentPage + 1)}
    />
  );

  return (
    <div className="d-flex justify-content-center align-items-center gap-2">
      <Pagination style={{ marginBottom: 0 }}>{items}</Pagination>
      <small style={{ color: '#6c757d' }}>
        Page {currentPage + 1} sur {totalPages}
      </small>
    </div>
  );
};

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  pagination,
  loading,
  error,
  onPageChange,
  onRetry,
  onProjectAction
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (error) {
    return (
      <Card>
        <Card.Header className="bg-white">
          <h4 className="mb-0">Liste des projets</h4>
        </Card.Header>
        <Card.Body>
          <ErrorState error={error} onRetry={onRetry} />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Liste des projets</h4>
        <small className="text-muted">
          {pagination.totalElements} projet{pagination.totalElements !== 1 ? 's' : ''} au total
        </small>
      </Card.Header>

      {loading ? (
        <Card.Body>
          <LoadingState />
        </Card.Body>
      ) : projects.length === 0 ? (
        <Card.Body>
          <EmptyState />
        </Card.Body>
      ) : (
        <>
          {/* Vue Desktop */}
          <div className="d-none d-lg-block">
            <Table responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '25%' }}>
                    <BarChart2 size="14px" className="me-2" />
                    Projet
                  </th>
                  <th style={{ width: '15%' }}>
                    <User size="14px" className="me-2" />
                    Client
                  </th>
                  {isAdmin && (
                    <th style={{ width: '12%' }}>
                      <User size="14px" className="me-2" />
                      Topographe
                    </th>
                  )}
                  <th style={{ width: '10%' }}>
                    <CheckCircle size="14px" className="me-2" />
                    Statut
                  </th>
                  <th style={{ width: '15%' }}>
                    <Calendar size="14px" className="me-2" />
                    Dates
                  </th>
                  <th style={{ width: '18%' }}>
                    <BarChart2 size="14px" className="me-2" />
                    Progression
                  </th>
                  <th style={{ width: '10%' }}>
                    <MoreHorizontal size="14px" className="me-2" />
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="align-middle">
                      <div>
                        <h6 className="mb-1">
                          <Link
                            to={`/projects/${project.id}`}
                            className="text-decoration-none"
                            style={{ color: 'inherit' }}
                          >
                            {project.name}
                          </Link>
                        </h6>
                        <p className="mb-0 text-muted small">
                          {project.description.length > 50 
                            ? `${project.description.substring(0, 50)}...`
                            : project.description
                          }
                        </p>
                        <div className="mt-1">
                          {getHealthStatusBadge(project.healthStatus)}
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div>
                        <strong>{project.clientName}</strong>
                        {project.clientCompanyName && (
                          <>
                            <br />
                            <small className="text-muted">{project.clientCompanyName}</small>
                          </>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="align-middle">
                        <div>
                          <strong>{project.topographeName}</strong>
                          <br />
                          <small className="text-muted">{project.topographeLicenseNumber}</small>
                        </div>
                      </td>
                    )}
                    <td className="align-middle">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="align-middle">
                      <div>
                        <small className="text-muted">Début:</small><br />
                        <strong>{formatDate(project.startDate)}</strong><br />
                        <small className="text-muted">Fin:</small><br />
                        <strong>{formatDate(project.endDate)}</strong>
                        {project.daysRemaining > 0 && (
                          <>
                            <br />
                            <small className={project.isOverdue ? 'text-danger' : 'text-info'}>
                              {project.isOverdue ? 'En retard de' : 'Reste'} {Math.abs(project.daysRemaining)} jour{Math.abs(project.daysRemaining) !== 1 ? 's' : ''}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="align-middle">
                      <ProgressCell project={project} />
                    </td>
                    <td className="align-middle">
                      <ProjectActions
                        projectId={project.id}
                        projectName={project.name}
                        projectStatus={project.status}
                        onAction={onProjectAction}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Vue Mobile */}
          <div className="d-lg-none">
            <Card.Body>
              {projects.map((project) => (
                <ProjectMobileCard
                  key={project.id}
                  project={project}
                  onProjectAction={onProjectAction}
                />
              ))}
            </Card.Body>
          </div>

          {/* Pagination */}
          <Card.Footer className="bg-white border-top">
            <PaginationComponent pagination={pagination} onPageChange={onPageChange} />
          </Card.Footer>
        </>
      )}
    </Card>
  );
};