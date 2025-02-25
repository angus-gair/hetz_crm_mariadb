import { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    marketingConsent: false,
    notes: ''
  });

  const createContact = async (data) => {
    const response = await axios.post('http://5.75.135.254/custom-api/api-proxy.php/create-contact', data, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_SUITE_CRM_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  };

  const mutation = useMutation(createContact, {
    onSuccess: (data) => {
      console.log('Contact created successfully!', data);
      // Reset form or show success message
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        marketingConsent: false,
        notes: ''
      });
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows="3"
        ></textarea>
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="marketingConsent"
            checked={formData.marketingConsent}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">I consent to receiving marketing information</span>
        </label>
      </div>
      
      <button
        type="submit"
        disabled={mutation.isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
      >
        {mutation.isLoading ? 'Submitting...' : 'Submit'}
      </button>
      
      {mutation.isError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          An error occurred. Please try again.
        </div>
      )}
      
      {mutation.isSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          Thank you for your submission!
        </div>
      )}
    </form>
  );
};

export default ContactForm;