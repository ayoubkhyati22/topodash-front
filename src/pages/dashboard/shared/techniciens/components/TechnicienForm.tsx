// components/TechnicienForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { TechnicienCreateRequest } from '../types';
import { useTechnicienForm } from '../hooks/useTechnicienForm';

interface TechnicienFormProps {
  onSuccess?: (technicien: any) => void;
  onCancel?: () => void;
}

export const TechnicienForm: React.FC<TechnicienFormProps> = ({ onSuccess, onCancel }) => {
  const { 
    loading, 
    error, 
    success, 
    cities, 
    topographes,
    loadingCities,
    loadingTopographes,
    currentUserRole,
    createTechnicien, 
    fetchCities,
    fetchTopographes,
    resetForm 
  } = useTechnicienForm();

  const [formData, setFormData] = useState<TechnicienCreateRequest>({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    birthday: '',
    cin: '',
    cityId: 0,
    skillLevel: 'JUNIOR',
    specialties: '',
    assignedToTopographeId: 0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCities();
    // Charger les topographes seulement si l'utilisateur est admin
    if (currentUserRole === 'ADMIN') {
      fetchTopographes();
    }
  }, [fetchCities, fetchTopographes, currentUserRole]);

  useEffect(() => {
    if (success && onSuccess) {
      onSuccess(formData);
    }
  }, [success, onSuccess, formData]);

  const handleInputChange = (field: keyof TechnicienCreateRequest, value: string | number) => {
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

    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est obligatoire';
    } else if (formData.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

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

    if (!formData.cin.trim()) {
      errors.cin = 'Le CIN est obligatoire';
    }

    if (!formData.cityId || formData.cityId === 0) {
      errors.cityId = 'La ville est obligatoire';
    }

    if (!formData.specialties.trim()) {
      errors.specialties = 'Les spécialités sont obligatoires';
    }

    // Validation du topographe seulement pour les admins
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

    const success = await createTechnicien(formData);
    if (success) {
      // Reset form on success
      setFormData({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        birthday: '',
        cin: '',
        cityId: 0,
        skillLevel: 'JUNIOR',
        specialties: '',
        assignedToTopographeId: 0,
      });
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      birthday: '',
      cin: '',
      cityId: 0,
      skillLevel: 'JUNIOR',
      specialties: '',
      assignedToTopographeId: 0,
    });
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
          <p>Le technicien a été créé avec succès !</p>
        </Alert>
      )}

      {/* Information sur l'affectation automatique pour les topographes */}
      {currentUserRole === 'TOPOGRAPHE' && (
        <Alert variant="info" className="mb-4">
          <Alert.Heading>Information</Alert.Heading>
          <p>En tant que topographe, le technicien sera automatiquement affecté à votre compte.</p>
        </Alert>
      )}

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
            <Form.Label>Nom d'utilisateur <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrez le nom d'utilisateur"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              isInvalid={!!validationErrors.username}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.username}
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
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>CIN <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="AB123456"
              value={formData.cin}
              onChange={(e) => handleInputChange('cin', e.target.value)}
              isInvalid={!!validationErrors.cin}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.cin}
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
              Création en cours...
            </>
          ) : (
            'Créer le technicien'
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