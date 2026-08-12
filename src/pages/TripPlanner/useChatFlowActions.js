import { useEffect } from 'react';
import { smoothScrollTo, smoothScrollToBottom } from '../../lib/smoothScroll';
import { getResponses, subscribeToResponses } from '../../lib/tripApi';

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
    const { session, message } = await flow.submitForm(formValues);
    thinkThen(toMessage({ ...message, sessionId: session.id }), 950);
  };

  const handleEnterHub = () => {
    echoUser('Enter live aggregation hub');
    advanceThen(flow.enterHub, { [kindField]: 'hub', text: "Here's the live hub — I'll update this as responses come in.", sessionId: flow.session?.id }, 600);
  };

  // The "Fill in your preferences" button on the share screen opens the
  // organizer's own copy of the /join page in a new tab — there's no
  // in-page callback for that, so instead this watches the same cross-tab
  // response feed LiveAggregationHub uses (Supabase Realtime, or the
  // localStorage `storage` event as an offline fallback) and reacts the
  // moment the first new response for this session lands, exactly as if
  // the organizer had reported back in.
  useEffect(() => {
    if (flow.tripStep !== 'share' || !flow.session?.id) return;
    const sessionId = flow.session.id;
    let active = true;
    let baseline = null;
    let fired = false;

    const maybeFire = (responses) => {
      if (!active || fired) return;
      if (baseline === null) {
        baseline = responses.length;
        return;
      }
      if (responses.length > baseline) {
        fired = true;
        // Hand the response list this watcher already fetched straight to
        // the hub screen's initial paint, instead of it re-fetching the
        // same data on mount and showing a stale "0 of N" until that
        // round-trip (real against Supabase) resolves.
        flow.setCachedResponses?.(responses);
        thinkThen(
          {
            [kindField]: 'self_ack',
            text: "Thanks for adding your own preferences! I'll keep this link live for the next 3 hours so the rest of the group can chime in too.",
            sessionId,
          },
          700
        );
      }
    };

    const unsubscribe = subscribeToResponses(sessionId, maybeFire);
    // Belt-and-suspenders baseline fetch for setups where subscribeToResponses
    // doesn't fire an initial callback on its own (localStorage-only mode) —
    // whichever of these two resolves first wins, the other is a no-op.
    getResponses(sessionId).then((initial) => {
      if (active && baseline === null) baseline = Array.isArray(initial) ? initial.length : 0;
    });

    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.tripStep, flow.session?.id]);

  const handleProceedToSynthesis = () => {
    echoUser('Proceed to synthesis now');
    advanceThen(flow.startSynthesis, { [kindField]: 'processing', sessionId: flow.session?.id }, 600);
  };

  // Zero-responses edge case — the proceed button stays clickable even
  // with no responses in, but clicking it with nothing to synthesize from
  // gets a bot reply asking whether to proceed anyway, with a Yes/No
  // choice, instead of silently advancing the flow.
  const handleEmptyProceedAttempt = () => {
    echoUser('Proceed to synthesis now');
    thinkThen({ [kindField]: 'zero_response_confirm', text: "Hold that thought — no one's responded yet. Do you still want to continue?" }, 700);
  };

  const handleConfirmEmptyProceedYes = () => {
    echoUser('Yes, continue anyway');
    advanceThen(flow.startSynthesis, { [kindField]: 'processing', sessionId: flow.session?.id }, 600);
  };

  const handleConfirmEmptyProceedNo = () => {
    echoUser("No, I'll wait");
    thinkThen({ [kindField]: 'text', text: "No worries — I'll keep the hub open above. Let me know when you're ready to try again." }, 600);
  };

  const handleCompleteSynthesis = async () => {
    await flow.completeSynthesis();
    pushMessage({ role: 'bot', [kindField]: 'result', text: "Here's what I've put together:", sessionId: flow.session?.id });
  };

  const handleApprove = () => {
    echoUser('Approve itinerary');
    advanceThen(flow.approve, { [kindField]: 'closed', text: "You're all set! Here's your itinerary:", sessionId: flow.session?.id }, 750);
  };

  // Edit-after-approve loop — lets the organizer catch a mistake even after
  // confirming. Re-sends the same "here's what I've put together" turn
  // (recommendation state is untouched), so onApprove can fire again and
  // this can loop as many times as needed.
  const handleEditAfterApprove = () => {
    echoUser('Edit itinerary');
    advanceThen(flow.reopenForEdit, { [kindField]: 'result', text: "Sure, let's fix that up. Here's the plan again:", sessionId: flow.session?.id }, 600);
  };

  // Everyone-deferred edge case's "give it more time" path — drops the
  // organizer back into the live hub to keep collecting responses instead
  // of forcing a pick right away.
  const handleExtendRound = () => {
    echoUser('Extend the round');
    advanceThen(flow.enterHub, { [kindField]: 'hub', text: "Sure — I'll keep listening for responses. Come back whenever you're ready.", sessionId: flow.session?.id }, 600);
  };

  // Risk-override edge case — picking either choice card echoes what was
  // selected as its own chat turn, then plays the same processing/"thinking"
  // beat as the main synthesis flow before landing on the resolved dashboard.
  const handleChooseRiskOption = (item, isFlaggedChoice, flaggedPick) => {
    const label = isFlaggedChoice
      ? `Continue with ${item.destination} despite the flagged risk`
      : `Go with ${item.destination} instead`;
    echoUser(label);
    flow.startRiskChoiceResolution(item, isFlaggedChoice, flaggedPick);
    thinkThen({ [kindField]: 'risk_processing', sessionId: flow.session?.id }, 500);
  };

  const handleCompleteRiskChoiceResolution = () => {
    flow.completeRiskChoiceResolution();
    pushMessage({ role: 'bot', [kindField]: 'result', text: "Here's what I've put together:", sessionId: flow.session?.id });
  };

  return {
    thinkThen,
    handleLaunchSyncMode,
    handleTripFormSubmit,
    handleEnterHub,
    handleProceedToSynthesis,
    handleEmptyProceedAttempt,
    handleConfirmEmptyProceedYes,
    handleConfirmEmptyProceedNo,
    handleCompleteSynthesis,
    handleApprove,
    handleEditAfterApprove,
    handleExtendRound,
    handleChooseRiskOption,
    handleCompleteRiskChoiceResolution,
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
