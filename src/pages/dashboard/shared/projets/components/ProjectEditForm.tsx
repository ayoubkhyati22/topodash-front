import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { ProjectUpdateRequest, Project } from '../types';
import { useProjectEdit } from '../hooks/useProjectEdit';

interface ProjectEditFormProps {
  projectId: number;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
}

const ProjectEditForm: React.FC<ProjectEditFormProps> = ({ 
  projectId, 
  onSuccess, 
  onCancel 
}) => {
  const { 
    project,
    loading, 
    error, 
    success, 
    loadingProject,
    fetchProject,
    updateProject, 
    resetForm 
  } = useProjectEdit();

  const [formData, setFormData] = useState<ProjectUpdateRequest>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les données initiales
  useEffect(() => {
    fetchProject(projectId);
  }, [fetchProject, projectId]);

  // Pré-remplir le formulaire quand le projet est chargé
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      });
    }
  }, [project]);

  useEffect(() => {
    if (success && project && onSuccess) {
      onSuccess(project);
    }
  }, [success, project, onSuccess]);

  const handleInputChange = (field: keyof ProjectUpdateRequest, value: string) => {
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

    await updateProject(projectId, formData);
  };

  const handleReset = () => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      });
    }
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

  if (loadingProject) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des informations du projet...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Erreur</Alert.Heading>
        <p>Impossible de charger les informations du projet.</p>
        {onCancel && (
          <Button variant="outline-danger" onClick={onCancel}>
            Retour
          </Button>
        )}
      </Alert>
    );
  }

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
          <p>Le projet a été modifié avec succès !</p>
        </Alert>
      )}

      {/* Informations non modifiables */}
      <div className="bg-light p-3 rounded mb-4">
        <h6 className="mb-2">Informations non modifiables</h6>
        <Row>
          <Col md={4}>
            <strong>Client:</strong> {project.clientName}
            {project.clientCompanyName && (
              <small className="d-block text-muted">{project.clientCompanyName}</small>
            )}
          </Col>
          <Col md={4}>
            <strong>Topographe:</strong> {project.topographeName}
            <small className="d-block text-muted">{project.topographeLicenseNumber}</small>
          </Col>
          <Col md={4}>
            <strong>Créé le:</strong> {new Date(project.createdAt).toLocaleDateString('fr-FR')}
            <small className="d-block text-muted">
              Progression: {Math.round(project.progressPercentage)}% ({project.completedTasks}/{project.totalTasks} tâches)
            </small>
          </Col>
        </Row>
      </div>

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
            <Form.Label>Statut <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as any)}
              isInvalid={!!validationErrors.status}
            >
              <option value="PLANNING">{getStatusLabel('PLANNING')}</option>
              <option value="IN_PROGRESS">{getStatusLabel('IN_PROGRESS')}</option>
              <option value="ON_HOLD">{getStatusLabel('ON_HOLD')}</option>
              <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
              <option value="CANCELLED">{getStatusLabel('CANCELLED')}</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.status}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Attention: changer le statut ici peut avoir des implications sur les tâches du projet
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
              Modification en cours...
            </>
          ) : (
            'Modifier le projet'
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

export default ProjectEditForm;