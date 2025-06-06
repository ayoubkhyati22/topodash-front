import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { TopographeUpdateRequest, Topographe } from '../types';
import { useTopographeEdit } from '../hooks/useTopographeEdit';

interface TopographeEditFormProps {
  topographeId: number;
  onSuccess?: (topographe: Topographe) => void;
  onCancel?: () => void;
}

const TopographeEditForm: React.FC<TopographeEditFormProps> = ({ 
  topographeId, 
  onSuccess, 
  onCancel 
}) => {
  const { 
    topographe,
    loading, 
    error, 
    success, 
    cities, 
    loadingCities,
    loadingTopographe,
    fetchTopographe,
    updateTopographe, 
    fetchCities, 
    resetForm 
  } = useTopographeEdit();

  const [formData, setFormData] = useState<TopographeUpdateRequest>({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    birthday: '',
    cityId: 0,
    specialization: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les données initiales
  useEffect(() => {
    fetchCities();
    fetchTopographe(topographeId);
  }, [fetchCities, fetchTopographe, topographeId]);

  // Pré-remplir le formulaire quand le topographe est chargé
  useEffect(() => {
    if (topographe) {
      setFormData({
        email: topographe.email,
        phoneNumber: topographe.phoneNumber,
        firstName: topographe.firstName,
        lastName: topographe.lastName,
        birthday: topographe.birthday,
        cityId: getCityIdByName(topographe.cityName),
        specialization: topographe.specialization,
      });
    }
  }, [topographe]);

  useEffect(() => {
    if (success && topographe && onSuccess) {
      onSuccess(topographe);
    }
  }, [success, topographe, onSuccess]);

  // Fonction helper pour trouver l'ID de la ville par son nom
  const getCityIdByName = (cityName: string): number => {
    const city = cities.find(c => c.name === cityName);
    return city ? city.id : 0;
  };

  const handleInputChange = (field: keyof TopographeUpdateRequest, value: string | number) => {
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

    await updateTopographe(topographeId, formData);
  };

  const handleReset = () => {
    if (topographe) {
      setFormData({
        email: topographe.email,
        phoneNumber: topographe.phoneNumber,
        firstName: topographe.firstName,
        lastName: topographe.lastName,
        birthday: topographe.birthday,
        cityId: getCityIdByName(topographe.cityName),
        specialization: topographe.specialization,
      });
    }
    setValidationErrors({});
    resetForm();
  };

  if (loadingTopographe) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des informations du topographe...</p>
      </div>
    );
  }

  if (!topographe) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Erreur</Alert.Heading>
        <p>Impossible de charger les informations du topographe.</p>
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
          <p>Le topographe a été modifié avec succès !</p>
        </Alert>
      )}

      {/* Informations non modifiables */}
      <div className="bg-light p-3 rounded mb-4">
        <h6 className="mb-2">Informations non modifiables</h6>
        <Row>
          <Col md={4}>
            <strong>Nom d'utilisateur:</strong> {topographe.username}
          </Col>
          <Col md={4}>
            <strong>CIN:</strong> {topographe.cin}
          </Col>
          <Col md={4}>
            <strong>Numéro de licence:</strong> {topographe.licenseNumber}
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
              Modification en cours...
            </>
          ) : (
            'Modifier le topographe'
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

export default TopographeEditForm;