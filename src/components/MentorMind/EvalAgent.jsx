// src/components/MentorMind/EvalAgent.jsx
import React from 'react';
import './EvalAgent.css';

const EvalAgent = ({ evaluation, userAnswer, currentQuestion }) => {
  return (
    <div className="panel-content">
      {evaluation ? (
        <div>
          <div className="eval-feedback-container">
            <p><strong>Your Answer:</strong> {userAnswer}</p>
            <p><strong>Correct Answer:</strong> {currentQuestion?.A}</p>
            <p className={`eval-result ${evaluation.evaluation === '1' ? 'correct' : 'incorrect'}`}>
              {evaluation.evaluation === '1' ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            {evaluation.feedback && (
              <div className="eval-feedback">
                <p><strong>AI Feedback:</strong></p>
                <p className="feedback-text">
                  {evaluation.feedback}
                </p>
              </div>
            )}
            {currentQuestion?.E && (
              <div className="eval-explanation">
                <p><strong>Explanation:</strong></p>
                <p className="explanation-text">
                  {currentQuestion.E}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>AI feedback and explanations will be displayed here</p>
      )}
    </div>
  );
};

export default EvalAgent;
