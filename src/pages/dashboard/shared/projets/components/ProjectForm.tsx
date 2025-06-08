import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { ProjectCreateRequest } from '../types';
import { useProjectForm } from '../hooks/useProjectForm';

interface ProjectFormProps {
  onSuccess?: (project: any) => void;
  onCancel?: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onCancel }) => {
  const { 
    loading, 
    error, 
    success, 
    clients,
    topographes,
    loadingClients,
    loadingTopographes,
    currentUserRole,
    createProject, 
    fetchClients,
    fetchTopographes,
    resetForm 
  } = useProjectForm();

  const [formData, setFormData] = useState<ProjectCreateRequest>({
    name: '',
    description: '',
    clientId: 0,
    topographeId: 0,
    startDate: '',
    endDate: '',
    status: 'PLANNING',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClients();
    // Charger les topographes seulement si l'utilisateur est admin
    if (currentUserRole === 'ADMIN') {
      fetchTopographes();
    }
  }, [fetchClients, fetchTopographes, currentUserRole]);

  useEffect(() => {
    if (success && onSuccess) {
      onSuccess(formData);
    }
  }, [success, onSuccess, formData]);

  const handleInputChange = (field: keyof ProjectCreateRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du projet est obligatoire';
    } else if (formData.name.length < 3) {
      errors.name = 'Le nom du projet doit contenir au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est obligatoire';
    }

    if (!formData.clientId || formData.clientId === 0) {
      errors.clientId = 'Le client est obligatoire';
    }

    // Validation du topographe seulement pour les admins
    if (currentUserRole === 'ADMIN' && (!formData.topographeId || formData.topographeId === 0)) {
      errors.topographeId = 'Le topographe est obligatoire';
    }

    if (!formData.startDate) {
      errors.startDate = 'La date de début est obligatoire';
    }

    if (!formData.endDate) {
      errors.endDate = 'La date de fin est obligatoire';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'La date de fin doit être postérieure à la date de début';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await createProject(formData);
    if (success) {
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        clientId: 0,
        topographeId: 0,
        startDate: '',
        endDate: '',
        status: 'PLANNING',
      });
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      clientId: 0,
      topographeId: 0,
      startDate: '',
      endDate: '',
      status: 'PLANNING',
    });
    setValidationErrors({});
    resetForm();
  };

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
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          <Alert.Heading>Succès</Alert.Heading>
          <p>Le projet a été créé avec succès !</p>
        </Alert>
      )}

      {/* Information sur l'affectation automatique pour les topographes */}
      {currentUserRole === 'TOPOGRAPHE' && (
        <Alert variant="info" className="mb-4">
          <Alert.Heading>Information</Alert.Heading>
          <p>En tant que topographe, le projet sera automatiquement affecté à votre compte.</p>
        </Alert>
      )}

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du projet <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Levé topographique terrain X"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              isInvalid={!!validationErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Décrivez le projet en détail..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              isInvalid={!!validationErrors.description}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.description}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={currentUserRole === 'ADMIN' ? 6 : 12}>
          <Form.Group className="mb-3">
            <Form.Label>Client <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', parseInt(e.target.value))}
              isInvalid={!!validationErrors.clientId}
              disabled={loadingClients}
            >
              <option value={0}>
                {loadingClients ? 'Chargement...' : 'Sélectionnez un client'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                  {client.companyName && ` (${client.companyName})`}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.clientId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        {/* Champ topographe visible seulement pour les admins */}
        {currentUserRole === 'ADMIN' && (
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Topographe responsable <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.topographeId}
                onChange={(e) => handleInputChange('topographeId', parseInt(e.target.value))}
                isInvalid={!!validationErrors.topographeId}
                disabled={loadingTopographes}
              >
                <option value={0}>
                  {loadingTopographes ? 'Chargement...' : 'Sélectionnez un topographe'}
                </option>
                {topographes.map((topographe) => (
                  <option key={topographe.id} value={topographe.id}>
                    {topographe.firstName} {topographe.lastName} ({topographe.licenseNumber})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.topographeId}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Date de début <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              isInvalid={!!validationErrors.startDate}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.startDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Date de fin <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              isInvalid={!!validationErrors.endDate}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.endDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Statut initial</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as any)}
            >
              <option value="PLANNING">{getStatusLabel('PLANNING')}</option>
              <option value="IN_PROGRESS">{getStatusLabel('IN_PROGRESS')}</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Le projet peut être créé en planification ou directement en cours
            </Form.Text>
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
              <Spinner size="sm" className="me-2" />
              Création en cours...
            </>
          ) : (
            'Créer le projet'
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="outline-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Réinitialiser
        </Button>

        {onCancel && (
          <Button 
            type="button" 
            variant="outline-danger"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
        )}
      </div>
    </Form>
  );
};