import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConsultationBookingForm = ({ apiUrl, apiToken, onSuccess, onError }) => {
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    type: 'consultation',
    duration: 60,
    marketingConsent: false
  });

  // Component state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitResult, setSubmitResult] = useState({
    status: null, // 'success', 'error'
    message: ''
  });

  // Get next 30 days for date picker
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        dates.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        });
      }
    }
    
    setAvailableDates(dates);
  }, []);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!formData.date) return;
    
    const fetchAvailableSlots = async () => {
      try {
        setAvailableTimes([]);
        const response = await axios.get(`${apiUrl}/meetings/available`, {
          params: { date: formData.date },
          headers: {
            'Authorization': `Bearer ${apiToken}`
          }
        });
        
        // Check if we got availability data for the selected date
        const dateAvailability = response.data.data.availability.find(
          day => day.date === formData.date
        );
        
        if (dateAvailability && dateAvailability.available_slots.length > 0) {
          setAvailableTimes(dateAvailability.available_slots);
        } else {
          setAvailableTimes([]);
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableTimes([]);
      }
    };
    
    fetchAvailableSlots();
  }, [formData.date, apiUrl, apiToken]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate date and time selection
      if (!formData.date) {
        newErrors.date = 'Please select a date';
      }
      
      if (!formData.time) {
        newErrors.time = 'Please select a time';
      }
    } else if (step === 2) {
      // Validate contact information
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'First name is required';
      }
      
      if (!formData.last_name.trim()) {
        newErrors.last_name = 'Last name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${apiUrl}/meetings/book`, formData, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSubmitResult({
        status: 'success',
        message: 'Your consultation has been booked successfully!'
      });
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: '',
        type: 'consultation',
        duration: 60,
        marketingConsent: false
      });
      
      // Reset to first step
      setCurrentStep(1);
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error('Error booking consultation:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      // Extract error message from response if available
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setSubmitResult({
        status: 'error',
        message: errorMessage
      });
      
      // Call onError callback if provided
      if (onError && typeof onError === 'function') {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step 1: Date and time selection
  const renderStep1 = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Select a Date & Time</h3>
      
      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
          Date*
        </label>
        <select
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a date</option>
          {availableDates.map(dateOption => (
            <option key={dateOption.date} value={dateOption.date}>
              {dateOption.display}
            </option>
          ))}
        </select>
        {errors.date && (
          <p className="mt-1 text-red-500 text-sm">{errors.date}</p>
        )}
      </div>
      
      <div className="mb-6">
        <label htmlFor="time" className="block text-gray-700 font-medium mb-2">
          Time*
        </label>
        
        {formData.date ? (
          availableTimes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableTimes.map(slot => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      time: slot.start
                    }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.time;
                      return newErrors;
                    });
                  }}
                  className={`py-2 px-3 border text-center rounded-md transition-colors ${
                    formData.time === slot.start
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {slot.formatted_start}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-orange-500">No available times for this date. Please select another date.</p>
          )
        ) : (
          <p className="text-gray-500">Please select a date first</p>
        )}
        
        {errors.time && (
          <p className="mt-1 text-red-500 text-sm">{errors.time}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
          Consultation Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="consultation">Initial Consultation</option>
          <option value="follow_up">Follow-up Meeting</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next
        </button>
      </div>
    </>
  );

  // Render step 2: Contact information
  const renderStep2 = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Your Information</h3>
      
      <div className="mb-4">
        <label htmlFor="first_name" className="block text-gray-700 font-medium mb-2">
          First Name*
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.first_name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.first_name && (
          <p className="mt-1 text-red-500 text-sm">{errors.first_name}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="last_name" className="block text-gray-700 font-medium mb-2">
          Last Name*
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.last_name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.last_name && (
          <p className="mt-1 text-red-500 text-sm">{errors.last_name}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Email*
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Please let us know what you'd like to discuss"
        ></textarea>
      </div>
      
      <div className="mb-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            name="marketingConsent"
            checked={formData.marketingConsent}
            onChange={handleChange}
            className="mt-1 mr-2"
          />
          <span className="text-sm text-gray-600">
            I agree to receive marketing communications. You can unsubscribe at any time.
          </span>
        </label>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-white ${
            isSubmitting 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isSubmitting ? 'Booking...' : 'Book Consultation'}
        </button>
      </div>
    </>
  );

  // Render confirmation screen
  const renderConfirmation = () => (
    <div className="text-center">
      <div className="mb-4 flex justify-center">
        <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold mb-2">Booking Confirmed</h3>
      <p className="mb-6">{submitResult.message}</p>
      
      <button
        type="button"
        onClick={() => {
          setSubmitResult({ status: null, message: '' });
          setCurrentStep(1);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Book Another Consultation
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Book a Consultation</h2>
      
      {submitResult.status === 'error' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {submitResult.message}
        </div>
      )}
      
      {submitResult.status === 'success' ? (
        renderConfirmation()
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex-1 h-2 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 h-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Select Date & Time</span>
              <span>Your Information</span>
            </div>
          </div>
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </form>
      )}
    </div>
  );
};

export default ConsultationBookingForm;
