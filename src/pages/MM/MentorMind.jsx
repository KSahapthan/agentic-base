// src/pages/MM/MentorMind.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ActionButtons from '../../components/MentorMind/ActionButtons';
import EvalAgent from '../../components/MentorMind/EvalAgent';
import './MentorMind.css';

// define a functional React component
const MentorMind = () => {
  // global state
  const [currentSkillId, setCurrentSkillId] = useState(null);
  // below contains current topic and subtopic details
  const [skillDetails, setSkillDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [allSubtopics, setAllSubtopics] = useState([]);
  // Quiz-related state
  // 'idle', 'learning', 'question', 'evaluation'
  const [quizState, setQuizState] = useState('idle'); 
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);


  // Load saved skill ID on mount (only once)
  useEffect(() => {
    const savedId = localStorage.getItem('currentSkillId');
    if (savedId) {
      setCurrentSkillId(savedId);
    }
    setIsLoading(false);
  }, []);

  // Fetch current topic and subtopic when skill changes
  useEffect(() => {
    if (!currentSkillId) {
      setSkillDetails(null);
      return;
    }
    const fetchCurrentTopic = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
        console.log('Skill details response:', response.data);
        setSkillDetails(response.data);
      } catch (err) {
        console.error('Error fetching current topic:', err);
        console.error('Error details:', err.response?.data || err.message);
        setSkillDetails({
          skill_name: 'Error loading skill',
          current_topic: 'Error loading topic',
          current_topic_id: 'Error loading topic ID',
          current_subtopic_id: 'Error loading subtopic ID',
          current_subtopic_name: 'Error loading subtopic name',
          current_subtopic_index: 0,
          focus_areas: "",
          current_subtopic_description: "",
          user_context: ""
        });
      }
    };
    fetchCurrentTopic();
  }, [currentSkillId]);

  // Helper function to reset quiz state
  const resetQuizState = () => {
    setQuizState('idle');
    setCurrentQuestion(null);
    setUserAnswer('');
    setEvaluation(null);
    setCurrentQuestionNumber(1);
    setShowContinueButton(false);
    setCorrectAnswersCount(0);
  };

  // Handler to update skill ID
  const handleSkillChange = (skillId) => {
    // Debug log
    console.log('Updating skill ID to:', skillId); 
    // Reset quiz state when changing skills
    resetQuizState();
    // Update skill ID
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

  // Load topic data and subtopics
  const loadTopicData = async () => {
    if (!currentSkillId || !skillDetails?.current_topic_id) return;
    try {
      const planResponse = await axios.get(
        `http://127.0.0.1:8000/plan/get-topic-data/${currentSkillId}/${skillDetails.current_topic_id}`
      );
      const topicData = planResponse.data;
      setAllSubtopics(topicData.subtopics || []);
      return topicData;
    } catch (error) {
      console.error('Error loading topic data:', error);
      return null;
    }
  };

  // Quiz functionality to generate all questions for current subtopic
  const startLearning = async () => {
    if (!currentSkillId || !skillDetails) return;
    setQuizState('learning');
    setShowContinueButton(false);
    try {
      // Load topic data first
      const topicData = await loadTopicData();
      if (!topicData || !topicData.subtopics || topicData.subtopics.length === 0) {
        alert('No subtopics found for this topic. Please check your learning plan.');
        return;
      }
      // Continue with current_subtopic_index
      setCorrectAnswersCount(0); 
      await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
        skill_id: currentSkillId,
        topic_id: skillDetails.current_topic_id,
        subtopic_id: skillDetails.current_subtopic_id,
        subtopic_name: skillDetails.current_subtopic_name,
        subtopic_description: skillDetails.current_subtopic_description,
        focus_areas: skillDetails.focus_areas,
        user_context: skillDetails.user_context,
        current_mastery: 50,
      });
      setCurrentQuestionNumber(1);
      loadQuestion(1, skillDetails);
    } catch (error) {
      console.error('Error starting learning:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error starting learning: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Load a specific question
  const loadQuestion = async (questionNumber , updatedDetails) => {
    console.log(`Loading question ${questionNumber} for subtopic id: ${updatedDetails.current_subtopic_id}`);
    try {
      const response = await axios.post('http://127.0.0.1:8000/quiz/get-question', {
        skill_id: currentSkillId,
        topic_id: updatedDetails.current_topic_id,
        subtopic_id: updatedDetails.current_subtopic_id,
        question_number: questionNumber
      });
      console.log(`Question loaded successfully from subtopic ${updatedDetails.current_subtopic_id}`);
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

  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    setQuizState('evaluation');
    setShowContinueButton(false); 
    try {
      const response = await axios.post('http://127.0.0.1:8000/evaluate/evaluate', {
        true_answer: currentQuestion.A,
        user_answer: userAnswer,
        give_feedback: false
      });
      setEvaluation(response.data.evaluation);
      if (response.data.evaluation.evaluation === '1') {
        setCorrectAnswersCount(prev => prev + 1);
      }
      // Only show continue button after evaluation is completely rendered
      // Use a slight delay to ensure the evaluation component has finished rendering
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setShowContinueButton(false); // Keep button hidden on error
    }
  };

  // Proceed to next question or handle subtopic completion
  const nextQuestion = async () => {
    if (currentQuestionNumber < 5) {
      // Move to next question in current subtopic
      const nextNumber = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextNumber);
      loadQuestion(nextNumber, skillDetails);
    } else {
      // All questions completed for this subtopic
      try {
        console.log('DEBUG: Attempting to complete subtopic:', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: skillDetails.current_subtopic_id,
          allSubtopicsLength: allSubtopics.length
        });
        // Safety check: ensure we have a valid subtopic ID
        if (!skillDetails.current_subtopic_id) {
          console.error('ERROR: currentSubtopicId is null or undefined');
          alert('Error: Current subtopic ID is missing. Please restart the learning session.');
          return;
        }
        // update mastery
        await axios.post('http://127.0.0.1:8000/db/update-subtopic-mastery', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: skillDetails.current_subtopic_id,
          correct_answers: correctAnswersCount,
          total_questions: 5
        });
        // Mark current subtopic as completed and get the next details
        const progressResponse = await axios.post('http://127.0.0.1:8000/db/mark-subtopic-completed', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: skillDetails.current_subtopic_id
        });
        console.log(`Subtopic ${skillDetails.current_subtopic_id} completed! Correct answers: ${correctAnswersCount}/5`);
        const { current_topic_id } = progressResponse.data;
        const all_topics_completed = (current_topic_id === null);
        if (all_topics_completed) {
          // All topics completed
          setQuizState('idle');
          setShowContinueButton(false);
          alert(`🎉 Congratulations! You have completed all topics for this skill. Final score: ${correctAnswersCount}/5 correct answers in the last subtopic. Great job!`);
        } else if (current_topic_id !== skillDetails.current_topic_id) {
          // Moved to next topic
          console.log(`Moved to next topic: ${current_topic_id}`);
          // Update skill details
          const newSkillDetails = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
          setSkillDetails(newSkillDetails.data);
          const updated = newSkillDetails.data;
          // Load new topic data
          const topicData = await loadTopicData();
          if (topicData && topicData.subtopics && topicData.subtopics.length > 0) {
            setAllSubtopics(topicData.subtopics);
            setCorrectAnswersCount(0);
            // Set loading state before generating quiz
            setQuizState('learning');
            // Generate quiz for first subtopic of new topic
            await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
              skill_id: currentSkillId,
              topic_id: updated.current_topic_id,
              subtopic_id: updated.current_subtopic_id,
              subtopic_name: updated.current_subtopic_name,
              subtopic_description: updated.current_subtopic_description,
              focus_areas: updated.focus_areas,
              user_context: updated.user_context,
              current_mastery: 0
            });
            setCurrentQuestionNumber(1);
            setQuizState('question');
            setUserAnswer('');
            setEvaluation(null);
            setShowContinueButton(false);
            loadQuestion(1, updated);
          }
        } else {
          // Moved to next subtopic in same topic
          // Update skill details
          const newSkillDetails = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
          setSkillDetails(newSkillDetails.data);
          const updated = newSkillDetails.data;
          const nextSubtopicIndex = updated.current_subtopic_index;
          if (nextSubtopicIndex < allSubtopics.length) {
            console.log(`Moving to next subtopic: ${nextSubtopicIndex + 1}/${allSubtopics.length}`);
            const nextSubtopic = allSubtopics[nextSubtopicIndex];
            console.log('DEBUG: Next subtopic:', nextSubtopic);
            setCorrectAnswersCount(0);
            setQuizState('learning');
            // Generate quiz for next subtopic
            await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
              skill_id: currentSkillId,
              topic_id: updated.current_topic_id,
              subtopic_id: updated.current_subtopic_id,
              subtopic_name: updated.current_subtopic_name,
              subtopic_description: updated.current_subtopic_description,
              focus_areas: updated.focus_areas,
              user_context: updated.user_context,
              current_mastery: 0
            });
            setCurrentQuestionNumber(1);
            setQuizState('question');
            setUserAnswer('');
            setEvaluation(null);
            setShowContinueButton(false);
            loadQuestion(1, updated);
          }
        }
      } catch (error) {
        console.error('Error completing subtopic:', error);
        console.error('Error details:', {
          response: error.response?.data,
          status: error.response?.status,
          message: error.message,
          currentSubtopicId: skillDetails.current_subtopic_id,
          skillDetails
        });
        alert(`Error completing subtopic: ${error.response?.data?.detail || error.message}`);
      }
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

  // main render
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
              onKeyDown={handleKeyPress}
              placeholder="Ask questions or get hints from the AI tutor here"
              disabled={isLoadingResponse}
            />
          </div>
          
          {/* Response Box - Now with Markdown rendering */}
          <div className="chat-response-box">
            {isLoadingResponse ? (
              'AI tutor is thinking...'
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Custom styling for different elements
                  p: ({ children }) => <p style={{ margin: '0 0 12px 0', lineHeight: '1.6' }}>{children}</p>,
                  h1: ({ children }) => <h1 style={{ fontSize: '1.4rem', margin: '0 0 16px 0', fontWeight: 'bold' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '1.2rem', margin: '0 0 14px 0', fontWeight: 'bold' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', fontWeight: 'bold' }}>{children}</h3>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code style={{ 
                        backgroundColor: '#f4f4f4', 
                        padding: '2px 4px', 
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em'
                      }}>
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre style={{ 
                      backgroundColor: '#f4f4f4', 
                      padding: '12px', 
                      borderRadius: '6px',
                      overflow: 'auto',
                      margin: '0 0 12px 0',
                      fontSize: '0.9em',
                      lineHeight: '1.4'
                    }}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote style={{ 
                      borderLeft: '4px solid #c1a45f', 
                      paddingLeft: '12px', 
                      margin: '0 0 12px 0',
                      fontStyle: 'italic',
                      color: '#666'
                    }}>
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: '#3a393f' }}>{children}</strong>,
                  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>
                }}
              >
                {aiResponse}
              </ReactMarkdown>
            )}
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
        
        {/* Current Subtopic and Question Info */}
        {currentSkillId && skillDetails && (
          <div className="current-skill-info">
            <span className="subtopic-id">Subtopic {skillDetails.current_subtopic_index + 1}</span>
            <span className="separator">•</span>
            <span className="subtopic-name">{skillDetails.current_subtopic_name || allSubtopics[skillDetails.current_subtopic_index]?.name || 'Loading...'}</span>
            {currentQuestion && (
              <>
                <span className="separator">•</span>
                <span className="question-info">Question {currentQuestionNumber}/5</span>
                <span className="separator">•</span>
                <span className="question-info" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Correct: {correctAnswersCount}/5
                </span>
              </>
            )}
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
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                      {skillDetails.current_subtopic_index === 0 ? 'Preparing your first quiz' : `Loading questions for subtopic ${skillDetails.current_subtopic_index + 1}`}
                    </p>
                  </div>
                )}
                
                {currentQuestion && (
                  <div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ children }) => <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>{children}</p>,
                        h1: ({ children }) => <h1 style={{ fontSize: '1.4rem', margin: '0 0 16px 0', fontWeight: 'bold' }}>{children}</h1>,
                        h2: ({ children }) => <h2 style={{ fontSize: '1.2rem', margin: '0 0 14px 0', fontWeight: 'bold' }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', fontWeight: 'bold' }}>{children}</h3>,
                        ul: ({ children }) => <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code style={{ 
                              backgroundColor: '#f4f4f4', 
                              padding: '2px 4px', 
                              borderRadius: '3px',
                              fontFamily: 'monospace',
                              fontSize: '0.9em'
                            }}>
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre style={{ 
                            backgroundColor: '#f4f4f4', 
                            padding: '12px', 
                            borderRadius: '6px',
                            overflow: 'auto',
                            margin: '0 0 12px 0',
                            fontSize: '0.9em',
                            lineHeight: '1.4'
                          }}>
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote style={{ 
                            borderLeft: '4px solid #c1a45f', 
                            paddingLeft: '12px', 
                            margin: '0 0 12px 0',
                            fontStyle: 'italic',
                            color: '#666'
                          }}>
                            {children}
                          </blockquote>
                        ),
                        strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: '#3a393f' }}>{children}</strong>,
                        em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>
                      }}
                    >
                      {currentQuestion.Q}
                    </ReactMarkdown>
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
                  disabled={quizState === 'question' || quizState === 'learning'}  // Disable if still on question or generating quiz
                  style={{
                    backgroundColor: (quizState === 'question' || quizState === 'learning') ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: (quizState === 'question' || quizState === 'learning') ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    opacity: (quizState === 'question' || quizState === 'learning') ? 0.6 : 1
                  }}
                >
                  {currentQuestionNumber < 5 ? 'Next Question →' : 
                   (skillDetails.current_subtopic_index + 1 < allSubtopics.length ? 'Next Subtopic →' : 'Complete Topic →')}
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
        <EvalAgent 
          evaluation={evaluation}
          userAnswer={userAnswer}
          currentQuestion={currentQuestion}
        />
      </div>
    </div>
  );
};

export default MentorMind;
