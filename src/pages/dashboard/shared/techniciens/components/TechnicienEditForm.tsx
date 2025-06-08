// src/pages/dashboard/shared/techniciens/components/TechnicienEditForm.tsx

import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { TechnicienUpdateRequest, Technicien } from '../types';
import { useTechnicienEdit } from '../hooks/useTechnicienEdit';

interface TechnicienEditFormProps {
  technicienId: number;
  onSuccess?: (technicien: Technicien) => void;
  onCancel?: () => void;
}

const TechnicienEditForm: React.FC<TechnicienEditFormProps> = ({ 
  technicienId, 
  onSuccess, 
  onCancel 
}) => {
  const { 
    technicien,
    loading, 
    error, 
    success, 
    cities, 
    loadingCities,
    loadingTechnicien,
    topographes,
    loadingTopographes,
    currentUserRole,
    fetchTechnicien,
    updateTechnicien, 
    fetchCities,
    fetchTopographes,
    resetForm 
  } = useTechnicienEdit();

  const [formData, setFormData] = useState<TechnicienUpdateRequest>({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    birthday: '',
    cityId: 0,
    skillLevel: 'JUNIOR',
    specialties: '',
    assignedToTopographeId: 0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les données initiales
  useEffect(() => {
    fetchCities();
    if (currentUserRole === 'ADMIN') {
      fetchTopographes();
    }
    fetchTechnicien(technicienId);
  }, [fetchCities, fetchTopographes, fetchTechnicien, technicienId, currentUserRole]);

  // Pré-remplir le formulaire quand le technicien est chargé
  useEffect(() => {
    if (technicien) {
      setFormData({
        email: technicien.email,
        phoneNumber: technicien.phoneNumber,
        firstName: technicien.firstName,
        lastName: technicien.lastName,
        birthday: technicien.birthday,
        cityId: getCityIdByName(technicien.cityName),
        skillLevel: technicien.skillLevel,
        specialties: technicien.specialties,
        assignedToTopographeId: technicien.assignedToTopographeId,
      });
    }
  }, [technicien]);

  useEffect(() => {
    if (success && technicien && onSuccess) {
      onSuccess(technicien);
    }
  }, [success, technicien, onSuccess]);

  // Fonction helper pour trouver l'ID de la ville par son nom
  const getCityIdByName = (cityName: string): number => {
    const city = cities.find(c => c.name === cityName);
    return city ? city.id : 0;
  };

  const handleInputChange = (field: keyof TechnicienUpdateRequest, value: string | number) => {
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

    if (!formData.email.trim()) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Le numéro de téléphone est obligatoire';
    } else if (!/^[\+]?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Format de numéro de téléphone invalide';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est obligatoire';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom de famille est obligatoire';
    }

    if (!formData.birthday) {
      errors.birthday = 'La date de naissance est obligatoire';
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      if (birthDate >= today) {
        errors.birthday = 'La date de naissance doit être dans le passé';
      }
    }

    if (!formData.cityId || formData.cityId === 0) {
      errors.cityId = 'La ville est obligatoire';
    }

    if (!formData.specialties.trim()) {
      errors.specialties = 'Les spécialités sont obligatoires';
    }

    if (currentUserRole === 'ADMIN' && (!formData.assignedToTopographeId || formData.assignedToTopographeId === 0)) {
      errors.assignedToTopographeId = 'Le topographe responsable est obligatoire';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await updateTechnicien(technicienId, formData);
  };

  const handleReset = () => {
    if (technicien) {
      setFormData({
        email: technicien.email,
        phoneNumber: technicien.phoneNumber,
        firstName: technicien.firstName,
        lastName: technicien.lastName,
        birthday: technicien.birthday,
        cityId: getCityIdByName(technicien.cityName),
        skillLevel: technicien.skillLevel,
        specialties: technicien.specialties,
        assignedToTopographeId: technicien.assignedToTopographeId,
      });
    }
    setValidationErrors({});
    resetForm();
  };

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR': return 'Junior';
      case 'SENIOR': return 'Senior';
      case 'EXPERT': return 'Expert';
      default: return level;
    }
  };

  if (loadingTechnicien) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des informations du technicien...</p>
      </div>
    );
  }

  if (!technicien) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Erreur</Alert.Heading>
        <p>Impossible de charger les informations du technicien.</p>
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
          <p>Le technicien a été modifié avec succès !</p>
        </Alert>
      )}

      {/* Informations non modifiables */}
      <div className="bg-light p-3 rounded mb-4">
        <h6 className="mb-2">Informations non modifiables</h6>
        <Row>
          <Col md={3}>
            <strong>Nom d'utilisateur:</strong> {technicien.username}
          </Col>
          <Col md={3}>
            <strong>CIN:</strong> {technicien.cin}
          </Col>
          <Col md={3}>
            <strong>Affecté à:</strong> {technicien.assignedToTopographeName}
          </Col>
          <Col md={3}>
            <strong>Créé le:</strong> {new Date(technicien.createdAt).toLocaleDateString('fr-FR')}
          </Col>
        </Row>
      </div>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Prénom <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrez le prénom"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              isInvalid={!!validationErrors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.firstName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nom de famille <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrez le nom de famille"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              isInvalid={!!validationErrors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.lastName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              placeholder="Entrez l'email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              isInvalid={!!validationErrors.email}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Numéro de téléphone <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              placeholder="+212612345678"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              isInvalid={!!validationErrors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Date de naissance <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              isInvalid={!!validationErrors.birthday}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.birthday}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ville <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={formData.cityId}
              onChange={(e) => handleInputChange('cityId', parseInt(e.target.value))}
              isInvalid={!!validationErrors.cityId}
              disabled={loadingCities}
            >
              <option value={0}>
                {loadingCities ? 'Chargement...' : 'Sélectionnez une ville'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.cityId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={currentUserRole === 'ADMIN' ? 4 : 6}>
          <Form.Group className="mb-3">
            <Form.Label>Niveau de compétence <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={formData.skillLevel}
              onChange={(e) => handleInputChange('skillLevel', e.target.value as any)}
              isInvalid={!!validationErrors.skillLevel}
            >
              <option value="JUNIOR">{getSkillLevelLabel('JUNIOR')}</option>
              <option value="SENIOR">{getSkillLevelLabel('SENIOR')}</option>
              <option value="EXPERT">{getSkillLevelLabel('EXPERT')}</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {validationErrors.skillLevel}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        {/* Champ topographe visible seulement pour les admins */}
        {currentUserRole === 'ADMIN' && (
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Topographe responsable <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.assignedToTopographeId}
                onChange={(e) => handleInputChange('assignedToTopographeId', parseInt(e.target.value))}
                isInvalid={!!validationErrors.assignedToTopographeId}
                disabled={loadingTopographes}
              >
                <option value={0}>
                  {loadingTopographes ? 'Chargement...' : 'Sélectionnez un topographe'}
                </option>
                {topographes.map((topographe) => (
                  <option key={topographe.id} value={topographe.id}>
                    {topographe.name} ({topographe.licenseNumber})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.assignedToTopographeId}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        <Col md={currentUserRole === 'ADMIN' ? 4 : 6}>
          <Form.Group className="mb-3">
            <Form.Label>Spécialités <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Topographie, Géomètre, BTP..."
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              isInvalid={!!validationErrors.specialties}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.specialties}
            </Form.Control.Feedback>
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
            'Modifier le technicien'
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

export default TechnicienEditForm;