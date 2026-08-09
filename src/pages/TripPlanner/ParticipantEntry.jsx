import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ParticipantMobileFrame from './ParticipantMobileFrame';
import ParticipantFormFlow from './ParticipantFormFlow';

const ParticipantEntry = () => {
  const { sessionId } = useParams();
  // ?self=1 marks the organizer's own copy of this same link, opened from
  // the "Fill in your preferences" button on the share screen — everything
  // else about the form is identical, it just starts with their name filled in.
  const [searchParams] = useSearchParams();
  const isSelf = searchParams.get('self') === '1';

  return (
    <ParticipantMobileFrame joinUrl={`myra.makemytrip.com/join/${sessionId || ''}`}>
      <ParticipantFormFlow sessionId={sessionId} isSelf={isSelf} />
    </ParticipantMobileFrame>
  );
};

export default ParticipantEntry;
