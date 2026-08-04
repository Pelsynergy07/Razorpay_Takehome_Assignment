import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import './InterviewerOnboarding.css';

const PRESENTATION_URL = 'https://razorpay-presentation.vercel.app/';

const easeOut = [0.16, 1, 0.3, 1];

// Global slow-down factor applied to every duration/stagger/gap below (25% slower).
const SPEED = 1.25;
const s = (seconds) => seconds * SPEED;

// How long the card's height-expand animation takes (kept in sync with the
// `.evaluator-rest-grid` grid-template-rows transition duration in the CSS —
// a pure CSS grid-rows reveal, not a transform/scale-based layout animation,
// so the text never gets stretched/squished while the box grows).
const CARD_EXPAND_S = s(0.5);

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: s(0.4), ease: easeOut },
  },
};

const WORD_DURATION = s(0.4);

const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: WORD_DURATION, ease: easeOut } },
};

const wordsContainer = (startDelay, stagger) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: startDelay } },
});

const Word = ({ children, bold }) => (
  <motion.span variants={wordVariants} style={{ display: 'inline-block' }}>
    {bold ? <strong>{children}</strong> : children}
  </motion.span>
);

const waveVariants = {
  wave: {
    rotate: [0, 16, -6, 16, -4, 10, 0],
    transition: { duration: 1.1, ease: easeOut },
  },
};

// Fades in with the rest of the "Hello there!" cascade (inherits the "visible"
// state from the words container), then waves a few times and stops.
const WavingHand = () => (
  <motion.span variants={wordVariants} style={{ display: 'inline-block', marginLeft: '2px' }}>
    <motion.span
      animate="wave"
      variants={waveVariants}
      style={{ display: 'inline-block', transformOrigin: '70% 70%' }}
    >
      👋
    </motion.span>
  </motion.span>
);

const countWords = (chunks) => chunks.reduce((n, c) => n + c.text.split(' ').length, 0);

const renderChunks = (chunks, keyPrefix) => {
  const nodes = [];
  chunks.forEach((chunk, ci) => {
    chunk.text.split(' ').forEach((word, wi) => {
      nodes.push(
        <Word key={`${keyPrefix}-${ci}-${wi}`} bold={chunk.bold}>
          {word}
        </Word>
      );
      nodes.push(' ');
    });
  });
  return nodes;
};

const HELLO_STAGGER = s(0.06);
const GREETING_STAGGER = s(0.05);
const PARAGRAPH_STAGGER = s(0.022);

const HELLO_CHUNKS = [{ text: 'Hello there!' }];
// +1 for the waving hand, which staggers in right after the text as one more item.
const HELLO_ITEM_COUNT = countWords(HELLO_CHUNKS) + 1;
const GREETING_CHUNKS = [{ text: 'Thanks for taking the time to go through this demo!' }];

const HELLO_START = s(0.15);
const HELLO_END = HELLO_START + (HELLO_ITEM_COUNT - 1) * HELLO_STAGGER + WORD_DURATION;

// A deliberate beat after "Hello there!" finishes before the greeting line starts.
const POST_HELLO_PAUSE_S = 0.3;
const GREETING_START = HELLO_END + POST_HELLO_PAUSE_S;
const GREETING_END = GREETING_START + (countWords(GREETING_CHUNKS) - 1) * GREETING_STAGGER + WORD_DURATION;

// A deliberate 1.5s beat after "Hello! / <greeting line>" finishes before the
// rest of the modal starts expanding in.
const POST_GREETING_PAUSE_S = 1;
const DETAILS_MOUNT_MS = (GREETING_END + POST_GREETING_PAUSE_S) * 1000;

// Detail text starts cascading in while the card's expand animation is most
// of the way done, so the words land right as the rectangle finishes growing.
const PARA_1_START = CARD_EXPAND_S * 0.7;

const PARAGRAPH_1_CHUNKS = [
  { text: 'This is a demo showcasing the' },
  { text: '"Group Sync Mode"', bold: true },
  { text: 'of Myra, the AI travel agent of MakeMyTrip. This new feature lets a trip organizer' },
  { text: "collect everyone's preferences without a group chat back-and-forth", bold: true },
  { text: 'and presents with options that work for everyone.' },
];

const PARAGRAPH_2_CHUNKS = [
  { text: 'This demo' },
  { text: 'directly showcases the flow of this proposed feature.', bold: true },
  { text: 'To get more context about this, please refer to the' },
];

const PARA_2_START = PARA_1_START + countWords(PARAGRAPH_1_CHUNKS) * PARAGRAPH_STAGGER + s(0.15);
// The link line has the paragraph-2 words, plus the link itself as one final token.
const BUTTON_START = PARA_2_START + (countWords(PARAGRAPH_2_CHUNKS) + 1) * PARAGRAPH_STAGGER + s(0.2);

const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: WORD_DURATION, ease: easeOut, delay: BUTTON_START } },
};

const InterviewerOnboardingModal = ({ isOpen, onClose, onStartDemo }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setShowDetails(false);
      return undefined;
    }
    const timer = setTimeout(() => setShowDetails(true), DETAILS_MOUNT_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="evaluator-modal-backdrop" onClick={onClose}>
        <motion.div
          className="evaluator-modal-card"
          onClick={(e) => e.stopPropagation()}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.25, ease: easeOut } }}
        >
          <button type="button" className="evaluator-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>

          <div className="evaluator-greeting-block">
            <motion.p
              className="evaluator-hello"
              initial="hidden"
              animate="visible"
              variants={wordsContainer(HELLO_START, HELLO_STAGGER)}
            >
              {renderChunks(HELLO_CHUNKS, 'hello')}
              <WavingHand />
            </motion.p>
            <motion.p
              className="evaluator-greeting"
              initial="hidden"
              animate="visible"
              variants={wordsContainer(GREETING_START, GREETING_STAGGER)}
            >
              {renderChunks(GREETING_CHUNKS, 'greeting')}
            </motion.p>
          </div>

          <div className={`evaluator-rest-grid${showDetails ? ' is-expanded' : ''}`}>
            <div className="evaluator-rest-grid-inner">
              <div className="evaluator-rest-block">
                <motion.p
                  className="evaluator-context"
                  initial="hidden"
                  animate={showDetails ? 'visible' : 'hidden'}
                  variants={wordsContainer(PARA_1_START, PARAGRAPH_STAGGER)}
                >
                  {renderChunks(PARAGRAPH_1_CHUNKS, 'p1')}
                </motion.p>

                <motion.p
                  className="evaluator-context evaluator-presentation-link-line"
                  initial="hidden"
                  animate={showDetails ? 'visible' : 'hidden'}
                  variants={wordsContainer(PARA_2_START, PARAGRAPH_STAGGER)}
                >
                  {renderChunks(PARAGRAPH_2_CHUNKS, 'p2')}
                  <motion.span variants={wordVariants} style={{ display: 'inline-block' }}>
                    <a
                      href={PRESENTATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evaluator-presentation-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      project presentation <ExternalLink size={12} />
                    </a>
                  </motion.span>
                  .
                </motion.p>

                <motion.button
                  type="button"
                  className="evaluator-start-btn"
                  initial="hidden"
                  animate={showDetails ? 'visible' : 'hidden'}
                  variants={buttonVariants}
                  onClick={() => {
                    onStartDemo();
                    onClose();
                  }}
                >
                  <Sparkles size={15} /> Start the demo
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewerOnboardingModal;
