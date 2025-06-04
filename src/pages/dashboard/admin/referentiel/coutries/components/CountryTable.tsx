import React from 'react';
import { Table, Card, Spinner, Alert, Pagination } from 'react-bootstrap';

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface CountryTableProps {
  countries: Country[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCountryAction?: (action: string, countryId: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const CountryTable: React.FC<CountryTableProps> = ({
  countries,
  pagination,
  loading,
  error,
  onRetry,
  onCountryAction,
  onPageChange,
  onPageSizeChange,
}) => {
  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-white py-4">
          <h4 className="mb-0">Liste des pays</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={onRetry}>
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
        <h4 className="mb-0">Liste des pays</h4>
        <small className="text-muted">
          {pagination.totalElements} pays au total
        </small>
        <div>
          <select
            value={pagination.pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="form-select form-select-sm"
            style={{ width: 100, display: 'inline-block' }}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </Card.Header>
      {loading ? (
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des pays...</p>
        </Card.Body>
      ) : countries.length === 0 ? (
        <Card.Body className="text-center py-5">
          <h5>Aucun pays trouvé</h5>
          <p className="text-muted">Il n'y a pas de pays à afficher pour le moment.</p>
        </Card.Body>
      ) : (
        <>
          <Table responsive className="text-nowrap mb-0">
            <thead className="table-light">
              <tr>
                <th>Nom</th>
                <th>Code</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id}>
                  <td className="align-middle">{country.name}</td>
                  <td className="align-middle">{country.code}</td>
                  <td className="align-middle">
                    {onCountryAction && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => onCountryAction('edit', country.id)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onCountryAction('delete', country.id)}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
              disabled={pagination.pageNumber === 0}
              onClick={() => onPageChange(pagination.pageNumber - 1)}
            />
            {[...Array(pagination.totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx}
                active={idx === pagination.pageNumber}
                onClick={() => onPageChange(idx)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={pagination.pageNumber === pagination.totalPages - 1}
              onClick={() => onPageChange(pagination.pageNumber + 1)}
            />
          </Pagination>
        </>
      )}
    </Card>
  );
};

export { CountryTable };
