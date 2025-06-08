import React from 'react';
import { Table, Card, Pagination, Spinner, Alert } from 'react-bootstrap';
import { User as UserIcon, MapPin, User, CheckCircle, BarChart2, MoreHorizontal, Tool, Calendar, Award } from 'react-feather';
import TechnicienActions from './TechnicienActions';
import TechnicienMobileCard from './TechnicienMobileCard';
import { Technicien } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../../AuthContext';

interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface TechnicienTableProps {
  techniciens: Technicien[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onTechnicienAction?: (action: string, technicienId: number) => void;
}

const getSkillLevelBadge = (skillLevel: string) => {
  const badges = {
    JUNIOR: { bg: '#17a2b8', text: 'Junior', icon: <Award size="12px" style={{ marginRight: '4px' }} /> },
    SENIOR: { bg: '#28a745', text: 'Senior', icon: <Award size="12px" style={{ marginRight: '4px' }} /> },
    EXPERT: { bg: '#dc3545', text: 'Expert', icon: <Award size="12px" style={{ marginRight: '4px' }} /> }
  };

  const badge = badges[skillLevel as keyof typeof badges] || badges.JUNIOR;

  return (
    <small
      style={{
        backgroundColor: badge.bg,
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {badge.icon}
      {badge.text}
    </small>
  );
};

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <small style={{ backgroundColor: '#28a745', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>• Actif</small>
  ) : (
    <small style={{ backgroundColor: 'red', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>• Inactif</small>
  );
};

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
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Nouveau composant pour les statistiques sur deux lignes
const StatisticsCell: React.FC<{ technicien: Technicien }> = ({ technicien }) => {
  const badgeStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: '500',
    letterSpacing: '0.025em',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      minWidth: '160px',
      width: '100%'
    }}>
      {/* Première ligne : Total des tâches */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          ...badgeStyle,
          backgroundColor: '#6c757d',
          color: 'white'
        }}>
          <Tool size="12px" />
          {technicien.totalTasks} tâches
        </span>
      </div>

      {/* Deuxième ligne : Tâches par statut */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          ...badgeStyle,
          backgroundColor: '#17a2b8',
          color: 'white'
        }}>
          ▶ {technicien.activeTasks} actives
        </span>
        <span style={{
          ...badgeStyle,
          backgroundColor: '#28a745',
          color: 'white'
        }}>
          ✓ {technicien.completedTasks} finis
        </span>
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
    <UserIcon size="48px" style={{ color: '#6c757d', marginBottom: '1rem' }} />
    <h5>Aucun technicien trouvé</h5>
    <p style={{ color: '#6c757d' }}>Il n'y a pas de techniciens à afficher pour le moment.</p>
  </div>
);

const LoadingState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Chargement...</span>
    </Spinner>
    <p style={{ marginTop: '1rem' }}>Chargement des techniciens...</p>
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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  };

  return (
    <div style={containerStyle}>
      <Pagination style={{ marginBottom: 0 }}>{items}</Pagination>
      <small style={{ color: '#6c757d' }}>
        Page {currentPage + 1} sur {totalPages}
      </small>
    </div>
  );
};

export const TechnicienTable: React.FC<TechnicienTableProps> = ({
  techniciens,
  pagination,
  loading,
  error,
  onPageChange,
  onRetry,
  onTechnicienAction
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Styles pour responsive design
  const tableContainerStyle: React.CSSProperties = {
    overflowX: 'auto',
    overflowY: 'visible'
  };

  const tableStyle: React.CSSProperties = {
    marginBottom: 0,
    tableLayout: 'fixed' // Permet un meilleur contrôle des largeurs
  };

  if (error) {
    return (
      <Card style={{ height: '100%' }}>
        <Card.Header style={{ backgroundColor: 'white', padding: '1rem' }}>
          <h4 style={{ marginBottom: 0 }}>Liste des techniciens</h4>
        </Card.Header>
        <Card.Body>
          <ErrorState error={error} onRetry={onRetry} />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card style={{ height: '100%' }}>
      <Card.Header style={{
        backgroundColor: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h4 style={{ marginBottom: 0 }}>Liste des techniciens</h4>
        <small style={{ color: '#6c757d' }}>
          {pagination.totalElements} technicien{pagination.totalElements !== 1 ? 's' : ''} au total
        </small>
      </Card.Header>

      {loading ? (
        <Card.Body>
          <LoadingState />
        </Card.Body>
      ) : techniciens.length === 0 ? (
        <Card.Body>
          <EmptyState />
        </Card.Body>
      ) : (
        <>
          {/* Vue Desktop - Table normale (écrans >= 992px) */}
          <div style={{ display: 'none' }} className="d-lg-block">
            <div style={tableContainerStyle}>
              <Table responsive style={tableStyle}>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead className="table-light">
                  <tr>
                    <th><User size="14px" style={{ marginRight: '0.5rem' }} />Technicien</th>
                    <th><Award size="14px" style={{ marginRight: '0.5rem' }} />Niveau</th>
                    <th>
                      {isAdmin ? (
                        <>
                          <User size="14px" style={{ marginRight: '0.5rem' }} />
                          Topographe
                        </>
                      ) : (
                        <>
                          <Calendar size="14px" style={{ marginRight: '0.5rem' }} />
                          Créé le
                        </>
                      )}
                    </th>
                    <th><MapPin size="14px" style={{ marginRight: '0.5rem' }} />Ville</th>
                    <th><CheckCircle size="14px" style={{ marginRight: '0.5rem' }} />Statut</th>
                    <th><BarChart2 size="14px" style={{ marginRight: '0.5rem' }} />Tâches</th>
                    <th><MoreHorizontal size="14px" style={{ marginRight: '0.5rem' }} />Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {techniciens.map((technicien) => (
                    <tr key={technicien.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            backgroundColor: getAvatarColor(`${technicien.firstName} ${technicien.lastName}`),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.75rem',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {getInitials(`${technicien.firstName} ${technicien.lastName}`)}
                          </div>
                          <div>
                            {/* Nom cliquable qui mène vers les détails */}
                            <h5 style={{ marginBottom: '0.25rem' }}>
                              <Link
                                to={`/techniciens/${technicien.id}`}
                                style={{
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  transition: 'color 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#007bff'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
                              >
                                {technicien.firstName} {technicien.lastName}
                              </Link>
                            </h5>
                            <p style={{ marginBottom: 0, color: '#6c757d' }}>
                              <a
                                href={`mailto:${technicien.email}`}
                                style={{ color: '#6c757d', textDecoration: 'none' }}
                              >
                                {technicien.email}
                              </a>
                            </p>
                            <small style={{ color: '#6c757d' }}>
                              <a
                                href={`tel:${technicien.phoneNumber}`}
                                style={{ color: '#6c757d', textDecoration: 'none' }}
                              >
                                {technicien.phoneNumber}
                              </a>
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {getSkillLevelBadge(technicien.skillLevel)}
                        {technicien.specialties && (
                          <>
                            <br />
                            <small style={{ color: '#6c757d' }}>{technicien.specialties}</small>
                          </>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {isAdmin ? (
                          <div>
                            <strong>{technicien.assignedToTopographeName}</strong>
                            <br />
                            <small style={{ color: '#6c757d', display: 'flex', alignItems: 'center' }}>
                              <Calendar size="12px" style={{ marginRight: '0.25rem' }} />
                              {formatDate(technicien.createdAt)}
                            </small>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                            <Calendar size="14px" style={{ marginRight: '0.5rem' }} />
                            <span style={{ fontSize: '0.875rem' }}>
                              {formatDate(technicien.createdAt)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {technicien.cityName}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {getStatusBadge(technicien.isActive)}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <StatisticsCell technicien={technicien} />
                      </td>
                      <td style={{ verticalAlign: 'middle', position: 'relative' }}>
                        <TechnicienActions
                          technicienId={technicien.id}
                          technicienName={`${technicien.firstName} ${technicien.lastName}`}
                          technicienEmail={technicien.email}
                          isActive={technicien.isActive}
                          onAction={onTechnicienAction}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Vue Mobile/Tablet - Cards (écrans < 992px) */}
          <div style={{ display: 'block' }} className="d-lg-none">
            <Card.Body style={{ padding: '1rem' }}>
              {techniciens.map((technicien) => (
                <TechnicienMobileCard
                  key={technicien.id}
                  technicien={technicien}
                  onTechnicienAction={onTechnicienAction}
                />
              ))}
            </Card.Body>
          </div>

          {/* Pagination commune */}
          <Card.Footer style={{ backgroundColor: 'white', borderTop: '1px solid #dee2e6' }}>
            <PaginationComponent pagination={pagination} onPageChange={onPageChange} />
          </Card.Footer>
        </>
      )}
    </Card>
  );
};