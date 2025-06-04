import React, { useEffect } from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { useCountries } from './hooks/useCountries';
import { CountryTable } from './components/CountryTable';

const Country: React.FC = () => {
  const {
    countries,
    pagination,
    loading,
    error,
    fetchCountries,
    handlePageChange,
    handlePageSizeChange,
  } = useCountries();

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleCountryAction = (action: string, countryId: number) => {
    // Implement edit/delete logic here
    console.log(`Action ${action} for country ${countryId}`);
  };

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">Gestion des pays</h1>
              <p className="mb-0">
                Gestion de tous les pays ({pagination.totalElements} pays)
              </p>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <CountryTable
            countries={countries}
            pagination={pagination}
            loading={loading}
            error={error}
            onRetry={fetchCountries}
            onCountryAction={handleCountryAction}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Country;
