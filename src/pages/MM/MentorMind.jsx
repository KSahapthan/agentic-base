import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionButtons from '../../components/MentorMind/ActionButtons';
import './MentorMind.css';

// define a functional React component
const MentorMind = () => {
  const [currentSkillId, setCurrentSkillId] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  
  // Quiz-related state
  const [quizState, setQuizState] = useState('idle'); // 'idle', 'learning', 'question', 'evaluation'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Load saved skill ID on mount (only once)
  useEffect(() => {
    const savedId = localStorage.getItem('currentSkillId');
    if (savedId) {
      setCurrentSkillId(savedId);
    }
    setIsLoading(false);
  }, []);

  // Fetch current topic when skill changes
  useEffect(() => {
    if (!currentSkillId) {
      setSkillDetails(null);
      return;
    }

    const fetchCurrentTopic = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
        setSkillDetails(response.data);
      } catch (err) {
        console.error('Error fetching current topic:', err);
        setSkillDetails({
          skill_name: 'Error loading skill',
          current_topic: 'Error loading topic',
          current_topic_id: 'Error loading topic ID'
        });
      }
    };
    fetchCurrentTopic();
  }, [currentSkillId]);

  // Handler to update skill ID
  const handleSkillChange = (skillId) => {
    // Debug log
    console.log('Updating skill ID to:', skillId); 
    setCurrentSkillId(skillId);
    if (skillId) {
      localStorage.setItem('currentSkillId', skillId);
    } else {
      localStorage.removeItem('currentSkillId');
    }
  };

  // Add effect to monitor state changes
  useEffect(() => {
    console.log('Current skill ID changed to:', currentSkillId);
  }, [currentSkillId]);

  // Handle chat submission
  const handleChatSubmit = async () => {
    if (!userQuery.trim()) return;
    
    setIsLoadingResponse(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/chat/ask', {
        user_query: userQuery,
        skill_id: currentSkillId
      });
      setAiResponse(response.data.response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Handle Enter key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e) => {
    setUserQuery(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Quiz functionality
  const startLearning = async () => {
    if (!currentSkillId || !skillDetails) return;
    
    setQuizState('learning');
    setShowContinueButton(false);
    
    try {
      // Generate quiz for current topic
      const response = await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
        skill_id: currentSkillId,
        topic_id: skillDetails.current_topic_id,
        subtopic_name: skillDetails.current_topic,
        subtopic_description: `Learning about ${skillDetails.current_topic}`,
        focus_areas: ['understanding', 'application'],
        user_context: 'Interactive learning session',
        current_mastery: 50
      });
      
      setQuizData(response.data.quiz_data);
      setCurrentQuestionNumber(1);
      loadQuestion(1);
    } catch (error) {
      console.error('Error starting learning:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error starting learning: ${error.response?.data?.detail || error.message}`);
    }
  };

  const loadQuestion = async (questionNumber) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/quiz/get-question', {
        skill_id: currentSkillId,
        question_number: questionNumber
      });
      
      setCurrentQuestion(response.data.question);
      setQuizState('question');
      setUserAnswer('');
      setEvaluation(null);
    } catch (error) {
      console.error('Error loading question:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error loading question: ${error.response?.data?.detail || error.message}`);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    
    setQuizState('evaluation');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/evaluate/evaluate', {
        true_answer: currentQuestion.A,
        user_answer: userAnswer,
        give_feedback: false
      });
      
      setEvaluation(response.data.evaluation);
      setShowContinueButton(true);
    } catch (error) {
      console.error('Error evaluating answer:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionNumber < 5) {
      const nextNumber = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextNumber);
      loadQuestion(nextNumber);
    } else {
      // All questions completed for this subtopic
      setQuizState('idle');
      setShowContinueButton(true);
      // TODO: Move to next subtopic or topic
    }
  };

  // Auto-resize for quiz answer textarea
  const handleQuizAnswerChange = (e) => {
    setUserAnswer(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  if (isLoading) {
    return (
      <div className="mentormind-container loading">
        <div>Loading your learning progress...</div>
      </div>
    );
  }

  return (
    <div className="mentormind-container">
      {/* Left Section — Hint / Chat */}
      <div className="mentormind-panel left-panel">
        <h2 className="panel-title">Hint (or) Chat</h2>
        <ActionButtons 
          onSkillSelect={handleSkillChange}
          currentSkillId={currentSkillId}
        />
        
        {/* Chat Container */}
        <div className="chat-container">
          {/* Input Box */}
          <div className="chat-input-box">
            <textarea
              value={userQuery}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask questions or get hints from the AI tutor here"
              disabled={isLoadingResponse}
            />
          </div>
          
          {/* Response Box */}
          <div className="chat-response-box">
            <div className="chat-response-content">
              {isLoadingResponse ? 'AI tutor is thinking...' : aiResponse}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section — Learn / Quiz */}
      <div className="mentormind-panel middle-panel">
        <h2 className="panel-title">Learn (or) Quiz</h2>
        {currentSkillId && skillDetails && (
          <div className="current-skill-info">
            <span className="skill-id">{currentSkillId}</span>
            <span className="separator">•</span>
            <span className="skill-name">{skillDetails.skill_name}</span>
            <span className="separator">•</span>
            <span className="topic-id">{skillDetails.current_topic_id}</span>
            <span className="separator">•</span>
            <span className="topic-name">{skillDetails.current_topic}</span>
          </div>
        )}
        
        {/* Quiz Container */}
        {currentSkillId ? (
          <div className="quiz-container">
            {/* Quiz Question Box */}
            <div className="quiz-question-box">
              <div className="quiz-question-content">
                {quizState === 'idle' && !showContinueButton && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Ready to continue learning?</p>
                    <button 
                      onClick={startLearning}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      Want to continue learning →
                    </button>
                  </div>
                )}
                
                {quizState === 'learning' && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Generating quiz questions...</p>
                  </div>
                )}
                
                {currentQuestion && (
                  <div>
                    <h3>Question {currentQuestionNumber}/5</h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                      {currentQuestion.Q}
                    </p>
                  </div>
                )}
                
                {evaluation && (
                  <div>
                    <h3>Evaluation Result</h3>
                    <p style={{ 
                      color: evaluation.evaluation === '1' ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {evaluation.evaluation === '1' ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    {evaluation.feedback && (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>
                        {evaluation.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quiz Answer Box */}
            {quizState === 'question' && (
              <div className="quiz-answer-box">
                <textarea
                  value={userAnswer}
                  onChange={handleQuizAnswerChange}
                  placeholder="Enter your answer here..."
                  disabled={quizState === 'evaluation'}
                />
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || quizState === 'evaluation'}
                    style={{
                      backgroundColor: '#a08605c1',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
            
            {/* Continue Button */}
            {showContinueButton && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={nextQuestion}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {currentQuestionNumber < 5 ? 'Next Question →' : 'Complete Subtopic →'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="panel-content">
            <p>Select an existing skill or create a skill to start learning</p>
          </div>
        )}
      </div>

      {/* Right Section — Feedback / Explanations */}
      <div className="mentormind-panel right-panel">
        <h2 className="panel-title">Feedback (or) Answers</h2>
        <div className="panel-content">
          {evaluation ? (
            <div>
              <h3>Evaluator Feedback</h3>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '8px',
                marginTop: '8px'
              }}>
                <p><strong>Your Answer:</strong> {userAnswer}</p>
                <p><strong>Correct Answer:</strong> {currentQuestion?.A}</p>
                <p style={{ 
                  color: evaluation.evaluation === '1' ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold',
                  marginTop: '8px'
                }}>
                  {evaluation.evaluation === '1' ? '✅ Correct!' : '❌ Incorrect'}
                </p>
                {evaluation.feedback && (
                  <div style={{ marginTop: '12px' }}>
                    <p><strong>AI Feedback:</strong></p>
                    <p style={{ fontStyle: 'italic', color: '#666' }}>
                      {evaluation.feedback}
                    </p>
                  </div>
                )}
                {currentQuestion?.E && (
                  <div style={{ marginTop: '12px' }}>
                    <p><strong>Explanation:</strong></p>
                    <p style={{ fontStyle: 'italic', color: '#666' }}>
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
      </div>
    </div>
  );
};

export default MentorMind;
