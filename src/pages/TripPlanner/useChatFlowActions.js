import { useEffect } from 'react';
import { smoothScrollTo, smoothScrollToBottom } from '../../lib/smoothScroll';

/**
 * Chat-turn choreography shared by the homepage's floating Myra widget
 * (AIChatbotWidget) and the full-page /plan route (OrganizerEntry): the
 * "thinking" delay before a bot turn lands, and the handlers for every
 * step transition (form → hub → synthesis → approval) that echo the
 * triggering action as a user message first.
 *
 * `kindField` lets each caller keep its own message-shape convention —
 * AIChatbotWidget's messages use `type` (they're also persisted to
 * localStorage via chatHistory in that shape), OrganizerEntry's use `kind`
 * (matching useTripPlannerFlow's own `{ kind, text }` return values
 * directly, no persistence) — without forcing either one to change.
 *
 * `echoUser` is passed in rather than defined here because
 * AIChatbotWidget's version also calls `ensureConversationId()` first;
 * that side effect is specific to the widget and shouldn't leak into the
 * /plan route's simpler version.
 */
export function useChatFlowActions({ flow, setMessages, setIsTyping, echoUser, kindField = 'type' }) {
  const pushMessage = (partial) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...partial }]);
  };

  // useTripPlannerFlow's own messages (launchMessage, startForm, submitForm's
  // `message`) always come back shaped `{ kind, text }` — this renames that
  // to whichever field this caller's messages use.
  const toMessage = ({ kind, ...rest }) => ({ [kindField]: kind, ...rest });

  const thinkThen = (messagePartial, delay = 850) => {
    setIsTyping(true);
    setTimeout(() => {
      pushMessage({ role: 'bot', ...messagePartial });
      setIsTyping(false);
    }, delay);
  };

  // Same as thinkThen, but also fires a flow-state transition (entering the
  // hub, starting synthesis, approving) right before the message lands.
  const advanceThen = (sideEffect, messagePartial, delay) => {
    setIsTyping(true);
    setTimeout(() => {
      sideEffect?.();
      pushMessage({ role: 'bot', ...messagePartial });
      setIsTyping(false);
    }, delay);
  };

  const handleLaunchSyncMode = () => {
    echoUser('Launch sync mode');
    thinkThen(toMessage(flow.startForm()), 850);
  };

  const handleTripFormSubmit = async (formValues) => {
    const destinationPart = formValues.destination ? ` · ${formValues.destination}` : '';
    echoUser(`${formValues.groupSize} people${destinationPart} · ${formValues.dateWindow} · ₹${formValues.budgetPerPerson.toLocaleString('en-IN')} per person`);
    const { message } = await flow.submitForm(formValues);
    thinkThen(toMessage(message), 950);
  };

  const handleEnterHub = () => {
    echoUser('Enter live aggregation hub');
    advanceThen(flow.enterHub, { [kindField]: 'hub', text: "Here's the live hub — I'll update this as responses come in." }, 600);
  };

  const handleProceedToSynthesis = () => {
    echoUser('Proceed to synthesis now');
    advanceThen(flow.startSynthesis, { [kindField]: 'processing' }, 600);
  };

  const handleCompleteSynthesis = async () => {
    await flow.completeSynthesis();
    pushMessage({ role: 'bot', [kindField]: 'result', text: "Here's what I've put together:" });
  };

  const handleApprove = () => {
    echoUser('Approve itinerary');
    advanceThen(flow.approve, { [kindField]: 'closed', text: "You're all set! Here's your itinerary:" }, 750);
  };

  return {
    thinkThen,
    handleLaunchSyncMode,
    handleTripFormSubmit,
    handleEnterHub,
    handleProceedToSynthesis,
    handleCompleteSynthesis,
    handleApprove,
  };
}

/**
 * Auto-scrolls the message transcript as new turns land. The final
 * itinerary (kindField === 'closed') reveals day-by-day over a few
 * seconds, so jumping straight to the bottom would scroll right past that
 * animation — this nudges just enough to bring Day 1 into view instead.
 */
export function useChatAutoScroll({ messages, isTyping, containerRef, kindField = 'type' }) {
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const container = containerRef.current;
    if (lastMsg?.[kindField] === 'closed') {
      requestAnimationFrame(() => {
        const dayEl = container?.querySelector('.itinerary-day');
        if (!container || !dayEl) return;
        const containerRect = container.getBoundingClientRect();
        const dayRect = dayEl.getBoundingClientRect();
        const target = container.scrollTop + (dayRect.top - containerRect.top) - 16;
        smoothScrollTo(container, target, 1680);
      });
      return;
    }
    // Synthesis result: land on this turn's own "Here's what I've put
    // together" bot bubble instead of the container bottom — scrolling to
    // bottom here is unpredictable since it depends on however tall
    // SynthesisResult's card ends up being.
    if (lastMsg?.[kindField] === 'result') {
      requestAnimationFrame(() => {
        if (!container) return;
        const responseEls = container.querySelectorAll('.bot-response');
        const resultEl = responseEls[responseEls.length - 1];
        if (!resultEl) return;
        const containerRect = container.getBoundingClientRect();
        const resultRect = resultEl.getBoundingClientRect();
        const target = container.scrollTop + (resultRect.top - containerRect.top) - 16;
        smoothScrollTo(container, target, 1680);
      });
      return;
    }
    smoothScrollToBottom(container, 1680);
  }, [messages, isTyping]);
}
