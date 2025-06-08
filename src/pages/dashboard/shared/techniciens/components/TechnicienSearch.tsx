// components/TechnicienSearch.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { CheckCircle, MapPin, Search, X, User, Tool, Award } from 'react-feather';
import { SearchFilters } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface TechnicienSearchProps {
    onSearch: (filters: SearchFilters) => void;
    onClear: () => void;
    loading?: boolean;
    onError?: (error: string) => void;
}

interface Topographe {
    id: number;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    isActive: boolean;
}

const TechnicienSearch: React.FC<TechnicienSearchProps> = ({
    onSearch,
    onClear,
    loading = false,
    onError
}) => {
    const { user } = useAuth();
    const [filters, setFilters] = useState<SearchFilters>({
        skillLevel: undefined,
        cityName: '',
        isActive: undefined,
        topographeId: undefined,
        specialties: '',
    });

    // États pour les topographes (admin seulement)
    const [topographes, setTopographes] = useState<Topographe[]>([]);
    const [loadingTopographes, setLoadingTopographes] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    // Charger les topographes si l'utilisateur est admin
    useEffect(() => {
        if (isAdmin && user?.token) {
            fetchTopographes();
        }
    }, [isAdmin, user?.token]);

    const fetchTopographes = async () => {
        if (!user?.token) return;

        try {
            setLoadingTopographes(true);
            
            // Récupérer tous les topographes actifs
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
            
            // Filtrer seulement les topographes actifs
            const activeTopographes = result.data.content.filter((topo: any) => topo.isActive);
            setTopographes(activeTopographes);
            
        } catch (err) {
            console.error('Erreur lors du chargement des topographes:', err);
            onError?.('Impossible de charger la liste des topographes');
        } finally {
            setLoadingTopographes(false);
        }
    };

    const handleInputChange = (field: keyof SearchFilters, value: string | boolean | number | undefined) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Nettoyer les filtres vides
            const cleanFilters: SearchFilters = {};
            
            if (filters.skillLevel) {
                cleanFilters.skillLevel = filters.skillLevel;
            }
            
            if (filters.cityName?.trim()) {
                cleanFilters.cityName = filters.cityName.trim();
            }
            
            if (filters.isActive !== undefined) {
                cleanFilters.isActive = filters.isActive;
            }
            
            // Le filtre topographeId n'est utilisé que pour les admins
            if (filters.topographeId && isAdmin) {
                cleanFilters.topographeId = filters.topographeId;
            }
            
            if (filters.specialties?.trim()) {
                cleanFilters.specialties = filters.specialties.trim();
            }

            console.log('Filters being sent:', cleanFilters);
            onSearch(cleanFilters);
        } catch (error) {
            onError?.('Erreur lors de la recherche');
        }
    };

    const handleClear = () => {
        setFilters({
            skillLevel: undefined,
            cityName: '',
            isActive: undefined,
            topographeId: undefined,
            specialties: '',
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
                    Rechercher des techniciens
                </h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        {/* Niveau de compétence */}
                        <Col md={isAdmin ? 2 : 3} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <Award size="14px" style={{ marginRight: '0.5rem' }} />
                                    Niveau
                                </Form.Label>
                                <Form.Select
                                    value={filters.skillLevel || ''}
                                    onChange={(e) => handleInputChange('skillLevel', e.target.value as any)}
                                    disabled={loading}
                                >
                                    <option value="">Tous les niveaux</option>
                                    <option value="JUNIOR">Junior</option>
                                    <option value="SENIOR">Senior</option>
                                    <option value="EXPERT">Expert</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        
                        {/* Ville */}
                        <Col md={isAdmin ? 2 : 3} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <MapPin size="14px" style={{ marginRight: '0.5rem' }} />
                                    Ville
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ex: Casablanca, Rabat..."
                                    value={filters.cityName || ''}
                                    onChange={(e) => handleInputChange('cityName', e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        
                        {/* Statut */}
                        <Col md={isAdmin ? 2 : 3} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <CheckCircle size="14px" style={{ marginRight: '0.5rem' }} />
                                    Statut
                                </Form.Label>
                                <Form.Select
                                    value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleInputChange('isActive', value === '' ? undefined : value === 'true');
                                    }}
                                    disabled={loading}
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="true">Actif</option>
                                    <option value="false">Inactif</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Spécialités */}
                        <Col md={isAdmin ? 2 : 3} sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <Tool size="14px" style={{ marginRight: '0.5rem' }} />
                                    Spécialités
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ex: Topographie, BTP..."
                                    value={filters.specialties || ''}
                                    onChange={(e) => handleInputChange('specialties', e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        
                        {/* Champ Topographe visible seulement pour les admins */}
                        {isAdmin && (
                            <Col md={2} sm={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <User size="14px" style={{ marginRight: '0.5rem' }} />
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
                        
                        {/* Boutons d'action - toujours en dernier */}
                        <Col md={2} sm={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>&nbsp;</Form.Label>
                                <div className="d-flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={loading || loadingTopographes}
                                        className="flex-grow-1"
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

export default TechnicienSearch;