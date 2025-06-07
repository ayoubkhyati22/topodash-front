import React from 'react';
import { Table, Card, Pagination, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { User as UserIcon, Users, Briefcase, User, CheckCircle, BarChart2, MoreHorizontal, BookOpen, Award, MapPin } from 'react-feather';
import TopographeActions from './TopographeActions';
import TopographeMobileCard from './TopographeMobileCard';
import { Topographe } from '../types';

interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface TopographeTableProps {
  users: Topographe[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onUserAction?: (action: string, userId: number) => void;
}

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

// Composant pour afficher la spécialisation avec tooltip
const SpecializationCell: React.FC<{ specialization: string; userId: number }> = ({
  specialization,
  userId
}) => {
  const isLong = specialization.length > 50;

  if (isLong) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-specialization-${userId}`}>
            {specialization}
          </Tooltip>
        }
      >
        <span style={{
          fontWeight: '500',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4',
          cursor: 'help'
        }}>
          {specialization}
        </span>
      </OverlayTrigger>
    );
  }

  return (
    <span style={{
      fontWeight: '500',
      lineHeight: '1.4'
    }}>
      {specialization}
    </span>
  );
};

// Nouveau composant pour les statistiques sur deux lignes
const StatisticsCell: React.FC<{ user: Topographe }> = ({ user }) => {
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
      minWidth: '180px',
      width: '100%'
    }}>
      {/* Première ligne : Clients et Projets */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          ...badgeStyle,
          backgroundColor: '#17a2b8',
          color: 'white'
        }}>
          <User size="12px" />
          {user.totalClients} clients
        </span>
        <span style={{
          ...badgeStyle,
          backgroundColor: '#6c757d',
          color: 'white'
        }}>
          <Briefcase size="12px" />
          {user.totalProjects} projets
        </span>
      </div>
      
      {/* Deuxième ligne : Techniciens */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <span style={{
          ...badgeStyle,
          backgroundColor: '#ffc107',
          color: '#212529'
        }}>
          <Users size="12px" />
          {user.totalTechniciens} techniciens
        </span>
      </div>
    </div>
  );
};

// Composant Card pour mobile - maintenant importé
// const TopographeMobileCard est maintenant dans un fichier séparé

const EmptyState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
    <UserIcon size="48px" style={{ color: '#6c757d', marginBottom: '1rem' }} />
    <h5>Aucun topographe trouvé</h5>
    <p style={{ color: '#6c757d' }}>Il n'y a pas de topographes à afficher pour le moment.</p>
  </div>
);

const LoadingState: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Chargement...</span>
    </Spinner>
    <p style={{ marginTop: '1rem' }}>Chargement des topographes...</p>
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

export const TopographeTable: React.FC<TopographeTableProps> = ({
  users,
  pagination,
  loading,
  error,
  onPageChange,
  onRetry,
  onUserAction
}) => {
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
          <h4 style={{ marginBottom: 0 }}>Liste des topographes</h4>
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
        <h4 style={{ marginBottom: 0 }}>Liste des topographes</h4>
        <small style={{ color: '#6c757d' }}>
          {pagination.totalElements} topographe{pagination.totalElements !== 1 ? 's' : ''} au total
        </small>
      </Card.Header>

      {loading ? (
        <Card.Body>
          <LoadingState />
        </Card.Body>
      ) : users.length === 0 ? (
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
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '8%' }} />
                </colgroup>
                <thead className="table-light">
                  <tr>
                    <th><User size="14px" style={{ marginRight: '0.5rem' }} />Nom</th>
                    <th><Award size="14px" style={{ marginRight: '0.5rem' }} />Licence</th>
                    <th><BookOpen size="14px" style={{ marginRight: '0.5rem' }} />Spécialisation</th>
                    <th><MapPin size="14px" style={{ marginRight: '0.5rem' }} />Ville</th>
                    <th><CheckCircle size="14px" style={{ marginRight: '0.5rem' }} />Statut</th>
                    <th><BarChart2 size="14px" style={{ marginRight: '0.5rem' }} />Statistiques</th>
                    <th><MoreHorizontal size="14px" style={{ marginRight: '0.5rem' }} />Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            backgroundColor: getAvatarColor(`${user.firstName} ${user.lastName}`),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.75rem',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {getInitials(`${user.firstName} ${user.lastName}`)}
                          </div>
                          <div>
                            <h5 style={{ marginBottom: '0.25rem' }}>{user.firstName} {user.lastName}</h5>
                            <p style={{ marginBottom: 0, color: '#6c757d' }}>{user.email}</p>
                            <small style={{ color: '#6c757d' }}>{user.phoneNumber}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <strong>{user.licenseNumber}</strong>
                        <br />
                        <small style={{ color: '#6c757d' }}>#{user.username}</small>
                      </td>
                      <td style={{
                        fontWeight: '300',
                        verticalAlign: 'middle',
                        maxWidth: '200px',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        padding: '0.75rem 0.5rem'
                      }}>
                        <SpecializationCell
                          specialization={user.specialization}
                          userId={user.id}
                        />
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {user.cityName}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <StatisticsCell user={user} />
                      </td>
                      <td style={{ verticalAlign: 'middle', position: 'relative' }}>
                        <TopographeActions
                          userId={user.id}
                          username={`${user.firstName} ${user.lastName}`}
                          userEmail={user.email}
                          isActive={user.isActive}
                          onAction={onUserAction}
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
              {users.map((user) => (
                <TopographeMobileCard
                  key={user.id}
                  user={user}
                  onUserAction={onUserAction}
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