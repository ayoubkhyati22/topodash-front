import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Search, X, BarChart2, User, Calendar, CheckCircle } from 'react-feather';
import { SearchFilters } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface ProjectSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  onError?: (error: string) => void;
}

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  isActive: boolean;
}

interface Topographe {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  isActive: boolean;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({
  onSearch,
  onClear,
  loading = false,
  onError
}) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    status: undefined,
    clientId: undefined,
    topographeId: undefined,
    startDate: '',
    endDate: '',
    name: '',
  });

  // États pour les listes déroulantes
  const [clients, setClients] = useState<Client[]>([]);
  const [topographes, setTopographes] = useState<Topographe[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingTopographes, setLoadingTopographes] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Charger les clients et topographes
  useEffect(() => {
    if (user?.token) {
      fetchClients();
      if (isAdmin) {
        fetchTopographes();
      }
    }
  }, [user?.token, isAdmin]);

  const fetchClients = async () => {
    if (!user?.token) return;

    try {
      setLoadingClients(true);
      
      const response = await fetch('http://localhost:8080/api/client?page=0&size=1000&sortBy=firstName&sortDir=asc', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      const activeClients = result.data.content.filter((client: any) => client.isActive);
      setClients(activeClients);
      
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      onError?.('Impossible de charger la liste des clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchTopographes = async () => {
    if (!user?.token) return;

    try {
      setLoadingTopographes(true);
      
      const response = await fetch('http://localhost:8080/api/topographe?page=0&size=1000&sortBy=firstName&sortDir=asc', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      const activeTopographes = result.data.content.filter((topo: any) => topo.isActive);
      setTopographes(activeTopographes);
      
    } catch (err) {
      console.error('Erreur lors du chargement des topographes:', err);
      onError?.('Impossible de charger la liste des topographes');
    } finally {
      setLoadingTopographes(false);
    }
  };

  const handleInputChange = (field: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cleanFilters: SearchFilters = {};
      
      if (filters.status) {
        cleanFilters.status = filters.status;
      }
      
      if (filters.clientId) {
        cleanFilters.clientId = filters.clientId;
      }
      
      if (filters.topographeId && isAdmin) {
        cleanFilters.topographeId = filters.topographeId;
      }
      
      if (filters.startDate?.trim()) {
        cleanFilters.startDate = filters.startDate.trim();
      }
      
      if (filters.endDate?.trim()) {
        cleanFilters.endDate = filters.endDate.trim();
      }
      
      if (filters.name?.trim()) {
        cleanFilters.name = filters.name.trim();
      }

      console.log('Filters being sent:', cleanFilters);
      onSearch(cleanFilters);
    } catch (error) {
      onError?.('Erreur lors de la recherche');
    }
  };

  const handleClear = () => {
    setFilters({
      status: undefined,
      clientId: undefined,
      topographeId: undefined,
      startDate: '',
      endDate: '',
      name: '',
    });
    onClear();
  };

  const hasFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && value !== null
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'Planification';
      case 'IN_PROGRESS': return 'En cours';
      case 'ON_HOLD': return 'En attente';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="bg-white py-4">
        <h5 className="mb-0">
          <Search size="18px" className="me-2" />
          Rechercher des projets
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Nom du projet */}
            <Col md={isAdmin ? 3 : 4} sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <BarChart2 size="14px" className="me-2" />
                  Nom du projet
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Levé topographique..."
                  value={filters.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            
            {/* Statut */}
            <Col md={isAdmin ? 2 : 3} sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <CheckCircle size="14px" className="me-2" />
                  Statut
                </Form.Label>
                <Form.Select
                  value={filters.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  disabled={loading}
                >
                  <option value="">Tous les statuts</option>
                  <option value="PLANNING">{getStatusLabel('PLANNING')}</option>
                  <option value="IN_PROGRESS">{getStatusLabel('IN_PROGRESS')}</option>
                  <option value="ON_HOLD">{getStatusLabel('ON_HOLD')}</option>
                  <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                  <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            {/* Client */}
            <Col md={isAdmin ? 2 : 3} sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <User size="14px" className="me-2" />
                  Client
                </Form.Label>
                <Form.Select
                  value={filters.clientId || ''}
                  onChange={(e) => handleInputChange('clientId', e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={loading || loadingClients}
                >
                  <option value="">
                    {loadingClients ? 'Chargement...' : 'Tous les clients'}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                      {client.companyName && ` (${client.companyName})`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Topographe (admin seulement) */}
            {isAdmin && (
              <Col md={2} sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <User size="14px" className="me-2" />
                    Topographe
                  </Form.Label>
                  <Form.Select
                    value={filters.topographeId || ''}
                    onChange={(e) => handleInputChange('topographeId', e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={loading || loadingTopographes}
                  >
                    <option value="">
                      {loadingTopographes ? 'Chargement...' : 'Tous les topographes'}
                    </option>
                    {topographes.map((topographe) => (
                      <option key={topographe.id} value={topographe.id}>
                        {topographe.firstName} {topographe.lastName} ({topographe.licenseNumber})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            
            {/* Date de début */}
            <Col md={isAdmin ? 2 : 3} sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <Calendar size="14px" className="me-2" />
                  Date de début
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            
            {/* Date de fin */}
            <Col md={isAdmin ? 2 : 3} sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <Calendar size="14px" className="me-2" />
                  Date de fin
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            
            {/* Boutons d'action */}
            <Col md={1} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label>&nbsp;</Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || loadingClients || loadingTopographes}
                    className="flex-grow-1"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
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
                      title="Effacer les filtres"
                    >
                      <X size="16px" />
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProjectSearch;