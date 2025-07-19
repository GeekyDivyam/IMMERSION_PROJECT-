import React, { useState } from 'react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange = null, 
  size = 'md', 
  readonly = false,
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'fs-6',
    md: 'fs-5',
    lg: 'fs-4',
    xl: 'fs-3'
  };

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getStarClass = (starValue) => {
    const currentRating = hoverRating || rating;
    if (starValue <= currentRating) {
      return 'text-warning';
    } else if (starValue - 0.5 <= currentRating) {
      return 'text-warning-half';
    }
    return 'text-muted';
  };

  const renderStar = (starValue) => {
    const currentRating = hoverRating || rating;
    let starIcon = 'far fa-star'; // Empty star
    
    if (starValue <= currentRating) {
      starIcon = 'fas fa-star'; // Full star
    } else if (starValue - 0.5 <= currentRating) {
      starIcon = 'fas fa-star-half-alt'; // Half star
    }

    return (
      <i
        key={starValue}
        className={`${starIcon} ${getStarClass(starValue)} ${sizeClasses[size]} ${!readonly ? 'star-interactive' : ''}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        style={{
          cursor: readonly ? 'default' : 'pointer',
          marginRight: '2px',
          transition: 'color 0.2s ease'
        }}
      />
    );
  };

  return (
    <div 
      className={`star-rating d-inline-flex align-items-center ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stars">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {showValue && (
        <span className="ms-2 text-muted">
          {rating > 0 ? rating.toFixed(1) : 'No rating'}
        </span>
      )}
      
      <style jsx>{`
        .star-interactive:hover {
          transform: scale(1.1);
        }
        
        .text-warning-half {
          color: #ffc107 !important;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default StarRating;
