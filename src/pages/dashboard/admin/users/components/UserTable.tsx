// components/UserTable.tsx
import React from 'react';
import { Table, Card, Pagination, Spinner, Alert } from 'react-bootstrap';
import { User as UserIcon } from 'react-feather';
import UserActions from './UserActions';

interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface UserTableProps {
  users: User[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onUserAction?: (action: string, userId: number) => void;
}

const getRoleBadgeClass = (role: string): string => {
  const roleClasses = {
    ADMIN: 'badge bg-danger',
    USER: 'badge bg-primary',
  };
  return roleClasses[role as keyof typeof roleClasses] || 'badge bg-secondary';
};

const EmptyState: React.FC = () => (
  <Card.Body className="text-center py-5">
    <UserIcon size="48px" className="text-muted mb-3" />
    <h5>Aucun utilisateur trouvé</h5>
    <p className="text-muted">Il n'y a pas d'utilisateurs à afficher pour le moment.</p>
  </Card.Body>
);

const LoadingState: React.FC = () => (
  <Card.Body className="text-center py-5">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Chargement...</span>
    </Spinner>
    <p className="mt-2">Chargement des utilisateurs...</p>
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

export const UserTable: React.FC<UserTableProps> = ({
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
          <h4 className="mb-0">Liste des utilisateurs</h4>
        </Card.Header>
        <ErrorState error={error} onRetry={onRetry} />
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Liste des utilisateurs</h4>
        <small className="text-muted">
          {pagination.totalElements} utilisateur{pagination.totalElements !== 1 ? 's' : ''} au total
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
                <th>Nom d'utilisateur</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th></th>
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
                        <h5 className="mb-1">{user.username}</h5>
                        <p className="mb-0 text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="align-middle">
                    <code className="text-dark">{user.username}</code>
                  </td>
                  <td className="align-middle">
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="align-middle">{user.phoneNumber}</td>
                  <td className="align-middle">
                    <UserActions userId={user.id} onAction={onUserAction} />
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