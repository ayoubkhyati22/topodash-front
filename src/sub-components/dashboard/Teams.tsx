import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Table, Dropdown, Spinner, Alert, Pagination } from "react-bootstrap";
import { MoreVertical, User as UserIcon } from "react-feather";
import { useAuth } from "AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface ApiResponse {
  message: string;
  data: {
    content: User[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  };
  status: number;
}

interface TeamsProps {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Teams = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  // API configuration
  const API_BASE_URL = 'http://localhost:8080';
  const { user } = useAuth();
  const AUTH_TOKEN = user?.token;

  const fetchUsers = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/users/page/${page}/size/${pageSize}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 200) {
        setUsers(result.data.content);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setCurrentPage(result.data.pageNumber);
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
    }
  };

  const CustomToggle = React.forwardRef<HTMLAnchorElement, TeamsProps>(
    ({ children, onClick }, ref) => (
      <Link
        to=""
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        className="text-muted text-primary-hover"
      >
        {children}
      </Link>
    )
  );

  CustomToggle.displayName = "CustomToggle";

  const ActionMenu = ({ userId }: { userId: number }) => {
    const handleAction = (action: string) => {
      console.log(`Action ${action} for user ${userId}`);
      // Add your action handlers here
    };

    return (
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle}>
          <MoreVertical size="15px" className="text-muted" />
        </Dropdown.Toggle>
        <Dropdown.Menu align={"end"}>
          <Dropdown.Item onClick={() => handleAction('view')}>
            Voir
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAction('edit')}>
            Modifier
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAction('delete')}>
            Supprimer
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 0}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page + 1}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages - 1}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );

    return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge bg-danger';
      case 'USER':
        return 'badge bg-primary';
      default:
        return 'badge bg-secondary';
    }
  };

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-white py-4">
          <h4 className="mb-0">Liste des utilisateurs</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
            <button 
              className="btn btn-outline-danger"
              onClick={() => fetchUsers(currentPage)}
            >
              Réessayer
            </button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Liste des utilisateurs</h4>
        <small className="text-muted">
          {totalElements} utilisateur{totalElements !== 1 ? 's' : ''} au total
        </small>
      </Card.Header>
      
      {loading ? (
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des utilisateurs...</p>
        </Card.Body>
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
                    <ActionMenu userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {users.length === 0 && (
            <Card.Body className="text-center py-5">
              <UserIcon size="48px" className="text-muted mb-3" />
              <h5>Aucun utilisateur trouvé</h5>
              <p className="text-muted">Il n'y a pas d'utilisateurs à afficher pour le moment.</p>
            </Card.Body>
          )}
          
          {renderPagination()}
        </>
      )}
    </Card>
  );
};

export default Teams;