import React, { useState } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Search, X } from 'react-feather';
import { SearchFilters } from '../types';

interface TopographeSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

const TopographeSearch: React.FC<TopographeSearchProps> = ({ 
  onSearch, 
  onClear, 
  loading = false 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    specialization: '',
    cityName: '',
    isActive: undefined,
  });

  const handleInputChange = (field: keyof SearchFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nettoyer les filtres vides
    const cleanFilters: SearchFilters = {};
    if (filters.specialization?.trim()) {
      cleanFilters.specialization = filters.specialization.trim();
    }
    if (filters.cityName?.trim()) {
      cleanFilters.cityName = filters.cityName.trim();
    }
    if (filters.isActive !== undefined) {
      cleanFilters.isActive = filters.isActive;
    }
    
    onSearch(cleanFilters);
  };

  const handleClear = () => {
    setFilters({
      specialization: '',
      cityName: '',
      isActive: undefined,
    });
    onClear();
  };

  const hasFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <Card className="mb-4">
      <Card.Header className="bg-white py-4">
        <h5 className="mb-0">
          <Search size="18px" className="me-2" />
          Rechercher des topographes
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Spécialisation</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Génie Civil, SIG..."
                  value={filters.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Ville</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Casablanca, Rabat..."
                  value={filters.cityName || ''}
                  onChange={(e) => handleInputChange('cityName', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('isActive', value === '' ? undefined : value === 'true');
                  }}
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex gap-2">
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Recherche...
                </>
              ) : (
                <>
                  <Search size="16px" className="me-2" />
                  Rechercher
                </>
              )}
            </Button>
            
            {hasFilters && (
              <Button 
                type="button" 
                variant="outline-secondary"
                onClick={handleClear}
                disabled={loading}
              >
                <X size="16px" className="me-2" />
                Effacer
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TopographeSearch;