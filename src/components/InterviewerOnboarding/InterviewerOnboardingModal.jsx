import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Layers, ShieldCheck, ChevronRight, X, Play, BookOpen } from 'lucide-react';
import './InterviewerOnboarding.css';

const InterviewerOnboardingModal = ({ isOpen, onClose, onStartDemo }) => {
  const [activeTab, setActiveTab] = useState('insights');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="evaluator-modal-backdrop" onClick={onClose}>
        <motion.div
          className="evaluator-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="evaluator-modal-header">
            <div className="evaluator-header-badge">
              <Sparkles size={13} /> Interviewer Context & Overview
            </div>
            <button type="button" className="evaluator-modal-close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <h2 className="evaluator-title">AI Group Travel Planner</h2>
          <p className="evaluator-subtitle">
            MakeMyTrip Take-Home Design Exercise • UX Research & Interactive Prototype
          </p>

          {/* Navigation Tabs */}
          <div className="evaluator-tabs">
            <button
              type="button"
              className={`evaluator-tab ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <Users size={14} /> Research Insights
            </button>
            <button
              type="button"
              className={`evaluator-tab ${activeTab === 'solution' ? 'active' : ''}`}
              onClick={() => setActiveTab('solution')}
            >
              <Layers size={14} /> Solution Architecture
            </button>
            <button
              type="button"
              className={`evaluator-tab ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              <Play size={14} /> Demo Guide
            </button>
          </div>

          {/* Tab Content */}
          <div className="evaluator-tab-body">
            {activeTab === 'insights' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-pane"
              >
                <div className="insight-highlight-box">
                  <span className="insight-tag">Core Finding</span>
                  <p className="insight-quote">
                    "Group coordination friction isn't disagreement — it's the manual, synchronous labor of collecting divergent input across long WhatsApp threads."
                  </p>
                </div>

                <div className="insights-grid">
                  <div className="insight-card">
                    <h4>1. Trust Built via Evidence</h4>
                    <p>Users don't trust black-box AI scores. Trust is established by citing Reddit, Google Reviews, and participant votes.</p>
                  </div>
                  <div className="insight-card">
                    <h4>2. Asynchronous Over Realtime</h4>
                    <p>Forcing everyone to join a live session fails. A zero-login shareable link allows friends to contribute in 2 minutes on their own time.</p>
                  </div>
                  <div className="insight-card">
                    <h4>3. Unstated Constraint Inference</h4>
                    <p>The AI automatically maps travel effort → transport mode, dealbreakers → stay type, and vibe test → activity list.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'solution' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-pane"
              >
                <div className="solution-flow-steps">
                  <div className="solution-step">
                    <span className="step-num">1</span>
                    <div>
                      <h4>Organizer Setup (MyRA Assistant)</h4>
                      <p>Organizer opens MyRA, specifies group size, date window, and budget per person to generate a share link.</p>
                    </div>
                  </div>
                  <div className="solution-step">
                    <span className="step-num">2</span>
                    <div>
                      <h4>Async Participant Flow (No Install)</h4>
                      <p>Friends tap the WhatsApp link, complete 4 visual preference cards in 2 minutes, or tap "Just surprise me".</p>
                    </div>
                  </div>
                  <div className="solution-step">
                    <span className="step-num">3</span>
                    <div>
                      <h4>Live Aggregation Hub</h4>
                      <p>Realtime status updates show who has responded and tallies group vibe preferences automatically.</p>
                    </div>
                  </div>
                  <div className="solution-step">
                    <span className="step-num">4</span>
                    <div>
                      <h4>5-Accordion Synthesis Dashboard</h4>
                      <p>Reconciles Dates, Getting There, Stay, Activities, and Resolved Summary with 1-click option editing & Reddit proof.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'guide' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tab-pane"
              >
                <div className="guide-card">
                  <h3>How to Test the Interactive Demo:</h3>
                  <ol className="guide-list">
                    <li>Click <strong>"Start Interactive Prototype"</strong> below.</li>
                    <li>Look for the <strong>glowing blue beacon</strong> pointing to the floating <strong>MyRA AI Assistant</strong> at the bottom right.</li>
                    <li>Click MyRA and type <em>"planning a trip with my friends"</em> (or tap the quick prompt).</li>
                    <li>Follow the organizer setup, generate the share link, and test the <strong>Live Aggregation Hub</strong> & <strong>5-Accordion Synthesis</strong> dashboard!</li>
                  </ol>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Action */}
          <div className="evaluator-modal-footer">
            <button
              type="button"
              className="evaluator-start-btn"
              onClick={() => {
                onStartDemo();
                onClose();
              }}
            >
              Start Interactive Prototype <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewerOnboardingModal;
