import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { TopographeCreateRequest } from '../types';
import { useTopographeForm } from '../hooks/useTopographeForm';

interface TopographeFormProps {
  onSuccess?: (topographe: any) => void;
  onCancel?: () => void;
}

export const TopographeForm: React.FC<TopographeFormProps> = ({ onSuccess, onCancel }) => {
  const { 
    loading, 
    error, 
    success, 
    cities, 
    loadingCities, 
    createTopographe, 
    fetchCities, 
    resetForm 
  } = useTopographeForm();

  const [formData, setFormData] = useState<TopographeCreateRequest>({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    birthday: '',
    cin: '',
    cityId: 0,
    licenseNumber: '',
    specialization: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (success && onSuccess) {
      onSuccess(formData);
    }
  }, [success, onSuccess, formData]);

  const handleInputChange = (field: keyof TopographeCreateRequest, value: string | number) => {
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

    if (!formData.password.trim()) {
      errors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
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

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'Le numéro de licence est obligatoire';
    }

    if (!formData.specialization.trim()) {
      errors.specialization = 'La spécialisation est obligatoire';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await createTopographe(formData);
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
        licenseNumber: '',
        specialization: '',
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
      licenseNumber: '',
      specialization: '',
    });
    setValidationErrors({});
    resetForm();
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
          <p>Le topographe a été créé avec succès !</p>
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
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              placeholder="Entrez le mot de passe"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              isInvalid={!!validationErrors.password}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.password}
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
      </Row>

      <Row>
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
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Numéro de licence <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="LIC001"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              isInvalid={!!validationErrors.licenseNumber}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.licenseNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-4">
            <Form.Label>Spécialisation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ex: Génie Civil, Topographie, SIG, Photogrammétrie..."
              value={formData.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              isInvalid={!!validationErrors.specialization}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.specialization}
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
            'Créer le topographe'
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