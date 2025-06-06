import React from 'react';
import { Table, Card, Pagination, Spinner, Alert, Badge } from 'react-bootstrap';
import { User as UserIcon } from 'react-feather';
import TopographeActions from './TopographeActions';
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
    <Badge bg="success">• Actif</Badge>
  ) : (
    <Badge bg="danger">Inactif</Badge>
  );
};

const EmptyState: React.FC = () => (
  <Card.Body className="text-center py-5">
    <UserIcon size="48px" className="text-muted mb-3" />
    <h5>Aucun topographe trouvé</h5>
    <p className="text-muted">Il n'y a pas de topographes à afficher pour le moment.</p>
  </Card.Body>
);

const LoadingState: React.FC = () => (
  <Card.Body className="text-center py-5">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Chargement...</span>
    </Spinner>
    <p className="mt-2">Chargement des topographes...</p>
  </Card.Body>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <Card.Body>
    <Alert variant="danger">
      <Alert.Heading>Erreur</Alert.Heading>
      <p>{error}</p>
      <button className="btn btn-outline-danger" onClick={onRetry}>
        Réessayer
      </button>
    </Alert>
  </Card.Body>
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

  return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
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
  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-white py-4">
          <h4 className="mb-0">Liste des topographes</h4>
        </Card.Header>
        <ErrorState error={error} onRetry={onRetry} />
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Liste des topographes</h4>
        <small className="text-muted">
          {pagination.totalElements} topographe{pagination.totalElements !== 1 ? 's' : ''} au total
        </small>
      </Card.Header>

      {loading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Table responsive className="text-nowrap mb-0">
            <thead className="table-light">
              <tr>
                <th>Nom</th>
                <th>Licence</th>
                <th>Spécialisation</th>
                <th>Ville</th>
                <th>Statut</th>
                <th>Statistiques</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <div className="avatar-md avatar rounded-circle bg-light d-flex align-items-center justify-content-center">
                        <UserIcon size="20px" className="text-muted" />
                      </div>
                      <div className="ms-3 lh-1">
                        <h5 className="mb-1">{user.firstName} {user.lastName}</h5>
                        <p className="mb-0 text-muted">{user.email}</p>
                        <small className="text-muted">{user.phoneNumber}</small>
                      </div>
                    </div>
                  </td>
                  <td className="align-middle">
                    <strong>{user.licenseNumber}</strong>
                    <br />
                    <small className="text-muted">#{user.username}</small>
                  </td>
                  <td className="align-middle">
                    <span className="fw-medium">{user.specialization}</span>
                  </td>
                  <td className="align-middle">
                    {user.cityName}
                  </td>
                  <td className="align-middle">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <small className="badge bg-info">{user.totalClients} clients</small>
                      <small className="badge bg-warning">{user.totalTechniciens} techniciens</small>
                      <small className="badge bg-secondary">{user.totalProjects} projets</small>
                    </div>
                  </td>
                  <td className="align-middle">
                    <TopographeActions 
                      userId={user.id} 
                      username={`${user.firstName} ${user.lastName}`}
                      userEmail={user.email} 
                      onAction={onUserAction} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <PaginationComponent pagination={pagination} onPageChange={onPageChange} />
        </>
      )}
    </Card>
  );
};