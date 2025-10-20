import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

/**
 * Simple Rating Modal Component
 * Allows patient to rate a doctor with 1-5 stars
 * 
 * Props:
 * - isOpen: boolean - controls modal visibility
 * - onClose: function - called when modal is closed
 * - onSubmit: function(rating) - called when rating is submitted
 * - doctorName: string - name of the doctor being rated
 * - loading: boolean - shows loading state on submit button
 */
const SimpleRatingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  doctorName, 
  loading = false 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    onSubmit(rating);
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rate Your Consultation</h2>
            <p className="text-sm text-gray-600 mt-1">
              How was your experience with Dr. {doctorName}?
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <label className="block text-base font-semibold text-gray-900 mb-4 text-center">
              Select Your Rating
            </label>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={loading}
                    className={`transition-all duration-150 transform hover:scale-110 ${
                      loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{rating}/5</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {rating === 5 && '⭐ Excellent!'}
                    {rating === 4 && '😊 Very Good'}
                    {rating === 3 && '🙂 Good'}
                    {rating === 2 && '😐 Fair'}
                    {rating === 1 && '😞 Poor'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SimpleRatingModal;