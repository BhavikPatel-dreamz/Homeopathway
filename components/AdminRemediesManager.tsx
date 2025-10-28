"use client";
import { useState, useEffect } from 'react';

interface Remedy {
  id: string;
  name: string;
  scientific_name: string;
  common_name: string;
  description: string;
  key_symptoms: string[];
  constitutional_type: string;
  dosage_forms: string[];
  safety_precautions: string;
  average_rating: number;
  total_reviews: number;
  related_ailments: string[];
}

export default function AdminRemediesManager() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemedy, setEditingRemedy] = useState<Remedy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    common_name: '',
    description: '',
    key_symptoms: [''],
    constitutional_type: '',
    dosage_forms: [''],
    safety_precautions: '',
    average_rating: 0,
    total_reviews: 0,
    related_ailments: [''],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchRemedies();
  }, []);

  const fetchRemedies = async () => {
    // TODO: Replace with actual API call to Supabase
    const mockRemedies: Remedy[] = [
      {
        id: '1',
        name: 'Belladonna',
        scientific_name: 'Atropa belladonna',
        common_name: 'Deadly Nightshade',
        description: 'Best for sudden, intense, throbbing pain that comes on rapidly',
        key_symptoms: ['Sudden onset of symptoms', 'High fever with hot, red face', 'Throbbing headaches', 'Sensitivity to light and noise'],
        constitutional_type: 'Hot, intense, sudden conditions',
        dosage_forms: ['Pellets', 'Tablets', 'Liquid'],
        safety_precautions: 'Use only as directed. Consult healthcare provider.',
        average_rating: 4.8,
        total_reviews: 324,
        related_ailments: ['Headache', 'Fever', 'Inflammation'],
      },
      {
        id: '2',
        name: 'Arnica Montana',
        scientific_name: 'Arnica montana',
        common_name: 'Mountain Tobacco',
        description: 'Best for physical trauma, bruising, and muscle soreness',
        key_symptoms: ['Bruising and trauma', 'Muscle soreness', 'Post-surgical recovery', 'Shock from injury'],
        constitutional_type: 'Physical trauma and injuries',
        dosage_forms: ['Pellets', 'Gel', 'Cream', 'Tablets'],
        safety_precautions: 'For external use, do not apply to broken skin.',
        average_rating: 4.9,
        total_reviews: 567,
        related_ailments: ['Bruising', 'Muscle pain', 'Trauma'],
      },
    ];
    setRemedies(mockRemedies);
  };

  const openModal = (remedy?: Remedy) => {
    if (remedy) {
      setEditingRemedy(remedy);
      setFormData({
        name: remedy.name,
        scientific_name: remedy.scientific_name,
        common_name: remedy.common_name,
        description: remedy.description,
        key_symptoms: remedy.key_symptoms,
        constitutional_type: remedy.constitutional_type,
        dosage_forms: remedy.dosage_forms,
        safety_precautions: remedy.safety_precautions,
        average_rating: remedy.average_rating,
        total_reviews: remedy.total_reviews,
        related_ailments: remedy.related_ailments,
      });
    } else {
      setEditingRemedy(null);
      setFormData({
        name: '',
        scientific_name: '',
        common_name: '',
        description: '',
        key_symptoms: [''],
        constitutional_type: '',
        dosage_forms: [''],
        safety_precautions: '',
        average_rating: 0,
        total_reviews: 0,
        related_ailments: [''],
      });
    }
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRemedy(null);
  };

  const handleArrayChange = (field: 'key_symptoms' | 'dosage_forms' | 'related_ailments', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'key_symptoms' | 'dosage_forms' | 'related_ailments') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: 'key_symptoms' | 'dosage_forms' | 'related_ailments', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Replace with actual API call to Supabase
      if (editingRemedy) {
        setRemedies(remedies.map(r =>
          r.id === editingRemedy.id
            ? { ...r, ...formData }
            : r
        ));
        setMessage({ type: 'success', text: 'Remedy updated successfully!' });
      } else {
        const newRemedy: Remedy = {
          id: Date.now().toString(),
          ...formData,
        };
        setRemedies([...remedies, newRemedy]);
        setMessage({ type: 'success', text: 'Remedy created successfully!' });
      }
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save remedy. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this remedy?')) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call to Supabase
      setRemedies(remedies.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'Remedy deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete remedy.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-gray-900">Manage Remedies</h2>
          <p className="text-gray-600 mt-1">Add, edit, or remove remedies from your database</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add New Remedy
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Remedies List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Scientific Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {remedies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No remedies found. Click "Add New Remedy" to create one.
                </td>
              </tr>
            ) : (
              remedies.map((remedy) => (
                <tr key={remedy.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{remedy.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm italic text-gray-600">{remedy.scientific_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 line-clamp-2">{remedy.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium">{remedy.average_rating}</span>
                      <span className="text-xs text-gray-500">({remedy.total_reviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(remedy)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(remedy.id)}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-serif">
                {editingRemedy ? 'Edit Remedy' : 'Add New Remedy'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remedy Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Belladonna"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                    required
                  />
                </div>

                {/* Scientific Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scientific Name *
                  </label>
                  <input
                    type="text"
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                    placeholder="e.g., Atropa belladonna"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Common Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Common Name
                </label>
                <input
                  type="text"
                  value={formData.common_name}
                  onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
                  placeholder="e.g., Deadly Nightshade"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Best for..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Key Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Symptoms *
                </label>
                {formData.key_symptoms.map((symptom, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={symptom}
                      onChange={(e) => handleArrayChange('key_symptoms', index, e.target.value)}
                      placeholder="Enter a key symptom"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E]"
                      required
                    />
                    {formData.key_symptoms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('key_symptoms', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('key_symptoms')}
                  className="text-sm text-[#6B7B5E] hover:underline"
                >
                  + Add Symptom
                </button>
              </div>

              {/* Constitutional Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constitutional Type
                </label>
                <input
                  type="text"
                  value={formData.constitutional_type}
                  onChange={(e) => setFormData({ ...formData, constitutional_type: e.target.value })}
                  placeholder="e.g., Hot, intense, sudden conditions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                />
              </div>

              {/* Dosage Forms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage Forms
                </label>
                {formData.dosage_forms.map((form, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={form}
                      onChange={(e) => handleArrayChange('dosage_forms', index, e.target.value)}
                      placeholder="e.g., Pellets, Tablets, Liquid"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E]"
                    />
                    {formData.dosage_forms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('dosage_forms', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('dosage_forms')}
                  className="text-sm text-[#6B7B5E] hover:underline"
                >
                  + Add Dosage Form
                </button>
              </div>

              {/* Safety Precautions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Safety Precautions
                </label>
                <textarea
                  value={formData.safety_precautions}
                  onChange={(e) => setFormData({ ...formData, safety_precautions: e.target.value })}
                  placeholder="Use only as directed. Consult healthcare provider."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent resize-none"
                />
              </div>

              {/* Related Ailments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Ailments
                </label>
                {formData.related_ailments.map((ailment, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ailment}
                      onChange={(e) => handleArrayChange('related_ailments', index, e.target.value)}
                      placeholder="e.g., Headache, Fever"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E]"
                    />
                    {formData.related_ailments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('related_ailments', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('related_ailments')}
                  className="text-sm text-[#6B7B5E] hover:underline"
                >
                  + Add Ailment
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingRemedy ? 'Update Remedy' : 'Create Remedy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
