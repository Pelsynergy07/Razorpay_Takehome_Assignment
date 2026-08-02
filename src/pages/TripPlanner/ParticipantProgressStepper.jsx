import React from 'react';
import { Compass, Camera, Navigation, ShieldAlert, MapPin, Check } from 'lucide-react';
import { participantCards } from './participantCards';

const ICONS = { Compass, Camera, Navigation, ShieldAlert, MapPin };

/**
 * Stepper: icon circles with blue connector lines between them.
 * Clicking a completed circle navigates back to that question.
 * No back button — circles handle navigation.
 */
const ParticipantProgressStepper = ({ questionIndex, totalQuestions, onStepClick }) => {
  const currentCardIndex = questionIndex - 1; // 0-indexed

  return (
    <div className="participant-stepper-header">
      {/* Icon circles with connector lines */}
      <div className="stepper-icons-track">
        {participantCards.map((card, i) => {
          const Icon = ICONS[card.icon] || Compass;
          const isCompleted = i < currentCardIndex;
          const isCurrent = i === currentCardIndex;
          const canClick = isCompleted && onStepClick;

          return (
            <React.Fragment key={card.key}>
              <div
                className={`stepper-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${canClick ? 'clickable' : ''}`}
                onClick={canClick ? () => onStepClick(i) : undefined}
                title={canClick ? `Go back to: ${card.title}` : undefined}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
              </div>
              {i < totalQuestions - 1 && (
                <div className={`stepper-connector ${i < currentCardIndex ? 'filled' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantProgressStepper;
